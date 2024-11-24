const express = require('express');
const router = express.Router();
const Product = require('../../../models/product');
const Order = require('../../../models/Order');
const User = require('../../../models/User');
const {  isNotNormalUser } = require('../../../middleware/auth');







router.post('/settings/dashboards', isNotNormalUser, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const twoDateAgo = new Date();
    twoDateAgo.setDate(twoDateAgo.getDate() - 2);

    const matchOptions = startDate && endDate
      ? {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      }
      : {};

    const userMatchOptions = startDate && endDate
      ? {
        accountCreatedDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      }
      : {};

    const productMatchOptions = startDate && endDate
      ? {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      }
      : {};

    const [dashboardData, totalUsers, customers, salesStaff, warehouseStaff, admins, disabledUsers, totalOrders, pendingOrders, preparingOrders, shippingOrders, completedOrders, canceledOrders, totalProducts, activeOrderRevenue, haveStock, lowStock, endStock, newUsers, newProducts, newOrders] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            ...matchOptions,
            status: 'Hoàn thành'
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' },
            totalProducts: { $sum: { $size: '$items' } },
          },
        },
      ]),
      User.countDocuments(userMatchOptions),
      User.countDocuments({ ...userMatchOptions, role: 'Khách hàng' }),
      User.countDocuments({ ...userMatchOptions, role: 'Nhân viên bán hàng' }),
      User.countDocuments({ ...userMatchOptions, role: 'Nhân viên kho hàng' }),
      User.countDocuments({ ...userMatchOptions, role: 'Admin' }),
      User.countDocuments({ ...userMatchOptions, isActive: false }),
      Order.countDocuments(matchOptions),
      Order.countDocuments({ ...matchOptions, status: 'Đợi xác nhận' }),
      Order.countDocuments({ ...matchOptions, status: 'Chuẩn bị hàng' }),
      Order.countDocuments({ ...matchOptions, status: 'Đang giao hàng' }),
      Order.countDocuments({ ...matchOptions, status: 'Hoàn thành' }),
      Order.countDocuments({ ...matchOptions, status: 'Đã hủy' }),
      Product.countDocuments(productMatchOptions),
      Order.aggregate([
        {
          $match: {
            ...matchOptions,
            status: { $nin: ['Hoàn thành', 'Đã hủy'] }
          }
        },
        {
          $group: {
            _id: null,
            activeRevenue: { $sum: '$totalPrice' },
          },
        },
      ]),
      Product.countDocuments({ ...productMatchOptions, outOfStock: 'Còn hàng' }),
      Product.countDocuments({ ...productMatchOptions, outOfStock: 'Thiếu hàng' }),
      Product.countDocuments({ ...productMatchOptions, outOfStock: 'Hết hàng' }),
      User.countDocuments({
        accountCreatedDate: {
          $gte: twoDateAgo,
        },
      }),
      Product.countDocuments({
        createdAt: {
          $gte: twoDateAgo,
        },
      }),
      Order.countDocuments({
        createdAt: {
          $gte: twoDateAgo,
        },
      }),

    ]);

  
    const { totalRevenue = 0 } = dashboardData[0] || {};
    const { activeRevenue = 0 } = activeOrderRevenue[0] || {};
    const data = {
      totalRevenue,
      activeRevenue,
      totalProducts,
      newUsers,
      totalUsers,
      salesStaff,
      warehouseStaff,
      admins,
      totalOrders,
      pendingOrders,
      preparingOrders,
      shippingOrders,
      completedOrders,
      canceledOrders,
      customers,
      totalProducts,
      disabledUsers,
      haveStock, lowStock, endStock, newProducts, newOrders, startDate, endDate
    };

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



router.get('/settings/', isNotNormalUser, async (req, res) => {
  res.redirect(`/settings/dashboard`);
});

module.exports = router;


