/** admin/board */

/** admin/member */
const express = require("express");
const { adminOnly } = require("../../middlewares/member_only");
const router = express.Router();


// 관리자 접속 통제 
router.use(adminOnly);


/** 공통 미들웨어 */
router.use((req, res, next) => {
    res.locals.menuCode = 'board';
    next();
})

router.get("/", (req, res, next) => {

    return res.render("admin/board/index");
})



module.exports = router;