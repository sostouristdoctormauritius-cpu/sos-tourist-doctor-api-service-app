const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const chatService = require('../services/chat.service');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const dbManager = require('../db/dbManager');

/**
 * Create a new chat room
 */
const createChatRoom = catchAsync(async (req, res) => {
  const { participantIds, appointmentId } = req.body;
  const userId = req.user?.id;

  // Validate request
  if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 2) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'At least two participants are required'
    });
  }

  // Ensure current user is part of the chat if authenticated
  if (userId && !participantIds.includes(userId)) {
    participantIds.push(userId);
  }

  const chatRoom = await chatService.createChatRoom({
    participantIds,
    appointmentId
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    data: chatRoom
  });
});

/**
 * Get chat rooms for the current user
 */
const getUserChatRooms = catchAsync(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const chatRooms = await chatService.getUserChatRooms(userId);

  res.status(httpStatus.OK).json({
    success: true,
    data: chatRooms
  });
});

/**
 * Get messages for a chat room
 */
const getChatMessages = catchAsync(async (req, res) => {
  const { chatRoomId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Verify user has access to this chat room
  const hasAccess = await chatService.verifyUserAccessToChatRoom(userId, chatRoomId);
  if (!hasAccess) {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      message: 'Access denied to this chat room'
    });
  }

  const messages = await chatService.getChatMessages(chatRoomId);

  res.status(httpStatus.OK).json({
    success: true,
    data: messages
  });
});

/**
 * Send a message in a chat room
 */
const sendMessage = catchAsync(async (req, res) => {
  const { chatRoomId } = req.params;
  const { content } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!content || content.trim() === '') {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Message content is required'
    });
  }

  // Verify user has access to this chat room
  const hasAccess = await chatService.verifyUserAccessToChatRoom(userId, chatRoomId);
  if (!hasAccess) {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      message: 'Access denied to this chat room'
    });
  }

  const message = await chatService.sendMessage({
    chatRoomId,
    senderId: userId,
    content
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    data: message
  });
});

/**
 * Mark messages as read
 */
const markMessagesAsRead = catchAsync(async (req, res) => {
  const { chatRoomId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Verify user has access to this chat room
  const hasAccess = await chatService.verifyUserAccessToChatRoom(userId, chatRoomId);
  if (!hasAccess) {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      message: 'Access denied to this chat room'
    });
  }

  await chatService.markMessagesAsRead(chatRoomId, userId);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Messages marked as read'
  });
});

/**
 * Stream chat events using Server-Sent Events
 */
const streamChatEvents = catchAsync(async (req, res) => {
  const { chatRoomId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Verify user has access to this chat room
  const hasAccess = await chatService.verifyUserAccessToChatRoom(userId, chatRoomId);
  if (!hasAccess) {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      message: 'Access denied to this chat room'
    });
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to chat events' })}\n\n`);

  // Set up real-time subscription to chat messages
  const handleMessageInsert = (payload) => {
    if (payload.new.chat_room_id === chatRoomId) {
      res.write(`data: ${JSON.stringify({ type: 'newMessage', message: payload.new })}\n\n`);
    }
  };

  const handleMessageUpdate = (payload) => {
    if (payload.new.chat_room_id === chatRoomId) {
      res.write(`data: ${JSON.stringify({ type: 'messageUpdated', message: payload.new })}\n\n`);
    }
  };

  // Subscribe to real-time updates
  const subscription = dbManager.supabaseAdapter.subscribeToTableWithFilter(
    'chat_messages',
    `chat_room_id=eq.${chatRoomId}`,
    (payload) => {
      if (payload.eventType === 'INSERT') {
        handleMessageInsert(payload);
      } else if (payload.eventType === 'UPDATE') {
        handleMessageUpdate(payload);
      }
    },
    `chat-events-${chatRoomId}-${userId}`
  );

  // Handle client disconnect
  req.on('close', () => {
    logger.info(`Client disconnected from chat events for room ${chatRoomId}`);
    dbManager.supabaseAdapter.unsubscribeFromChannel(`chat-events-${chatRoomId}-${userId}`);
    res.end();
  });
});

module.exports = {
  createChatRoom,
  getUserChatRooms,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  streamChatEvents
};
