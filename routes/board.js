/**
* Front 게시판 라우터 
* /board
*/
const board = require('../models/board');
const { boardConfig } = require('../middlewares/board_config');
const express = require('express');
const router = express.Router();


/** 게시글 작성(양식, DB 처리), 수정, 삭제  - /board */
router.route('/:id')
		/** 작성 양식 - id (게시판 아이디) */
		.get(boardConfig, async (req, res, next) => {
			const data = { config : req.boardConfig };
			return res.render('board/form', data);
		})
		/** 작성 처리 - id (게시판 아이디) */
		.post(boardConfig, (req, res, next) => {
			
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
router.get("/view/:idx", (req, res, next) => {
	
	return res.send("");
});



module.exports = router;