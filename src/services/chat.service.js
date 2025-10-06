const logger = require('../config/logger');
const dbManager = require('../db/dbManager');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const realtimeService = require('./realtime.service');

/**
 * Chat service for handling chat functionality
 */
class ChatService {
  /**
   * Create a new chat room
   * @param {Object} chatData - Chat room data
   * @param {string} chatData.participantIds - Array of participant IDs
   * @param {string} chatData.appointmentId - Associated appointment ID (optional)
   * @returns {Object} Created chat room
   */
  async createChatRoom(chatData) {
    try {
      const chatRoom = {
        id: uuidv4(),
        participant_ids: chatData.participantIds,
        appointment_id: chatData.appointmentId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await dbManager.create('chat_rooms', chatRoom);
      logger.info('Chat room created:', result.id);

      // Emit real-time event
      realtimeService.emit('chatRoomCreated', {
        chatRoom: result
      });

      return result;
    } catch (error) {
      logger.error('Error creating chat room:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create chat room');
    }
  }

  /**
   * Get chat rooms for a user
   * @param {string} userId - User ID
   * @returns {Array} Chat rooms
   */
  async getUserChatRooms(userId) {
    try {
      const chatRooms = await dbManager.find('chat_rooms', {
        participant_ids: userId
      });

      return chatRooms;
    } catch (error) {
      logger.error('Error fetching user chat rooms:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch chat rooms');
    }
  }

  /**
   * Get messages for a chat room
   * @param {string} chatRoomId - Chat room ID
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of messages to return
   * @param {string} options.before - Get messages before this timestamp
   * @returns {Array} Messages
   */
  async getChatMessages(chatRoomId) {
    try {
      const messages = await dbManager.find('chat_messages', {
        chat_room_id: chatRoomId
      }, {
        sortBy: 'created_at:asc'
      });

      return messages;
    } catch (error) {
      logger.error('Error fetching chat messages:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch messages');
    }
  }

  /**
   * Send a message in a chat room
   * @param {Object} messageData - Message data
   * @param {string} messageData.chatRoomId - Chat room ID
   * @param {string} messageData.senderId - Sender user ID
   * @param {string} messageData.content - Message content
   * @returns {Object} Created message
   */
  async sendMessage(messageData) {
    try {
      // Verify user is participant in chat room
      const chatRoom = await dbManager.findById('chat_rooms', messageData.chatRoomId);
      if (!chatRoom) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Chat room not found');
      }

      if (!chatRoom.participant_ids.includes(messageData.senderId)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'User not authorized to send message in this chat room');
      }

      const message = {
        id: uuidv4(),
        chat_room_id: messageData.chatRoomId,
        sender_id: messageData.senderId,
        content: messageData.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await dbManager.create('chat_messages', message);
      logger.info('Message sent:', result.id);

      // Update chat room's updated_at timestamp
      await dbManager.update('chat_rooms', messageData.chatRoomId, {
        updated_at: new Date().toISOString()
      });

      // Emit real-time event
      realtimeService.emit('messageSent', {
        message: result
      });

      return result;
    } catch (error) {
      logger.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Verify if a user has access to a chat room
   * @param {string} userId - User ID
   * @param {string} chatRoomId - Chat room ID
   * @returns {boolean} True if user has access, false otherwise
   */
  async verifyUserAccessToChatRoom(userId, chatRoomId) {
    try {
      const chatRoom = await dbManager.findById('chat_rooms', chatRoomId);
      if (!chatRoom) {
        return false;
      }

      return chatRoom.participant_ids.includes(userId);
    } catch (error) {
      logger.error('Error verifying user access to chat room:', error);
      return false;
    }
  }

  /**
   * Mark messages as read
   * @param {string} chatRoomId - Chat room ID
   * @param {string} userId - User ID
   * @returns {Object} Update result
   */
  async markMessagesAsRead(chatRoomId, userId) {
    try {
      // In a more complex implementation, we might track read status per message per user
      // For now, we'll just update the chat room's updated timestamp
      const result = await dbManager.update('chat_rooms', chatRoomId, {
        updated_at: new Date().toISOString()
      });

      logger.info(`Messages marked as read for user ${userId} in chat room ${chatRoomId}`);
      return result;
    } catch (error) {
      logger.error('Error marking messages as read:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to mark messages as read');
    }
  }
}

module.exports = new ChatService();
