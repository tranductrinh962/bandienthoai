const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  voucher_id: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  discount_type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discount_amount: {
    type: Number,
    required: true
  },
  valid_from: {
    type: Date,
    required: true
  },
  valid_to: {
    type: Date,
    required: true
  },
  min_purchase_amount: {
    type: Number,
    default: 0
  },
  max_uses: {
    type: Number,
    default: 1000
  },
  is_active: {
    type: Boolean,
    default: true
  }
});

const Voucher = mongoose.model('Voucher', voucherSchema);

module.exports = Voucher;
