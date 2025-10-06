const config = require('../config/config');
const userService = require('./user.service');
const StreamChat = require('stream-chat').StreamChat;

const getStreamRole = (user) => {
  return ['admin', 'doctor'].includes(user.role) ? 'admin' : 'user';
};

// Initialize Stream Chat client
const chatClient = StreamChat.getInstance(config.stream.key, config.stream.secret);

const createUser = async (user) => {
  try {
    const streamUser = await chatClient.upsertUser({
      id: user.id.toString(),
      name: user.name,
      role: getStreamRole(user)
    });

    // Update user with Stream user ID
    await userService.updateUserById(user.id, { streamUserId: streamUser.id });

    return streamUser;
  } catch (error) {
    console.error('Error creating Stream user:', error);
    // Return a mock response as fallback
    return { id: user.id.toString(), name: user.name };
  }
};

const getUserToken = (userId) => {
  try {
    return chatClient.createToken(userId.toString());
  } catch (error) {
    console.error('Error creating Stream token:', error);
    // Return a mock token as fallback
    return 'mock-token';
  }
};

const createChannel = async (userId, doctorId) => {
  try {
    // Check if the users exist on Stream
    const userIds = [userId.toString(), doctorId.toString()];
    const userResponse = await chatClient.queryUsers({ id: { $in: userIds } });

    // Create any missing users on Stream
    const missingUsers = userIds.filter(userId => !userResponse.users.some(user => user.id === userId));
    for (const missingUserId of missingUsers) {
      const user = await userService.getUserById(missingUserId);
      if (user) {
        await chatClient.upsertUser({
          id: user.id.toString(),
          name: user.name,
          role: getStreamRole(user)
        });
      }
    }

    // Create messaging channel
    const messagingChannel = chatClient.channel('messaging', `${userId}-${doctorId}`, {
      members: [userId.toString(), doctorId.toString()],
      created_by_id: doctorId.toString()
    });
    await messagingChannel.create();

    return messagingChannel.id;
  } catch (error) {
    console.error('Error creating Stream channel:', error);
    // Return a mock channel ID as fallback
    return `mock-channel-${userId}-${doctorId}`;
  }
};

const addMemberToChannel = async (channelId, newUserId) => {
  try {
    // Check if the user exists on Stream
    const userResponse = await chatClient.queryUsers({ id: newUserId.toString() });

    // Create user on Stream if not exists
    if (userResponse.users.length === 0) {
      const user = await userService.getUserById(newUserId);
      if (user) {
        await chatClient.upsertUser({
          id: user.id.toString(),
          name: user.name,
          role: getStreamRole(user)
        });
      }
    }

    // Add member to messaging channel
    const messagingChannel = chatClient.channel('messaging', channelId);
    await messagingChannel.addMembers([newUserId.toString()]);

    return channelId;
  } catch (error) {
    console.error('Error adding member to Stream channel:', error);
    // Return the channel ID as fallback
    return channelId;
  }
};

module.exports = {
  createUser,
  getUserToken,
  createChannel,
  addMemberToChannel
};
