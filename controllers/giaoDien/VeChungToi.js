const express = require('express');
const router = express.Router();
const { currentU} = require('../../middleware/auth');



//Hiện trang "Về chúng tôi"
router.get('/about-us', currentU,(req, res) => {
    res.render('about-us', { currentUser: req.c });
  
  });


  module.exports = router; 