  const mongoose = require('mongoose');
  const { customAlphabet } = require('nanoid');
  const alphabet = 'AaBbCcDdEeFfGgHhJjKkLlMmNnPpQqRrSsTtUuVvWwXxYyZz23456789'; // Excludes I, O, 1, 0 to avoid confusion
  const orderID = customAlphabet(alphabet, 12);
  const trackingID = customAlphabet(alphabet, 12);

  const orderSchema = new mongoose.Schema({
    orderID: {
      type: String,
      default: () => orderID(),
      unique: true
    },
    trackingID: {
      type: String,
      default: () => trackingID(),
      unique: true
    },
    quantityAll: {
      type: Number,
      trim: true,
    },
    priceAll: {
      type: Number,
      trim: true,
    },
    shippingAddress: {
      type: {
        fullName: { type: String, trim: true },
        country: { type: String, default: "Việt Nam", trim: true },
        phoneNumber: { type: String, trim: true },
        city: { type: String, trim: true },
        district: { type: String, trim: true },
        address: { type: String, trim: true }
      },
      default: null
    },
    billingAddress: {
      type: {
        fullName: { type: String, trim: true },
        country: { type: String, default: "Việt Nam", trim: true },
        phoneNumber: { type: String, trim: true },
        city: { type: String, trim: true },
        district: { type: String, trim: true },
        address: { type: String, trim: true }
      },
      default: null
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{
      product: {
        type: String,
        trim: true,
      },
      color: {
        type: String,
        trim: true,
      },
      ram: {
        type: Number,
        trim: true,
      },
      storage: {
        type: Number,
        trim: true,
      },
      quantity: {
        type: Number,
        trim: true,
      },
      price: {
        type: Number,
        trim: true,
      },
      priceAll: {
        type: Number,
        trim: true,
      },
    }],
    totalCost: Number,
    paymentMethod: {
      type: String,
      enum: ['Thẻ tín dụng', 'Ship COD'],
      default: null,
  },
    status: {
      type: String,
      enum: ['Đợi xác nhận', 'Chuẩn bị hàng', 'Đang giao hàng','Hoàn thành','Đã hủy'],
      default: 'Đợi xác nhận',
  },
    createdAt: { type: Date, default: Date.now },
    orderStatusUpdatedAt: { type: Date,default:Date.now},
    discountPrice: { type: Number, default: 0 },
    deliveryPrice: { type: Number, default: 0 },
    totalPrice:{ type: Number, default:0}
  });


  // Pre-save middleware to calculate priceAll for each product and sum them up
orderSchema.pre('save', function(next) {
  const order = this;
  let totalPriceAll = 0;

  order.items.forEach(item => {
    item.priceAll = item.price * item.quantity;
    totalPriceAll += item.priceAll;
  });

  order.priceAll = totalPriceAll;
   // Calculate totalPrice
   order.totalPrice = order.priceAll + order.deliveryPrice - order.discountPrice;
  next();
});

  const Order = mongoose.model('Order', orderSchema);
  module.exports = Order
    


