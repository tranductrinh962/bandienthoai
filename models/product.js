
const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid');
const alphabet = 'AaBbCcDdEeFfGgHhJjKkLlMmNnPpQqRrSsTtUuVvWwXxYyZz23456789'; // Excludes I, O, 1, 0 to avoid confusion
const productID = customAlphabet(alphabet, 5); // 5 characters long
const specID = customAlphabet(alphabet, 5);



const specVariationSchema = new mongoose.Schema({
    specID: {
        type: String,
        default: () => specID(),
        unique: true
    },
    ram: {
        type: Number,
        required: [true, 'Thông tin RAM không được bỏ trống'],
        trim: true
    },
    storage: {
        type: Number,
        required: [true, 'Thông tin bộ nhớ không được bỏ trống'],
        trim: true
    },
    price: {
        type: Number,
        default: 0
    },
    defaultPrice: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        required: [true, 'Số lượng không được bỏ trống'],
        default: 0
    }
}, { _id: false });

const colorVariantSchema = new mongoose.Schema({
    color: {
        type: String,
        required: [true, 'Màu không được bỏ trống'],
        trim: true
    },
    colorHex: {
        type: String, 
        match: /^#[0-9A-F]{6}$/i, 
      },
    specVariations: [specVariationSchema]
}, { _id: false });



const smartphoneSchema = new mongoose.Schema({
    productID: {
        type: String,
        default: () => productID(),
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    brand: {
        type: String,
        // required: [true, 'Thương hiệu không được bỏ trống'],
        trim: true
    },
    productBrand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    model: {
        type: String,
        required: [true, 'Tên loại máy không được bỏ trống'],
        trim: true
    },
    description: {
        type: String,
        default: 'Không có mô tả nào',
        trim: true,
    },
    image: {
        type: String,
        trim: true,
    },
    os: {
        type: String,
        trim: true,
        default: '(Không xác định)'
    },
    minPrice: {
        type: Number,
        trim: true
    },
    minPriceWithRam: {
        type: String,
        trim: true,
    },
    minPriceWithStorage: {
        type: String,
        trim: true,
    },
    minDefaultPrice: {
        type: Number,
        trim: true
    },
    isSpecs: {
        type: Boolean
    },
    generalSpecifications: {
        cpu: {
            type: String,
            required: [true, 'Thông tin CPU không được bỏ trống'],
            trim: true
        },
        camera: {
            primary: String,
            secondary: String
        },
        battery: {
            type: Number,
            required: [true, 'Dung lượng Pin không được bỏ trống'],
            trim: true
        },
        display: {
            type: String,
            required: [true, 'Thông số màn hình không được bỏ trống'],
            trim: true
        }
    },
    notExists: {
        type: Boolean,
        default: false
    },
    outOfStock: {
        type: String,
        enum: ['Hết hàng', 'Còn hàng', 'Thiếu hàng'],
        default: 'Còn hàng',
    },
    colorVariants: [colorVariantSchema],
    releaseDate: {
        type: Date,
        default: Date.now,
    },
    isHot: {
        type: Boolean,
        default: false
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    discountEndDate: {
        type: Date
    },
    customersPurchased: {
        type: Number,
        default: 0
    }
}, { timestamps: true });


smartphoneSchema.pre('save', function (next) {
    const smartphone = this;
    const now = new Date();

    // Check stock status
    const outOfStockStatus = smartphone.colorVariants.every((colorVariant) =>
        colorVariant.specVariations.every((specVariation) => specVariation.stock === 0)
    ) ? 'Hết hàng' : smartphone.colorVariants.some((colorVariant) =>
        colorVariant.specVariations.some((specVariation) => specVariation.stock === 0)
    ) ? 'Thiếu hàng' : 'Còn hàng';

    smartphone.outOfStock = outOfStockStatus;

    // Apply discounts if the discount field is greater than 0
    if (smartphone.discount > 0 && (!smartphone.discountEndDate || smartphone.discountEndDate > now)) {
        smartphone.colorVariants.forEach(colorVariant => {
            colorVariant.specVariations.forEach(specVariation => {
                if (specVariation.defaultPrice === 0) {
                    specVariation.defaultPrice = specVariation.price;
                }
                specVariation.price = Math.round(specVariation.defaultPrice * (1 - smartphone.discount / 100));
            });
        });
    } else if (smartphone.discountEndDate && smartphone.discountEndDate <= now ||smartphone.discount===0 ) {
        // Revert to default prices if the discount end date has passed
        smartphone.colorVariants.forEach(colorVariant => {
            colorVariant.specVariations.forEach(specVariation => {
                if (specVariation.defaultPrice !== 0) {
                    specVariation.price = specVariation.defaultPrice;
                    specVariation.defaultPrice = 0;
                }
            });
        });
        smartphone.minPrice =  smartphone.minDefaultPrice
        smartphone.discount = 0;
    }

    const validVariations = smartphone.colorVariants.flatMap(colorVariant =>
        colorVariant.specVariations.filter(specVariation => specVariation.stock > 0)
    );

    if (validVariations.length > 0) {
        const minPriceVariation = validVariations.reduce((minVariation, currentVariation) => {
            return currentVariation.price < minVariation.price ? currentVariation : minVariation;
        });

        smartphone.minPrice = minPriceVariation.price;
        smartphone.minPriceWithRam = minPriceVariation.ram;
        smartphone.minPriceWithStorage = minPriceVariation.storage;

        const validDefaultPrices = validVariations.map(specVariation => specVariation.defaultPrice).filter(price => price > 1);

        if (validDefaultPrices.length > 0) {
            smartphone.minDefaultPrice = Math.min(...validDefaultPrices);
        } else {
            smartphone.minDefaultPrice = null;
        }
    } else {
        smartphone.minPrice = null;
        smartphone.minPriceWithRam = null;
        smartphone.minPriceWithStorage = null;
        smartphone.minDefaultPrice = null;
    }

    //check if there is more than 1 spec
    const hasMultipleSpecs = smartphone.colorVariants.some(colorVariant =>
        colorVariant.specVariations.length > 1
    );
    smartphone.isSpecs = hasMultipleSpecs;

    next();
});










const Product = mongoose.model('Smartphone', smartphoneSchema);
module.exports = Product
