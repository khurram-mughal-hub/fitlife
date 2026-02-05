import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;

        const newMessage = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            message,
        });

        // Populate sender details for immediate frontend display if needed
        await newMessage.populate('sender', 'name role');

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get conversation with a specific user
// @route   GET /api/messages/:userId
// @access  Private
const getConversation = async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user._id;

        // Find messages where (sender is me AND receiver is them) OR (sender is them AND receiver is me)
        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: targetUserId },
                { sender: targetUserId, receiver: currentUserId },
            ],
        })
            .sort({ createdAt: 1 }) // Oldest first
            .populate('sender', 'name role')
            .populate('receiver', 'name role');

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { sendMessage, getConversation };
