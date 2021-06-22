const express = require('express');
const { alert } = require('../lib/common');
const router = express.Router();
const travel = require('../models/travel');
const { memberOnly } = require("../middlewares/member_only");

/**
* 마이페이지 
*
*/

// 회원전용 페이지 체크 */
router.use(memberOnly);

router.get("/", (req, res, next) => {
	
	return res.render("mypage/index");
});

router.get("/reservation", async (req, res, next) => {
	const data = await travel.getReservations(req.query.page, 20, req.query, req.session.memNo);
	return res.render("mypage/reservation", data);
});

module.exports = router;