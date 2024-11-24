const express = require('express');
const router = express.Router()



const ListThuongHieu = require('./adminApi/ListThuongHieu')
const TongQuan = require('./adminApi/TongQuan')
const ListDonHang = require('./adminApi/ListDonHang')
const ListSanPham = require('./adminApi/ListSanPham')
const ListNguoiDung = require('./adminApi/ListNguoiDung')
const TaiKhoanUser = require('./TaiKhoanUser')
const xacThucNguoiDung = require('./xacThucNguoiDung')
const GioHangUser = require('./GioHangUser')
const CuaHang = require('./CuaHang')
const CapNhatSoLuong = require('./CapNhatSoLuong')


router.use('/',ListThuongHieu)
router.use('/',TongQuan)
router.use('/',ListSanPham)
router.use('/',ListNguoiDung)
router.use('/',ListDonHang)
router.use('/',TaiKhoanUser)
router.use('/',xacThucNguoiDung)
router.use('/',GioHangUser)
router.use('/',CuaHang)
router.use('/',CapNhatSoLuong)

module.exports = router