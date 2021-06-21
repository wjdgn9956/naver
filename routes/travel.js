const { alert, go } = require("../lib/common");
const { reservationApplyValidator, reservationValidator } = require("../middlewares/travel_validator");
const express = require('express');
const travel = require('../models/travel');
const router = express.Router();


/** 여행 예약하기 */
router.route("/reservation")
		.post(reservationValidator, async (req, res, next) => {
			try {
				goodsCd = req.body.goodsCd;

				const data = await travel.get(goodsCd);
				data.adult = req.body.goodsCnt_adult || 1;
				data.child = req.body.goodsCnt_child || 0;
				data.infant = req.body.goodsCnt_infant || 0;
				data.totalPriceAdult = data.priceAdult * data.adult;
				data.totalPriceChild = data.priceChild * data.child;
				data.totalPrice = data.totalPriceAdult  + data.totalPriceChild;

				data.totalPriceAdult = data.totalPriceAdult.toLocaleString();
				data.totalPriceChild = data.totalPriceChild.toLocaleString();
				data.totalPrice = data.totalPrice.toLocaleString();
				
				data.packages = await travel.getPackages(goodsCd);
				
				data.addCss = ['travel'];
				data.addScript = ['travel'];
				return res.render("travel/form", data);
			} catch (err) {
				return alert(err.message, res, -1);
			}
		});

			/** 여행 예약하기 신청 처리 */
router.post("/reservation/apply", reservationApplyValidator, async (req, res, next) => {
	
			req.body.memNo = req.session.memNo; 
			const idx = await travel.data(req.body).apply();
			if (idx) { // 예약 신청 성공 -> 예약 신청 완료
				return go ("/travel/reservation/" + idx, res, "parent");
			}

			// 예약 신청 실패 
			return alert("예약신청 실패하였습니다.", res);
		});

/** 여행 예약 신청 조회 */
router.route("/reservation/:idx")
		/** 신청 조회 */
		.get(async (req, res, next) => {

			try{
			const idx = req.params.idx;
			const data = await travel.getApply(idx);
			if (!data) {
				throw new Error("접수되지 않은 예약번호입니다.");
			}

			data.addCss = ['travel'];
			data.addScript = ['travel'];
			return res.render("travel/view");
			} catch(err) {
				return alert(err.message, rese, -1);
			}
		})
		/** 신청 취소 */
		.delete((req, res, next) => {

		})

/** 여행 상품 상세 */
router.route("/:goodsCd")
		/** 상품 상세 */
		.get(async (req, res, next) => {
			const goodsCd = req.params.goodsCd;
			const data = await travel.get(goodsCd);
			
			data.addCss = ["travel"];
			data.addScript = ["travel"];
		
			return res.render("travel/goods", data);
		});
		

module.exports = router;