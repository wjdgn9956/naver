/** admin/reservation */
const { adminOnly } = require('../../middlewares/member_only');
const travel = require('../../models/travel');
const express = require('express');
const router = express.Router();

// 관리자 접속 통제
router.use(adminOnly);

/** 공통 미들웨어 */
router.use((req, res, next) => {
	res.locals.menuCode = 'reservation';
	next();
});


router.route("/")
		.get(async (req, res, next) => {
			const data = await travel.getReservations(req.query.page, 20, req.query);
			data.statusList = travel.status;
			return res.render("admin/reservation/index", data);
		});


module.exports = router;