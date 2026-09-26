const Message = require('../models/Message');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, text, attachments } = req.body;

    if (!receiverId || (!text?.trim() && !Array.isArray(attachments))) {
      return res.status(400).json({ success: false, message: 'Receiver and message content are required' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found' });
    }

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      text: text?.trim() || '',
      attachments: Array.isArray(attachments) ? attachments : [],
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name email role profileImage')
      .populate('receiver', 'name email role profileImage');

    await createNotification({
      user: receiverId,
      title: 'New message',
      message: `${req.user.name || 'Someone'} sent you a message.`,
      type: 'message',
      link: '/messages',
      metadata: { messageId: message._id, senderId: req.user.id },
    });

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Get conversation between current user and another user
// @route   GET /api/messages/conversation/:userId
// @access  Private
exports.getConversation = async (req, res, next) => {
  try {
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user.id }
      ]
    })
      .populate('sender', 'name email role profileImage')
      .populate('receiver', 'name email role profileImage')
      .sort({ createdAt: 1 });

    // Mark unread messages from the other user as read
    await Message.updateMany(
      { sender: otherUserId, receiver: req.user.id, read: false },
      { read: true }
    );

    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

// @desc    Get list of users the current user has chatted with (contacts)
// @route   GET /api/messages/contacts
// @access  Private
exports.getChatContacts = async (req, res, next) => {
  try {
    // Find all unique users this user has exchanged messages with
    const sentTo = await Message.distinct('receiver', { sender: req.user.id });
    const receivedFrom = await Message.distinct('sender', { receiver: req.user.id });

    const contactIds = [...new Set([...sentTo, ...receivedFrom].map(id => id.toString()))];

    const contacts = await User.find({ _id: { $in: contactIds } })
      .select('name email role profileImage isVerifiedBadge')
      .lean();

    // Get last message and unread count for each contact
    const contactsWithMeta = await Promise.all(
      contacts.map(async (contact) => {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: req.user.id, receiver: contact._id },
            { sender: contact._id, receiver: req.user.id }
          ]
        }).sort({ createdAt: -1 }).lean();

        const unreadCount = await Message.countDocuments({
          sender: contact._id,
          receiver: req.user.id,
          read: false
        });

        return {
          id: contact._id,
          name: contact.name,
          email: contact.email,
          role: contact.role,
          avatar: (contact.name || 'U').charAt(0).toUpperCase(),
          profileImage: contact.profileImage,
          online: true,
          lastMessage: lastMessage?.text || '',
          lastMessageTime: lastMessage?.createdAt || null,
          unreadCount
        };
      })
    );

    // Sort by last message time
    contactsWithMeta.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    res.status(200).json({ success: true, data: contactsWithMeta });
  } catch (err) {
    next(err);
  }
};
