const { alert } = require("../lib/common");

/**
* 게시판 유효성 검사 미들웨어
*
*/

/** 게시글 작성, 수정 */
module.exports.writeValidator = (req, res, next) => {
	const required = {
		id : '잘못된 접근입니다', 
		subject : '제목을 입력해 주세요.',
        poster : '작성자를 입력해 주세요',
		contents : '내용을 입력해 주세요.',
	};
	
	// 비회원은 수정, 삭제 비밀번호가 필수 항목 */
	if (!req.isLogin) {
		required.password = '게시글 수정, 삭제 비밀번호를 입력하세요.';
	}
	
	try {
		for (column in required) {
			if (!req.body[column]) {
				throw new Error(required[column]);
			}
		}
	} catch(err) {
		return alert(err.message, res);
	}
	
	next();
};