const mongoose = require('mongoose');

const inboxSchema = new mongoose.Schema({
    email: { type: String,required:true},
    user: { type: String,required: true },
    sub:{ type: String,trim:true,required: true },
    des: { type: String,trim:true,required: true },
    isRead:{type:Boolean,default:false}
}, { timestamps: true });

const Inbox = mongoose.model('Inbox', inboxSchema);

module.exports = Inbox;
