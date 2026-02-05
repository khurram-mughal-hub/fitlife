import React, { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';
import api from '../../services/api';
import Button from './Button';

const ChatBox = ({ receiverId, receiverName, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const [currentUser] = useState(JSON.parse(localStorage.getItem('user')));

    const fetchMessages = async () => {
        try {
            const response = await api.get(`/messages/${receiverId}`);
            setMessages(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    useEffect(() => {
        fetchMessages();
        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [receiverId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await api.post('/messages', {
                receiverId,
                message: newMessage,
            });
            setMessages([...messages, response.data]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">{receiverName}</h3>
                        <p className="text-xs text-green-400">Online</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">
                        Close
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                {loading ? (
                    <div className="flex justify-center mt-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-accent"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <p className="text-gray-500 text-center text-sm mt-4">No messages yet. Say hi!</p>
                ) : (
                    messages.map((msg) => {
                        // Robust check for current user ownership
                        // Handle cases where sender is populated object or just ID
                        const senderId = msg.sender._id || msg.sender;
                        const myId = currentUser._id || currentUser.id;
                        const isMe = senderId.toString() === myId.toString();

                        return (
                            <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && (
                                    <span className="text-xs text-gray-400 mb-1 ml-1">
                                        {msg.sender.name || 'User'}
                                    </span>
                                )}
                                <div
                                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${isMe
                                        ? 'bg-accent text-slate-900 rounded-tr-none'
                                        : 'bg-slate-700 text-white rounded-tl-none'
                                        }`}
                                >
                                    <p>{msg.message}</p>
                                    <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-slate-700/60' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:ring-1 focus:ring-accent outline-none"
                />
                <Button type="submit" size="sm" className="px-3">
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </div>
    );
};

export default ChatBox;
