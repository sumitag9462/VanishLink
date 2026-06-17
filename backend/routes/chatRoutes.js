const express = require('express');
const { authenticate } = require('./authRoutes');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.use(authenticate);

router.get('/conversations', chatController.getConversations);
router.post('/conversations', chatController.createConversation);
router.get('/conversations/:id/messages', chatController.getMessages);
router.put('/conversations/:id', chatController.updateConversation);
router.delete('/conversations/:id', chatController.deleteConversation);
router.post('/conversations/:id/stream', chatController.streamChat);

module.exports = router;
