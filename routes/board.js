/**
* Front 게시판 라우터 
* /board
*/
const board = require('../models/board');
const { boardConfig } = require('../middlewares/board_config');
const { writeValidator } = require('../middlewares/board_validator');
const { alert, go } = require('../lib/common');
const express = require('express');
const router = express.Router();


/** 게시글 작성(양식, DB 처리), 수정, 삭제  - /board */
router.route('/:id')
		/** 작성 양식 - id (게시판 아이디) */
		.get(boardConfig, async (req, res, next) => {
			const data = { 
				config : req.boardConfig,
				addScript : ['board'],
				addCss : ['board'],
			};
			return res.render('board/form', data);
		})
		/** 작성 처리 - id (게시판 아이디) */
		.post(boardConfig, writeValidator, async (req, res, next) => {
			/* 작성 완료시 게시글 번호 */
			const idx = await board.data(req.body, req.session)
											 .write();
			
			if (idx === false) { // 게시글 작성 실패 
				return alert('게시글 작성 실패 하였습니다', res);
			}
			
			// 게시글 작성 성공시 게시글 보기 페이지로 이동 
			return go("/board/view/" + idx, res, "parent");
		})
		/** 수정 - id (게시글 번호) */
		.patch((req, res, next) => {
			
		})
		/** 삭제 - id (게시글 번호) */
		.delete((req, res, next) => {
			
		});


/** 게시글 목록 */
router.get("/list/:id", boardConfig, async (req, res, next) => {
	const data = { config : req.boardConfig };
	return res.render('board/list', data);
});	


/** 게시글 보기 */
router.get("/view/:idx", async (req, res, next) => {
	let data;
	try {
		const idx = req.params.idx;
		if (!idx) {
			throw new Error('잘못된 접근입니다');
		}
		
		data = await board.get(idx);
		if (!data.idx) {
			throw new Error('존재하지 않는 게시글입니다.');
		}
		
	} catch (err) {
		return alert(err.message, res, -1);
	}

	data.addCss = ["board"];
	
	return res.render("board/view", data);
});

/** 게시글 수정 */

router.get("/update/:idx", async (req, res, next) => {
	
	try {
		const idx = req.params.idx;
		if (!idx) {
			throw new Error("잘못된 접근입니다.");
		}

		const data = await board.get(idx);
		if (!data.idx) {
			throw new Error("존재하지 않는 게시글입니다.");
		}
		data.addCss = ['board'];
		data.addScript = ['board'];
		
		return res.render("board/form", data);

	} catch(err) {
		return alert(err.message, res, -1);
	}
	
});



module.exports = router;