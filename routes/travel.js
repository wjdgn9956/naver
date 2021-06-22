const { alert, go } = require("../lib/common");
const { reservationValidator, reservationApplyValidator, cancelValidator } = require('../middlewares/travel_validator');
const express = require('express');
const travel = require('../models/travel');
const router = express.Router();

/** 여행상품 목록 */
router.get("/", async (req, res, next) => {
	const data = await travel.getGoods(req.query.page, 20, req.query, true);
	data.addCss = ['travel'];
	console.log("data", data);
	return res.render("travel/index", data);
});

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
		if (idx) { // 예약 신청 성공 -> 예약 신청 조회
			return go("/travel/reservation/" + idx, res, "parent");
		}
			
		// 예약신청 실패
		return alert("예약신청 실패하였습니다", res);
	});

/** 예약 신청 취소 */
router.post("/reservation/cancel", cancelValidator, async (req, res, next) => {
	const idx = req.body.idx;
	const result = await travel.cancel(idx);
	if (result) { // 예약 취소 성공
		return alert("예약취소 되었습니다.", res, 'reload', 'parent');
	}
	
	// 예약 취소 실패 
	return alert("예약취소 실패하였습니다.", res);
});

/** 여행 예약 신청 조회 */
router.route("/reservation/:idx")
		/** 신청 조회 */
		.get(async(req, res, next) => {
			try {
				const idx = req.params.idx;
				const data = await travel.getApply(idx, req);
				if (!data) {
					throw new Error('접수되지 않은 예약번호입니다.');
				}
				
				/** 관리자 이거나, 본인이 신청한 예약만 조회 가능 */
				if (!req.isLogin || req.session.memNo != data.memNo) {
					if (!req.isLogin || !req.member.isAdmin) {
						throw new Error('조회 권한이 없습니다.');
					}
				}
				
				data.addCss = ['travel'];
				return res.render("travel/view", data);
			} catch (err) {
				return alert(err.message, res, -1);
			}
		})
		/** 신청 취소 */
		.delete((req, res, next) => {
			
		});


/** 여행 상품 상세 */
router.route("/:goodsCd")
		/** 상품 상세 */
		.get(async (req, res, next) => {
			try {
				const goodsCd = req.params.goodsCd;
				const data = await travel.get(goodsCd);
				if (!data.goodsCd) {
					throw new Error("등록되지 않은 상품입니다.");
				}
				
				if (!data.pack.startDate) {
					throw new Error("등록된 일정이 없습니다.");
				}
				
				data.addCss = ["travel"];
				data.addScript = ["travel"];
				return res.render("travel/goods", data);
			} catch (err) {
				return alert(err.message, res, -1);
			}
		});
		

module.exports = router;