/** admin/travel */
const { adminOnly } = require('../../middlewares/member_only');
const { alert, reload, getYoils } = require('../../lib/common');
const travel = require('../../models/travel');
const express = require('express');
const router = express.Router();

// 관리자 접속 통제
router.use(adminOnly);

/** 공통 미들웨어 */
router.use((req, res, next) => {
	res.locals.menuCode = 'travelGoods';
	next();
});


router.route("/")
		/** 여행상품 등록, 목록 */
		.get(async (req, res, next) => {
			const data = await travel.getGoods(req.query.page, 20, req.query);
			
			return res.render("admin/travel/index", data);
		})
		/** 여행 상품 등록 처리 */
		.post(async (req, res, next) => {
			const result = await travel.create(req.body.goodsCd, req.body.goodsNm);
			if (result) { // 등록 성공시 -> 새로고침 
				return reload(res, 'parent');
			}
			
			// 실패시 
			return alert('상품등록 실패하였습니다.', res);
		})
		/** 상품 삭제 */
		.delete(async (req, res, next) => {
			try {
				let list = req.body.goodsCd;
				if (!list) {
					throw new Error("삭제할 상품을 선택하세요.");
				}
				
				if (!(list instanceof Array)) { // goodsCd가 배열이 아니면 -> 배열 객체로 변환
					list = [list];
				}
				
				list.forEach(async (goodsCd) => {
					await travel.delete(goodsCd);
				});
				
				return alert("삭제되었습니다.", res, "reload", "parent");
			} catch (err) {
				return alert(err.message, res);
			}
		});

router.route("/:goodsCd")
		/** 상품 수정 양식 */
		.get(async (req, res, next) => {
			try {
				const goodsCd = req.params.goodsCd;
				const data = await travel.get(goodsCd);
				data.transportations = travel.transportations;
				
				if (!data.goodsCd) {
					throw new Error('등록된 상품이 아닙니다.');
				}
				
				data._yoils = getYoils(); // 선택 가능 요일 목록
				
				data.addScript = ['travel'];
				
				return res.render("admin/travel/form", data);
			} catch (err) {
				return alert(err.message, res, -1);
			}
		})
		/** 상품 수정 처리 */
		.post(async (req, res, next) => {
			const result = await travel.data(req.body).save();
			if (result) { // 상품 수정 성공 -> 새로고침 
				return alert("저장되었습니다", res, 'reload', 'parent');
			}
			
			// 실패 
			return alert("상품 저장하기 실패 하였습니다.", res);
		});

/** 패키지 일정 관리 */
router.route("/package/:goodsCd")
		/** 일정 등록 양식 */
		.get(async (req, res, next) => {
			const goodsCd = req.params.goodsCd;
			const schedules = await travel.getPackageSchedules(goodsCd);
			
			const data = {
					goodsCd,
					schedules,
			};
			
			return res.render("admin/travel/package", data);
		})
		/** 일정 등록 처리 */
		.post(async (req, res, next) => {
			req.body.goodsCd = req.params.goodsCd;
			const result = await travel.data(req.body).registerPackage();
						
			return res.send("");
		});

module.exports = router;