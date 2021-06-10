const { sequelize, Sequelize : { QueryTypes } } = require("./index");
const logger = require("../lib/logger");
const fs = require('fs').promises;
const path = require('path');

/**
* 게시판 Model
*
*/
const board = {
	/**
	* 게시판 생성 
	*
	* @param String id 게시판아이디 
	* @param String boardNm 게시판명 
	* 
	* @return Boolean 생성 성공시 true
	*/
	create : async function(id, boardNm) {
		try {
			const sql = "INSERT INTO board (id, boardNm) VALUES (:id, :boardNm)";
			await sequelize.query(sql, {
				replacements : { id, boardNm },
				type : QueryTypes.INSERT,
			});
			
			return true;
		} catch (err) {
			logger(err.stack, 'error');
			return false;
		}
	},
	/**
	* 게시판 목록 
	*
	* @return Array
	*/
	getBoards : async function() {
		try {
			const sql = "SELECT * FROM board ORDER BY regDt DESC";
			const rows = await sequelize.query(sql, {
					type : QueryTypes.SELECT,
			});
			
			return rows;
		} catch (err) {
			logger(err.stack, 'error');
			return [];
		}
	},
	/**
	* 게시판 설정 조회 
	*
	* @params String id 게시판 아이디 
	* @return Object
	*/
	getBoard : async function(id) {
		try {
			const sql = "SELECT * FROM board WHERE id = ?";
			const rows = await sequelize.query(sql, {
				replacements : [id],
				type : QueryTypes.SELECT,
			});
			
			const data = rows[0]?rows[0]:{};
			if (data) {
				data.categories = data.category.split("||");
				data.category = data.categories.join("\r\n");
				
				data.skins = await this.getSkins(); // 게시판 스킨
				data.skin = data.skin || data.skins[0];
				
				const skinPath = path.join(__dirname, `../views/board/skins/${data.skin}`);
				data.skinPath = {
					list : skinPath + "/_list.html",
					form : skinPath + "/_form.html",
					view : skinPath + "/_view.html",
				};
			}
			
			return data;
		} catch(err) {
			logger(err.stack, 'error');
			return {};
		}
	},
	/**
	* 게시판 설정 저장 
	*
	* @params Object params 
	* @return Boolean 
	*/
	save : async function (params) {
		try {
			if (!params.id || !params.boardNm) {
				throw new Error('게시판 아이디와 게시판명 누락');
			}
			
			let category = [];
			if (params.category) {
				params.category.split("\r\n")
									.forEach((v) => {
										v = v.trim();
										if (v) {
											category.push(v);
										}
									});
				category = category.join("||");
			}
			
			const sql = `UPDATE board 
								SET 
									boardNm = :boardNm,
									category = :category,
									accessType = :accessType,
									useImageUpload = :useImageUpload,
									useFileUpload = :useFileUpload,
									skin = :skin 
								WHERE 
									id = :id`;
			const replacements = {
				boardNm : params.boardNm,
				category,
				accessType : params.accessType,
				useImageUpload : params.useImageUpload?1:0,
				useFileUpload : params.useFileUpload?1:0,
				skin : params.skin,
				id : params.id,
			};
			
			await sequelize.query(sql, {
				replacements,
				type : QueryTypes.UPDATE,
			});
			
			return true;
		} catch (err) {
			logger(err.stack, 'error');
			return false;
		}
	},
	/**
	* 게시판 스킨 
	*
	* @return Array
	*/
	getSkins : async function() {
		try {
			const files = await fs.readdir(path.join(__dirname, "/../views/board/skins"));
			return files;
		} catch (err) {
			logger(err.stack, 'error');
			return [];
		}
	},
};

module.exports = board;