
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');



//Giới hạn 2 lần đăng kí mỗi 3 tiếng
const registerLimiter = rateLimit({
    windowMs: 3 * 60 * 60 * 1000,
    max: 10,
    message: "Thao tác quá nhiều, hãy thử lại"
});



//Giới hạn 5 lần khôi phục mỗi 1 tiếng
const resetPassLimiter = rateLimit({
    windowMs: 3 * 60 * 60 * 1000,
    max: 7,
    message: "Thao tác quá nhiều, hãy thử lại"
});


//Giới hạn gửi support mỗi 10 phút 1 lần
const inboxLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 3,
    message: "Thao tác quá nhiều, hãy thử lại"
});



const isNVBH = async (req, res, next) => {
    if (req.session.user) {
        if (
            req.session.user.role === 'Admin' ||
            req.session.user.role === 'Nhân viên bán hàng'
        ) {
            next();
        } else { return res.redirect('/'); }
    } else {
        return res.redirect('/');
    }
};

const isAdmin = async (req, res, next) => {
    if (req.session.user) {
        if (
            req.session.user.role === 'Admin'
        ) {
            next();
        } else { return res.redirect('/'); }
    } else {
        return res.redirect('/');
    }
};

const isNVKH = async (req, res, next) => {
    if (req.session.user) {
        if (
            req.session.user.role === 'Admin' ||
            req.session.user.role === 'Nhân viên kho hàng'
        ) {
            next();
        } else { return res.redirect('/'); }
    } else {
        return res.redirect('/');
    }
};

const isNotNormalUser = async (req, res, next) => {
    if (req.session.user) {
        if (
            req.session.user.role === 'Admin' ||
            req.session.user.role === 'Nhân viên bán hàng' ||
            req.session.user.role === 'Nhân viên kho hàng'
        ) {
            next();
        } else { return res.redirect('/'); }
    } else {
        return res.redirect('/');
    }
};

// Check if user is authenticated 
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    next();
};



const checkLoggedIn = async (req, res, next) => {
    try {
        if (req.session.user) {
            const c = await User.findById(req.session.user._id);
            req.c = c;
            if (req.c.isActive === false) {
                return res.redirect('/logout');
            }
            next();
        }
        else {
            return res.redirect('/login');
        }

    } catch (err) {
        console.error(err);
        next(err);
    }
};




const currentU = async (req, res, next) => {
    try {
        if (req.session.user) {
            const c = await User.findById(req.session.user._id);
            req.c = c;

        }
        next()
    } catch (err) {
        console.error(err);
        next(err);
    }
};


const validateEditUser = [
    body('firstName').matches(/^[a-zA-Z0-9À-ỹ]+$/).withMessage('Tên nhập không hợp lệ!'),
    body('lastName').matches(/^[a-zA-Z0-9À-ỹ ]+$/).withMessage('Tên nhập không hợp lệ!'),
    body('phoneNumber').matches(/^[0-9]+$/).withMessage('Số điện thoại nhập không hợp lệ!'),
    body('address').matches(/^[a-zA-Z0-9À-ỹ.,\s]+$/u).withMessage('Địa chỉ nhập không hợp lệ'),
];


const validateRegistration = [
    body('username')
        .isLength({ min: 5 }).withMessage('Tên đăng nhập phải chứa 5 kí tự trở lên')
        .isLength({ max: 20 }).withMessage('Tên đăng nhập không được quá 20 kí tư')
        .matches(/^[a-zA-Z0-9_]*$/).withMessage('Tên đăng nhập chỉ chứa mỗi chữ và số, không kí tự đặc biệt'),
    body('password')
        .isLength({ min: 8 }).withMessage('Mật khẩu phải từ 8 kí tự trở lên'),
    body('firstName').matches(/^[a-zA-Z0-9À-ỹ]+$/).withMessage('Tên nhập không hợp lệ!'),
    body('lastName').matches(/^[a-zA-Z0-9À-ỹ ]+$/).withMessage('Tên nhập không hợp lệ!'),
    body('phoneNumber').matches(/^[0-9]+$/).withMessage('Số điện thoại nhập không hợp lệ!'),
    body('email')
        .isEmail().withMessage('Email không hợp lệ'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Mật khẩu không giống nhau');
        }
        return true;
    }),
];




const validateResetPassword = [

    body('password')
        .isLength({ min: 8 }).withMessage('Mật khẩu phải từ 8 kí tự trở lên'),

];




const validateProduct = [
    body('name')
        .isLength({ min: 2, max: 100 }).withMessage('Tên sản phẩm phải chứa từ 2 đến 100 kí tự')
        .matches(/^[a-zA-Z0-9À-ỹ \-]+$/).withMessage('Tên sản phẩm chứa kí tự không hợp lê'),
    body('description')
        .isLength({ min: 5, max: 2000 }).withMessage('Nội dung phải chứa từ 5 đến 2000 kí tự')
        .matches(/^[a-zA-Z0-9À-ỹ.,!?()"$\s\-]+$/u).withMessage('Nội dung chứa kí tự không hợp lệ'),

    body('brand')
        .isLength({ max: 100 }).withMessage('Tên thương hiệu không được quá 100 kí tự')
        .matches(/^[a-zA-Z0-9 ]+$/).withMessage('Tên thương hiệu chỉ chứa chữ, số và khoảng trắng'),
    body('price')
        .isNumeric().withMessage('Giá phải là số'),
    body('stockQuantity')
        .isNumeric().withMessage('Số lượng phải là số'),
];




const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
};





function hasVisitedCart(req, res, next) {
    if (req.session.cartVisited) {
        next();
    } else {
        // User has not visited cart, redirect or send a message
        return res.redirect("/cart")
    }
}


function setUsername(req, res, next) {

    if (req.session && req.session.userId) {
        User.findById(req.session.userId, function (err, user) {
            if (user) {

                res.locals.currentUser = user;
            }
            next(); //
        });
    } else {
        res.locals.currentUser = null
        next();
    }
}



const validateProfileInfo = [
    body('firstName')
        .isString().withMessage('First name must be a string')
        .matches(/^[A-Za-zÀ-ỹ]+$/).withMessage('First name can only contain Vietnamese characters and spaces'),
    body('lastName')
        .isString().withMessage('Last name must be a string')
        .matches(/^[A-Za-zÀ-ỹ\s]+$/).withMessage('Last name can only contain Vietnamese characters and spaces'),
    body('birthDate')
        .isDate().withMessage('Birth date must be a valid date in YYYY-MM-DD format')
        .isISO8601().withMessage('Birth date must be in ISO 8601 format'),
    body('gender')
        .isIn(['Nam', 'Nữ', 'Khác']).withMessage('Gender must be one of "Nam", "Nữ", or "Khác"'),
    body('phoneNumber')
        .isString().withMessage('Phone number must be a string')
        .matches(/^[0-9]+$/).withMessage('Phone number must contain only numbers'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];


const validateAddressInfo = [
    body('fullName')
        .isString().withMessage('fullName must be a string')
        .matches(/^[A-Za-zÀ-ỹ\s]+$/).withMessage('fullName can only contain Vietnamese characters and spaces'),
    body('country')
        .isString().withMessage('country must be a string')
        .matches(/^[A-Za-zÀ-ỹ\s]+$/).withMessage('country can only contain Vietnamese characters and spaces'),
    body('city')
        .isString().withMessage('City must be a string')
        .matches(/^[A-Za-zÀ-ỹ\s\-\(\)]+$/).withMessage('City can only contain Vietnamese characters, spaces, "-", and "()"'),
    body('phoneNumber')
        .isString().withMessage('Phone number must be a string')
        .matches(/^[0-9]+$/).withMessage('Phone number must contain only numbers'),
    body('district')
        .isString().withMessage('District must be a string')
        .matches(/^[A-Za-zÀ-ỹ\s0-9]+$/).withMessage('District can only contain Vietnamese characters, spaces, and numbers'),
    body('address')
        .isString().withMessage('Address must be a string')
        .matches(/^[A-Za-zÀ-ỹ\s0-9,-/]+$/).withMessage('Address can only contain Vietnamese characters, spaces, numbers, commas, and hyphens'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];


const validatePaymentMethod = [
    body('cardNumber')
        .isString().withMessage('Card number must be a string')
        .matches(/^\d{16}$/).withMessage('Card number must be exactly 16 digits'),
    body('cardholder')
        .isString().withMessage('Cardholder name must be a string')
        .matches(/^[A-Za-zÀ-ỹ\s]+$/).withMessage('Cardholder name can only contain letters and spaces'),
    body('expirationDate')
        .matches(/^(0[1-9]|1[0-2])\/\d{2}$/).withMessage('Expiration date must be in MM/YY format and valid'),
    body('cvv')
        .optional()
        .matches(/^\d{3}$/).withMessage('CVV must be exactly 3 digits'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];


const checkCreditCard = async (req, res, next) => {
    const user = await User.findById(req.session.user._id);
    if (user && user.creditCard) {
        return res.redirect('/account/payment-methods');
    }
    next();
};




module.exports = {
    isAdmin,
    isAuthenticated,
    checkLoggedIn,
    validateRegistration,
    errorHandler,
    validateProduct,
    validateEditUser,
    hasVisitedCart,
    currentU,
    setUsername,
    validateProfileInfo,
    validateAddressInfo,
    validatePaymentMethod,
    checkCreditCard,
    isNVBH,
    isNVKH,
    isNotNormalUser,
    registerLimiter,
    inboxLimiter,
    resetPassLimiter,
    validateResetPassword
};

