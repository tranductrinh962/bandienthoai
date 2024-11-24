const express = require('express');
const router = express.Router();
const Inbox = require('../../../models/Inbox');
const { isNVBH, currentU} = require('../../../middleware/auth');




router.get('/messages', currentU,isNVBH,async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = 9;
    const sort = req.query.sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const searchQuery = req.query.search || '';


    const defaultSort = { isRead: -1, createdAt: -1 };

    const messages = await Inbox.find({
        $or: [
            { user: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } },
            { sub: { $regex: searchQuery, $options: 'i' } },
        ],
    })
        .sort(sort === 'newest' ? defaultSort : sort)
        .skip((page - 1) * limit)
        .limit(limit);

    const totalMessages = await Inbox.countDocuments({
        $or: [
            { user: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } },
            { sub: { $regex: searchQuery, $options: 'i' } },
        ],
    });
    const totalPages = Math.ceil(totalMessages / limit);

    const unreadMessages = await Inbox.countDocuments({ isRead: false });

    res.render('admin/inbox/inboxes', {
        currentUser: req.c,
        messages,
        currentPage: page,
        totalPages,
        sort: req.query.sort || 'newest',
        searchQuery,
        unreadMessages,
    });
});





router.get('/messages/:id',currentU, isNVBH, async (req, res) => {
    const messID = req.params.id


    const message = await Inbox.findById(messID);

    if (!message) {
        return res.status(404).render('error', { error: 'Message not found' });
    }
    message.isRead = true;
    await message.save();

    res.render('admin/inbox/detailed-inbox', {
        currentUser: req.c, message 
    });
})
module.exports = router; 