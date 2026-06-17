const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const getUserId = (req) => req.user?.sub || req.user?.id || req.user?._id;

// Get all conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: getUserId(req) })
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
};

// Create a new conversation
exports.createConversation = async (req, res) => {
  try {
    console.log('DEBUG: req.user =', req.user);
    const { title } = req.body;
    const conversation = new Conversation({
      userId: getUserId(req),
      title: title || 'New Conversation',
    });
    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Error creating conversation' });
  }
};

// Get messages for a specific conversation
exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findOne({ _id: id, userId: getUserId(req) });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversationId: id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

// Update conversation
exports.updateConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, pinned, archived } = req.body;
    
    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, userId: getUserId(req) },
      { $set: { title, pinned, archived } },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({ message: 'Error updating conversation' });
  }
};

// Delete conversation
exports.deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findOneAndDelete({ _id: id, userId: getUserId(req) });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Delete all associated messages
    await Message.deleteMany({ conversationId: id });

    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Error deleting conversation' });
  }
};

// Stream chat response
exports.streamChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, contextUrl, preferences } = req.body;

    const conversation = await Conversation.findOne({ _id: id, userId: getUserId(req) });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Save user message
    const userMessage = new Message({
      conversationId: id,
      role: 'user',
      content: message,
    });
    await userMessage.save();

    // Fetch previous context
    const previousMessages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .limit(20);

    const apiKeysString = process.env.GEMINI_API_KEY;
    if (!apiKeysString) {
      return res.status(503).json({ message: 'VanishAI is currently unavailable.' });
    }

    const apiKeys = apiKeysString.split(',').map(k => k.trim()).filter(Boolean);
    const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

    const systemInstruction = `You are Vanish Sentinel AI, the intelligent security engineer and operations assistant for VanishLink.
VanishLink is an advanced, AI-powered conditional URL routing and security platform.
Your role is to help users manage their secure links, understand analytics, configure webhooks, and detect threats.
You are proactive, contextual, intelligent, and highly secure. Act like a premium AI employee, not a simple chatbot.
Do not just output raw numbers; interpret them.
User Context:
- Current Page: ${contextUrl || 'Unknown'}
- Preferences: ${JSON.stringify(preferences || {})}
Please respond using markdown formatting.`;

    const formattedMessages = previousMessages.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const requestPayload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: formattedMessages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    };

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Make streaming request to Gemini
    const fetchResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      }
    );

    if (!fetchResponse.ok) {
      const errorData = await fetchResponse.text();
      console.error('Gemini API Error:', errorData);
      res.write(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`);
      return res.end();
    }

    const reader = fetchResponse.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullResponseText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.substring(6);
          if (dataStr === '[DONE]') continue;
          
          try {
            const data = JSON.parse(dataStr);
            const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (textChunk) {
              fullResponseText += textChunk;
              // Forward chunk to frontend
              res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
            }
          } catch (e) {
            // ignore JSON parse errors for incomplete chunks
          }
        }
      }
    }

    // Save model response to DB
    const modelMessage = new Message({
      conversationId: id,
      role: 'model',
      content: fullResponseText,
    });
    await modelMessage.save();
    
    // Update conversation timestamp
    await Conversation.findByIdAndUpdate(id, { updatedAt: new Date() });

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (err) {
    console.error('Chat Streaming Error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error streaming chat response' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
      res.end();
    }
  }
};
