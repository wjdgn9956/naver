const express = require("express");
const router = express.Router();
const { adminOnly } = require("../middlewares/member_only");

// 관리자 접속 통제 
router.use(adminOnly);

/** 공통 미들웨어 */
router.use((req, res, next) => {
    res.locals.menuCode = 'main'; // 메뉴 코드

    next();
});

router.get("/", (req, res, next) => {

    return res.render("admin/main/index");
})


module.exports = router; 