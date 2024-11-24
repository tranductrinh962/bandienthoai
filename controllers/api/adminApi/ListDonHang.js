const express = require('express');
const router = express.Router();
const Order = require('../../../models/Order.js');
const { isNVBH, isNotNormalUser} = require('../../../middleware/auth.js');





//Đường dẫn để lấy thông tin các đơn hàng
router.post('/settings/orders', isNotNormalUser, async (req, res) => {
    try {
      const { page = 1, limit = 8, dateSort = -1, search, status } = req.body;
      let query = {};
      const dateSortNumber = Number(dateSort)
  
      // Construct the query based on search and category parameters
      if (search) {
        query.orderID = { $regex: new RegExp(search, 'i') };
      }
  
  
  
      if (status) {
        if (status === "5") {
          query.status = 'Hoàn thành'
        }
        else if (status === "4") {
          query.status = 'Đang giao hàng'
        }
        else if (status === "3") {
          query.status = 'Chuẩn bị hàng'
        }
        else if (status === "2") {
          query.status = 'Đợi xác nhận'
        }
        else if (status === "1") {
          query.status = 'Đã hủy'
        }
  
      }
  
  
  
  
      const orders = await Order.find(query)
        .populate('user', 'username')
        .sort({ createdAt: dateSortNumber })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
  
      const totalCount = await Order.countDocuments(query);
  
      res.json({
        orders,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  });





  // đường dẫn để hiển thị chi tiết đơn hàng
router.post('/settings/orderinfo',isNotNormalUser, async (req, res) => {
    try {
      const order = await Order.findOne({ orderID: req.body.id })
        .populate('user', 'firstName lastName username');
      if (!order) {
        return res.status(404).send('Order not found');
      }
  
      res.json(order);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });








  //đường dẫn để thay đổi tình trạng đơn hàng

  router.post('/settings/orderinfo/:orderid/:OrderStatus',isNVBH, async (req, res) => {
    try {
      const orderid = req.params.orderid;
      const OrderStatus = req.params.OrderStatus;
  
      const order = await Order.findOne({ orderID: orderid });
  
      if (!order) {
        return res.status(404).send('Order not found');
      }
      if (order.status === "Đã hủy" || order.status === "Hoàn thành") {
        return res.status(400).send('Cannot update an order that is already "Hoàn thành" or "Đã hủy"');
      }
  
      if (OrderStatus) {
        switch (OrderStatus) {
          case "1":
            order.status = "Đã hủy";
            break;
          case "2":
            order.status = "Đợi xác nhận";
            break;
          case "3":
            order.status = "Chuẩn bị hàng";
            break;
          case "4":
            order.status = "Đang giao hàng";
            break;
          case "5":
            order.status = "Hoàn thành";
            break;
          default:
            return res.status(400).send('Invalid order status');
        }
      }
      order.orderStatusUpdatedAt = Date.now();
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
  
  module.exports = router;





  










  