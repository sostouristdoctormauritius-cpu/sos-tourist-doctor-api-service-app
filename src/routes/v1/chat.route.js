const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const chatController = require('../../controllers/chat.controller');

const router = express.Router();

// All chat routes require authentication
router.use(auth());

// Chat room routes
router.route('/rooms')
  .post(chatController.createChatRoom)
  .get(chatController.getUserChatRooms);

router.route('/rooms/:chatRoomId/messages')
  .get(chatController.getChatMessages)
  .post(chatController.sendMessage);

router.route('/rooms/:chatRoomId/read')
  .post(chatController.markMessagesAsRead);

router.route('/rooms/:chatRoomId/events')
  .get(chatController.streamChatEvents);

module.exports = router;
