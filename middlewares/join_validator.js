
const logger = require("../lib/logger");
const { alert } = require("../lib/common");
const { sequelize, Sequelize : {QueryTypes}} = require("../models");
/**
 * 회원가입, 수정 유효성 검사 
 * 
 */
module.exports.joinValidator = async (req, res, next) => {

    console.log(req.body);
     
    try {

		const memId = req.body.memId;
		if (memId.length < 8 || memId.length > 20 || /[^a-z0-9]/i.test(memId)) {
			throw new Error('아이디는 8~20자의 알파벳과 숫자로 입력해 주세요.');
		}
		
		/** 중복 아이디 체크 */
		const sql = "SELECT COUNT(*) as cnt FROM member WHERE memId = ?";
		const rows = await sequelize.query(sql, {
			replacements : [memId], 
			type : QueryTypes.SELECT,
		});
		
		if (rows[0].cnt > 0) { // 중복 아이디 
			throw new Error('이미 사용중인 아이디 입니다');
		}
		
		/**
			유효성 검사 - 비밀번호
				0. memPw, memPwRe 일치 여부 - O
				1. 자리수  8 ~ 20  - O 
				2. 알파벳(최소 1자 이상의 대문자 포함) + 1자 이상의 숫자, + 1자 이상의 특수문자
		*/
		const memPw = req.body.memPw;
		if (memPw && memPw !== req.body.memPwRe) {
			throw new Error('비밀번호 확인이 일치하지 않습니다.');
		}
		
		if (memPw.length < 8 || memPw.length > 20 || !/[a-z]/.test(memPw) || !/[A-Z]/.test(memPw) || !/[0-9]/.test(memPw) || !/[~!@#$%^&*]/.test(memPw)) {
			throw new Error('비밀번호는 8~20자 알파벳(대소문자 포함), 숫자, 특수문자로 구성해 주세요.');
		}
		

    } catch(err) {
        return alert(err.message, res,)
    }
    next();
};