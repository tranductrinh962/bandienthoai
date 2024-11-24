const express = require('express');
const router = express.Router();
const User = require('../../../models/User');



// Đường dẫn đê hiện chi tiết thông tin người dùng
router.post('/settings/userinfo', async (req, res) => {
  try {
      const user = await User.findById(req.body.id);
      res.json(user);
  } catch (err) {
      res.status(500).send(err);
  }
});




// Đường dẫn hiện thị tất cả người dùng
router.post('/settings/users', async (req, res) => {
  try {
    let { page = 1, dateSort = -1, status, limit = 8, search, role } = req.body;
    let query = {};
    const dateSortNumber = Number(dateSort)

    

    // Construct the query based on search and category parameters
    if (search) {
      query.username = { $regex: new RegExp(search, 'i') };
    }
    if (role) {
      query.role = role;
    }
    if (status) {
      query.isActive = status;
    }

    // Execute the query with pagination
    const users = await User.find(query)
      .sort({ accountCreatedDate: dateSortNumber})
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();




    // Count total documents
    const totalCount = await User.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit)
    if (page > 9 || page > totalPages) {
      page = 1;
    }

    res.json({
      users,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});







module.exports = router; 
