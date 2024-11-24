const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { customAlphabet } = require('nanoid');
const alphabet = 'AaBbCcDdEeFfGgHhJjKkLlMmNnPpQqRrSsTtUuVvWwXxYyZz23456789'; // Excludes I, O, 1, 0 to avoid confusion
const nanoid = customAlphabet(alphabet, 7);


const userSchema = new mongoose.Schema({
    userID: {
        type: String,
        default: () => nanoid(),
        unique: true,
    },
    //informatiom section
    username: {
        type: String, required: true, unique: true, trim: true, match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and dashes.']
    },
   
    password: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, trim: true },
    gender: { type: String, default: "Chọn giới tính", trim: true },
    email: { type: String, index: true,unique: true, trim: true, lowercase: true, match: [/\S+@\S+\.\S+/, 'is invalid'] },
    avatarImg: { type: String, trim: true },
    birthDate: {
        type: Date,
        validate: {
            validator: function (v) {
                // Check if the value is a valid date
                return !isNaN(new Date(v));
            },
            message: props => `${props.value} is not a valid date!`
        }
    },
    role: {
        type: String,
        enum: ['Admin', 'Nhân viên bán hàng','Nhân viên kho hàng', 'Khách hàng'],
        default: 'Khách hàng',
    },
    //end of information section
    lastLoginDate: { type: Date },
    isActive: { type: Boolean, default: true },
    productQuantity: { type: Number, default: 0 },
    totalPriceInCrat: { type: Number, default: 0 },
    //Credit card information
    creditCard: {
        type: {
            cardNumber: Number,
            expirationMonth: Number,
            expirationYear: Number,
            cardholder: String,
        },
        default: null
    },
    shippingAddress: {
        type: {
            fullName: { type: String, trim: true },
            country: {type: String, default: "Việt Nam", trim:true},
            phoneNumber: { type: String, trim: true },
            city: { type: String, trim: true },
            district: { type: String,  trim: true },
            address: { type: String, trim: true }
        },
        default: null
    },
    billingAddress: {
        type: {
            fullName: { type: String, trim: true },
            country: {type: String, default: "Việt Nam", trim:true},
            phoneNumber: { type: String, trim: true },
            city: { type: String, trim: true },
            district: { type: String,  trim: true },
            address: { type: String, trim: true }
        },
        default: null
    },
    cart: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Smartphone' },
        
        specID: { type: String, required: true, trim: true },
        quantity: { type: Number, default: 1 },
        totalProductsPrice: { type: Number },
        productPreviousUpdate: { type: Date }

    }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    accountCreatedDate: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
}
);

// Define the virtual fullName property
userSchema.virtual('fullName').get(function () {
  return `${this.lastName} ${this.firstName}`;
});



userSchema.pre('save', async function (next) {
    if (this.isModified('shippingAddress')) {
        this.billingAddress = this.shippingAddress;
      }
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }

    // Calculate totalPriceInCrat and productQuantity
    if (this.isModified('cart')) {
        this.totalPriceInCrat = this.cart.reduce((sum, item) => sum + (item.totalProductsPrice || 0), 0);
        this.productQuantity = this.cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }

    next();
});



const User = mongoose.model('User', userSchema);


module.exports = User;