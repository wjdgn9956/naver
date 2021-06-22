const { joinValidator } = require('../middlewares/join_validator');
const { loginValidator } = require('../middlewares/login_validator');
const { memberOnly, guestOnly } = require('../middlewares/member_only');
const member = require("../models/member"); // Member Model
const naverLogin = require('../models/naver_login'); // 네이버 로그인
const { alert, go } = require('../lib/common');
const express = require('express');
const router = express.Router();

/** /member/join  */
router.route("/join")
		/** 회원 가입 양식 */
		.get(guestOnly, (req, res, next) => {			
			const data = {
				naverProfile : req.session.naverProfile || {},
			};
			
			if (data.naverProfile) {
				data.memNm = data.naverProfile.name;
				data.email = data.naverProfile.email;
			}

			return res.render('member/form', data);
		})
		/** 회원 가입 처리 */
		.post(joinValidator, async (req, res, next) => {
			
			const result = await member.data(req.body, req.session).join();
			if (result) { // 회원 가입 성공 -> 로그인 페이지
				if (req.session.naverProfile) { // 네이버 회원가입 -> 바로 로그인 처리 
					const re = await naverLogin.login(req, res);
					if (re) { // 소셜 로그인 성공 
						 return go("/", res, "parent");
					}
				} else { // 일반회원가입
					return go("/member/login", res, "parent");
				}
			}
			
			return alert("회원가입에 실패하였습니다.", res);
		});

/** /member/login */
router.route('/login')
		/** 로그인 양식 */
		.get(guestOnly, (req, res, next) => {
			const data = {
				naverLoginUrl : naverLogin.getCodeUrl(),
			};
			
			// returnUrl
			if (req.query.returnUrl) {
				req.session.returnUrl = req.query.returnUrl;
			}
			
			return res.render("member/login", data);
		})
		/** 로그인 처리 */
		.post(loginValidator, async (req, res, next) => {
			
			const result = await member.login(req.body.memId, req.body.memPw, req);
			if (result) { // 로그인 성공 -> 메인 페이지
				let url = "/";
				if (req.session.returnUrl) {
					url = req.session.returnUrl;
					delete req.session.returnUrl;
				}
				return go(url, res, "parent");
			}
			
			return alert("로그인에 실패하셨습니다.", res);
		});

/** /member/logout */
router.get('/logout', (req, res, next) => {
	req.session.destroy();
	return res.redirect("/member/login");
});


/** /member/login_callback */
router.get("/login_callback", async (req, res, next) => {
	
	const result = await naverLogin.checkExists(req.query.code, req.query.state, req);
	if (result) { // 이미 네이버 계정이 존재 -> 로그인
		const re = await naverLogin.login(req, res);
		if (re) { // 네이버 로그인 성공 
			return res.redirect('/');
		}
		
		return alert('네이버 로그인 실패 하였습니다', res, '/');
	} else { // 존재 하지 않으면 -> 회원가입 
		return res.redirect('/member/join');
	}
});

/** 회원정보 수정 */
router.route("/update")
	  .get((req, res, next) => {
		if (!req.isLogin) {
			return alert("회원전용 페이지입니다.", res, -1);
		}
		res.render("member/form");
	  })

	  .patch( joinValidator, async(req, res, next) => {
		 	try {
				const result = await member.data(req.body).update();
				if (result) {
					return go("/mypage", res);
				}
			 } catch (err) {
				 return alert("회원 수정 실패", res);
			 }
	  });

module.exports = router;