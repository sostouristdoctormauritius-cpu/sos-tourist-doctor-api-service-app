const config = require('../config/config');
const userService = require('./user.service');

const getStreamRole = (user) => {
  return ['admin', 'doctor'].includes(user.role) ? 'admin' : 'user';
};

// Deactivate Stream client initialization due to missing connect function
// const client = connect(config.stream.key, config.stream.secret);

// Deactivate Stream Chat client
// const chatClient = StreamChat.getInstance(config.stream.key, config.stream.secret);

const createUser = async (user) => {
  // Deactivate Stream functionality
  // const streamUser = await chatClient.upsertUser({
  //   id: user.id.toString(),
  //   name: user.name,
  //   role: getStreamRole(user),
  // });

  // Deactivate user update
  // await userService.updateUserById(user.id, { streamUserId: streamUser.id });

  // Return a mock response
  return { id: user.id.toString(), name: user.name };
};

const getUserToken = (userId) => {
  // Deactivate token creation
  // return chatClient.createToken(userId.toString());

  // Return a mock token
  return 'mock-token';
};

const createChannel = async (userId, doctorId) => {
  // Deactivate channel creation
  // Check if the users exist on Stream
  // const userIds = [userId.toString(), doctorId.toString()];
  // const userResponse = await chatClient.queryUsers({ id: { $in: userIds } });

  // Create any missing users on Stream
  // const missingUsers = userIds.filter(userId => !userResponse.users.some(user => user.id === userId));
  // for (const missingUserId of missingUsers) {
  //   const user = await userService.getUserById(missingUserId);
  //   if (user) {
  //     await chatClient.upsertUser({
  //       id: user.id.toString(),
  //       name: user.name,
  //       role: getStreamRole(user),
  //     });
  //   }
  // }

  // Create messaging channel
  // const messagingChannel = chatClient.channel('messaging', `${userId}-${doctorId}`, {
  //   members: [userId.toString(), doctorId.toString()],
  //   created_by_id: doctorId.toString(),
  // });
  // await messagingChannel.create();

  // Return a mock channel ID
  return `mock-channel-${userId}-${doctorId}`;
};

const addMemberToChannel = async (channelId, newUserId) => {
  // Deactivate member addition to channel
  // Check if the user exists on Stream
  // const userResponse = await chatClient.queryUsers({ id: newUserId.toString() });

  // Create user on Stream if not exists
  // if (userResponse.users.length === 0) {
  //   const user = await userService.getUserById(newUserId);
  //   if (user) {
  //     await chatClient.upsertUser({
  //       id: user.id.toString(),
  //       name: user.name,
  //       role: getStreamRole(user),
  //     });
  //   }
  // }

  // Add member to messaging channel
  // const messagingChannel = chatClient.channel('messaging', channelId);
  // await messagingChannel.addMembers([newUserId.toString()]);

  // Return the channel ID
  return channelId;
};

module.exports = {
  createUser,
  getUserToken,
  createChannel,
  addMemberToChannel
};
