// import các package cần thiết cho project

const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const mongoSanitize = require('express-mongo-sanitize');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const { exec } = require('child_process');
const compression = require('compression');
const crypto = require('crypto');

const secretKey = crypto.randomBytes(64).toString('hex');

require('dotenv').config();




const apiRoutes = require('./controllers/api/')
const renderRoutes = require('./controllers/giaoDien')


// thiết lập nền tảng cho project
const app = express();
app.use(cookieParser());
app.use(express.json())
app.use(mongoSanitize());
// app.use(session({
//   secret: 'yourSecret',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     maxAge: 30 * 24 * 60 * 60 * 1000, // Example: 30 days
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//   }
// }));




app.use(session({
  secret: secretKey, // Use the secret key from the environment variable
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Use true if you're serving over HTTPS
}));


app.use(compression());

// thiết lập cho EJS
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')));

// thiết lập body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



//dfv
// Sử dụng các Route
app.use(apiRoutes)
app.use(renderRoutes)








// Đường dẫn cuối cùng nếu các route nhập trên thanh url không tồn tại
// Về trang chủ
app.get('*', (req, res) => {
  res.redirect('/');

});








// hiển thị trang 404 nếu báo lỗi
app.use((req, res, next) => {
  res.status(404).render('404'); 
});

// lỗi liên quan tới middleware
//Hiện lỗi trang 500
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500');
});




//code kết nối tới csdl MongoDB
mongoose.connect(process.env.MONGODB_URI, {
}).then(() => console.log('Đã kết nối tới cơ sở dữ MongoDB'))
  .catch(err => console.log('Kết nối tới cơ sở dữ liệu MongoDB thất bại', err));

const PORT = process.env.PORT;
const url = `http://localhost:${PORT}`;

// function openBrowser(url) {
//   switch (process.platform) {
//     case 'darwin':
//       exec(`open ${url}`);
//       break;
//     case 'win32':
//       exec(`start ${url}`);
//       break;
//     default:
//       exec(`xdg-open ${url}`);
//   }
// }


//Chạy port
//Khởi động project
app.listen(PORT, () => {
  console.log(`Server chạy thành công trên ${url}`);
  // openBrowser(url);
});





