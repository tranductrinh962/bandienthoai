const express = require('express');
const router = express.Router()




const TongQuan = require('./giaoDienAdmin/TongQuan')
const HomThu = require('./giaoDienAdmin/HomThu')
const ListSanPham = require('./giaoDienAdmin/ListSanPham')
const ListNguoiDung = require('./giaoDienAdmin/ListNguoiDung')
const TaiKhoanUser = require('./TaiKhoanUser')
const xacThucNguoiDung = require('./xacThucNguoiDung')
const GioHangUser = require('./GioHangUser')
const LienHe = require('./LienHe')
const CuaHang = require('./CuaHang')
const VeChungToi = require('./VeChungToi')
const TrangChu = require('./TrangChu')



router.use('/',TongQuan)
router.use('/',ListSanPham)
router.use('/',ListNguoiDung)
router.use('/',TaiKhoanUser)
router.use('/',xacThucNguoiDung)
router.use('/',GioHangUser)
router.use('/',CuaHang)
router.use('/',LienHe)
router.use('/',HomThu)
router.use('/',VeChungToi)
router.use('/',TrangChu)

module.exports = router