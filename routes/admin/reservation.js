/** admin/reservation */
const { adminOnly } = require('../../middlewares/member_only');
const { alert, reload } = require('../../lib/common');
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
		/** 예약 목록 */
		.get(async (req, res, next) => {
			const data = await travel.getReservations(req.query.page, 20, req.query);
			
			data.statusList = travel.status;
			data.skey = req.query.skey;
			data.status = req.query.status;
			
			return res.render("admin/reservation/index", data);
		})
		.post(async (req, res, next) => {
			try {
				if (!req.body.idx) {
					throw new Error('처리할 예약을 선택하세요.');
				}
				
				if (!(req.body.idx instanceof Array)) {
					req.body.idx = [req.body.idx];
				}
				
				const mode = req.body.mode;
				req.body.idx.forEach(async (idx) => {
					if (mode == 'delete') { // 예약 삭제 
						await travel.deleteReservation(idx);
					} else { // 예약 수정 
						const status = req.body['status_' + idx];
						await travel.changeStatus(idx, status);
					}
				});
				// 완료되면 새로고침
				return reload(res, "parent");
			} catch (err) {
				return alert(err.message, res);
			}
			return res.send("");
		});


module.exports = router;