const express = require('express');
const travel = require('../models/travel');
const router = express.Router();

/** 여행 예약하기 */
router.route("/reservation")
		.post((req, res, next) => {
			console.log(req.body);
			return res.render("travel/form");
		});

/** 여행 상품 상세 */
router.route("/:goodsCd")
		/** 상품 상세 */
		.get(async (req, res, next) => {
			const goodsCd = req.params.goodsCd;
			const data = await travel.get(goodsCd);
			
			data.addCss = ["travel"];
			data.addScript = ["travel"];
			console.log(data);
			return res.render("travel/goods", data);
		});
		

module.exports = router;