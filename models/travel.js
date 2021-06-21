const { sequelize, Sequelize : { QueryTypes } } = require('./index');
const { parseDate } = require('../lib/common');
const logger = require('../lib/logger');
const pagination = require('pagination');
const fileUpload = require("./file_upload");

/**
* 여행 관련
*
*/
const travel = {
	/** 처리할 데이터 */
	params : {},
		
	/** 교통편 */
	transportations : [
		{ type : 'airline_domestic', name1 : '국내선', name2 : '항공편' },
		{ type : 'airline_inter', name1 : '국제선', name2 : '항공편' },
		{ type : 'ship_domestic', name1 : '국내선', name2 : '배편' },
		{ type : 'ship_inter', name1 : '국제선', name2 : '배편' },
		{ type : 'train', name1 : '기차', name2 : '' },
		{ type : 'bus', name1 : '버스', name2 : '' },
	],
	
	/**
	* 처리할 데이터 설정
	*
	* @param Object params 처리할 데이터 
	* @return this
	*/
	data : function(params) {
		this.params = params;
		
		return this;
	},
	/**
	* 상품 등록 
	*
	* @param String goodsCd 상품코드
	* @param String goodsNm 상품명
	*
	* @return Boolean
	*/
	create : async function(goodsCd, goodsNm) {
		try {
			const sql = "INSERT INTO travelgoods (goodsCd, goodsNm) VALUES (?, ?)";
			await sequelize.query(sql, {
				replacements : [goodsCd, goodsNm],
				type : QueryTypes.INSERT,
			});
			
			return true;
		} catch (err) {
			logger(err.stack, 'error');
			return false;
		}
	},
	/**
	* 상품정보 저장 
	*
	* @return Boolean
	*/
	save : async function() {
		try {
			const sql = `UPDATE travelgoods 
									SET 
										category = :category,
										goodsNm = :goodsNm,
										shortDescription = :shortDescription,
										city = :city,
										itinerary = :itinerary,
										transportation = :transportation,
										shopping = :shopping,
										isGroup = :isGroup,
										priceAdult = :priceAdult,
										priceChild = :priceChild,
										contents = :contents,
										yoils = :yoils,
										startDate = :startDate,
										endDate = :endDate
								WHERE 
										goodsCd = :goodsCd`;
			
			let yoils = "";
			if (this.params.yoils) {
				if (!(this.params.yoils instanceof Array)) { // 배열객체가 아닌 경우는 단일 선택 -> 배열객체 변경
					this.params.yoils = [this.params.yoils];
				}
				
				yoils = this.params.yoils.join("||");
			}
			
			const replacements = {
				category : this.params.category || 'domestic',
				goodsNm : this.params.goodsNm,
				shortDescription : this.params.shortDescription,
				city : this.params.city,
				itinerary : this.params.itinerary || 0,
				transportation : this.params.transportation || 'bus',
				shopping : this.params.shopping || 0,
				isGroup : this.params.isGroup || 0,
				priceAdult : this.params.priceAdult || 0,
				priceChild : this.params.priceChild || 0,
				contents : this.params.contents,
				yoils,
				startDate : this.params.startDate || new Date(),
				endDate	: this.params.endDate || new Date(),
				goodsCd : this.params.goodsCd,
			};
			
			await sequelize.query(sql, {
				replacements,
				type : QueryTypes.UPDATE,
			});
			
			return true;
		} catch(err) {
			logger(err.stack, 'error');
			return false;
		}
	},
	/**
	* 상품정보 
	*
	* @param String goodsCd 상품코드
	* @return Object
	*/
	get : async function(goodsCd) {
		try {
			const sql = "SELECT * FROM travelgoods WHERE goodsCd = ?";
			const rows = await sequelize.query(sql, {
				replacements : [goodsCd],
				type : QueryTypes.SELECT,
			});
			
			const data = rows[0] || {};
			if (rows.length > 0) {
				data.mainImages = await this.getImages(goodsCd, "main");
				data.listImages = await this.getImages(goodsCd, "list");
				data.descImages = await this.getImages(goodsCd, "desc");
				
				/** 예약 가능 요일 */
				data.yoils = data.yoils?data.yoils.split("||"):[];
				data.yoilChecked = [];
				for (let i = 0; i < 7; i++) {
					let isChecked = false;
					data.yoils.forEach((yoil) => {
						if (yoil == i) {
							isChecked = true;
						}
					});
					data.yoilChecked[i] = isChecked;
				}
				
				// 가능한 최근 패키지 일정 
				const pack = await this.getPackage(goodsCd);
				if (pack) {
					// 판매가 조정 
					if (pack.addPrice) {
						data.priceAdult += pack.addPrice;
						data.priceChild += pack.addPrice;
					}
					
					data.pack = pack;
				}
				
				data.priceAdultStr = Number(data.priceAdult).toLocaleString();
				data.priceChildStr = Number(data.priceChild).toLocaleString();
			}
			
			return data;
		} catch (err) {
			logger(err.stack, 'error');
			return false;
		}
	},
	/**
	* 상품목록 
	*
	* @param Integer page 페이지번호, 기본값 1 
	* @param Integer limit 1페이지당 레코드수 
	* @param qs - req.query
	* 
	* @return Object
	*/
	getGoods : async function(page, limit, qs) {
		try {
			page = page || 1;
			limit = limit || 20;
			const offset = (page - 1) * limit;
			
			let prelink = "/admin/travel";
			if (qs) {
				const addQuery = [];
				for (key in qs) {
					if (key == 'page') continue;
					
					addQuery.push(`${key}=${qs[key]}`);
				}
				
				prelink += "?" + addQuery.join("&");
			}
			
			const replacements = {};
			let sql = `SELECT COUNT(*) as cnt FROM travelgoods`;
			const rows = await sequelize.query(sql, {
				replacements,
				type : QueryTypes.SELECT,
			});
			
			const totalResult = rows[0].cnt;
			const paginator = pagination.create('search', {prelink, current: page, rowsPerPage: limit, totalResult });
			
			replacements.offset = offset;
			replacements.limit = limit;
			
			sql = `SELECT * FROM travelgoods ORDER BY regDt DESC LIMIT :offset, :limit`;
			const list = await sequelize.query(sql, {
				replacements, 
				type : QueryTypes.SELECT,
			});
			
			list.forEach((v, i, _list) => {
				_list[i].regDt = parseDate(v.regDt).datetime;
			});
			
			const data = { 
				totalResult, 
				list, 
				offset, 
				pagination : paginator.render() 
			};
			return data;
		} catch (err) {
			logger(err.stack, 'error');
			return {};
		}
	},
	/**
	* 상품이미지 조회
	*
	* @param String goodsCd 상품코드
	* @param String type  (main - 메인, list - 목록)
	* 
	* @return Array
	*/
	getImages : async function(goodsCd, type) {
		const files = await fileUpload.gets(goodsCd + "_" + type);

		const data = files.editor?files.editor:[];
		
		return data;
	},
	/**
	* 상품 삭제 
	*
	* @param String goodsCd
	* @return Boolean
	*/
	delete : async function(goodsCd) {
		try {
			/** 
			  1. 이미지 파일 삭제 
			  2. 상품 DB 삭제 
			*/
			 const data = await this.get(goodsCd);
			 if (!data.goodsCd) {
				 throw new Error('등록되지 않은 상품입니다.');
			 }
			 
			 /** 이미지 파일 삭제 S */
			 ["main", "list", "desc"].forEach(async (type) => {
				const key = `${type}Images`;
				if (data[key] && data[key].length > 0) {
					data[key].forEach(async (v) => {
						await fileUpload.delete(v.idx);
					});
				}
			 });
			 /** 이미지 파일 삭제 E */
			 
			 /** 상품 DB 데이터 삭제 S */
			 const sql = "DELETE FROM travelgoods WHERE goodsCd = ?";
			 await sequelize.query(sql, {
				replacements : [goodsCd],
				type : QueryTypes.DELETE,
			 });
			 /** 상품 DB 데이터 삭제 E */
			 
			 return true;
		} catch (err) {
			logger(err.stack, 'error');
			return false;
		}
	},
	/**
	* 패키지 가능 일정 조회
	*
	* @param String goodsCd 
	* @return Array
	*/
	getPackageSchedules : async function(goodsCd) {
		try {
			const sql = "SELECT itinerary, yoils, startDate, endDate FROM travelgoods WHERE goodsCd = ?";
			const rows = await sequelize.query(sql, {
				replacements : [goodsCd],
				type : QueryTypes.SELECT,
			});
			if (rows.length == 0)
				throw new Error('등록되지 않은 상품입니다.');
			
			const data = rows[0];
			if (!data.yoils || !data.startDate || !data.endDate || !data.itinerary) {
				throw new Error("가능한 요일, 기간 설정이 되지 않았습니다.");
			}
			
			const yoils = data.yoils.split("||");
			let startStamp = new Date(data.startDate + " 00:00:00").getTime();
			const endStamp = new Date(data.endDate + " 23:59:59").getTime();
			const oneDayStamp = 60 * 60 * 24 * 1000;
			
			const todayStamp = new Date().getTime() + oneDayStamp * 2;
			if (todayStamp > startStamp) startStamp = todayStamp;
			
			const list = [];
			for (let i = startStamp; i < endStamp; i += oneDayStamp) {
				const date = new Date(i);
				const yoil = date.getDay();
				if (yoils.indexOf(String(yoil)) != -1 || yoils.indexOf(yoil) != -1 ) {
					const sstamp = date.getTime();
					const estamp = sstamp + oneDayStamp * (Number(data.itinerary) - 1);
					if (estamp > endStamp) continue;
					
					const sdate = parseDate(sstamp).date;
					const edate = parseDate(estamp).date;
					
					const pac = {
						sstamp,
						estamp,
						sdate,
						edate,
					};
					list.push(pac);
				}
			}
			
			return list;
		} catch (err) {
			logger(err.stack, 'error');
			return [];
		}
	},
	/**
	* 패키지 등록 
	*
	* @return Boolean
	*/
	registerPackage : async function() {
		try {
			const period = this.params.period.split("_");
						
			const replacements = {
				startDate :  new Date(Number(period[0])),
				endDate : new Date(Number(period[1])),
				goodsCd : this.params.goodsCd,
				addPrice : this.params.addPrice || 0,
				minPersons : this.params.minPersons || 0,
				maxPersons : this.params.maxPersons || 0,
			}
			
			const sql = `INSERT INTO travelgoods_package (startDate, endDate, goodsCd, addPrice, minPersons, maxPersons)
									VALUES (:startDate, :endDate, :goodsCd, :addPrice, :minPersons, :maxPersons)`;
			await sequelize.query(sql, {
				replacements, 
				type : QueryTypes.INSERT,
			});
			
			return true;
		} catch (err) {
			logger(err, 'error');
			return false;
		}
	},
	/**
	* 패키지 수정 
	*
	* @return Boolean 
	*/ 
	updatePackage : async function() {
		try {
			const dates = this.params.period.split("_");
			const startDate = new Date(Number(dates[0]));
			const endDate = new Date(Number(dates[1]));
			
			const sql = `UPDATE travelgoods_package 
									SET 
										addPrice = :addPrice,
										minPersons = :minPersons,
										maxPersons = :maxPersons
								WHERE 
										startDate = :startDate AND endDate = :endDate AND goodsCd = :goodsCd`;
			const replacements = {
				addPrice : this.params.addPrice || 0,
				minPersons : this.params.minPersons || 0,
				maxPersons : this.params.maxPersons || 0,
				startDate,
				endDate,
				goodsCd : this.params.goodsCd,
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
	* 일정 삭제 
	*
	* @param String goodsCd 상품코드 
	* @param String startDate 일정 시작일
	* @param String endDate 일정 종료일 
	* 
	* @return Boolean
	*/
	deletePackage : async function(goodsCd, startDate, endDate) {
		try {
			if (!goodsCd || !startDate || !endDate) {
				throw new Error('상품코드, 일정시작일, 일정 종료일은 필수 항목 입니다.');
			}
			
			const sql = "DELETE FROM travelgoods_package WHERE goodsCd = :goodsCd AND startDate = :startDate AND endDate = :endDate";
			const replacements = {
				goodsCd, 
				startDate : new Date(Number(startDate)),
				endDate : new Date(Number(endDate)),
			};
			
			await sequelize.query(sql, {
				replacements,
				type : QueryTypes.DELETE,
			});
			
			return true;
		} catch (err) {
			logger(err.stack, 'error');
			return false;
		}
	},
	/**
	* 등록된 패키지 목록 
	*
	* @param String goodsCd 상품코드 
	* @return Array
	*/
	getPackages : async function (goodsCd) {
		try {
			const sql = `SELECT * FROM travelgoods_package WHERE goodsCd = ? ORDER BY startDate`;
			const list = await sequelize.query(sql, {
				replacements : [goodsCd],
				type : QueryTypes.SELECT,
			});
			
			list.forEach((v, i, _list) => {
				_list[i].regDt = parseDate(v.regDt).datetime;
				const sdate = Date.parse(v.startDate + " 00:00:00");
				const edate = Date.parse(v.endDate + " 00:00:00");
				_list[i].startDate = parseDate(v.startDate).date;
				_list[i].endDate = parseDate(v.endDate).date;
				_list[i].period = `${sdate}_${edate}`;
			});
			
			return list;
		} catch (err) {
			logger(err.stack, 'error');
			return false;
		}
	},
	/**
	* 패키지 일정 정보 
	*
	* @param String goodsCd 상품코드
	* @param String starteDate 일정 시작일
	* @param String endDate 일정 종료일
	* 
	* @return Object
	*/
	getPackage : async function(goodsCd, startDate, endDate) {
		try {
			if (!goodsCd) {
				throw new Error('상품코드 누락');
			}
			
			const nextDate = new Date(Date.now() + 60 * 60 * 24);
			
			startDate = startDate?new Date(startDate):nextDate;
			const replacements = { goodsCd, startDate };
			let sql = "SELECT * FROM travelgoods_package WHERE goodsCd = :goodsCd";
			if (endDate) {
				replacements.endDate = new Date(endDate);
				sql += " AND startDate = :startDate AND endDate = :endDate";
			} else { 
				sql += " AND startDate >= :startDate";
			}
			
			sql += " LIMIT 1";
			
			const rows = await sequelize.query(sql, {
				replacements,
				type : QueryTypes.SELECT,
			});
			
			const data = rows[0] || {};
			if (rows.length > 0) {
				const sDate = parseDate(data.startDate).date;
				const eDate = parseDate(data.endDate).date;
				
				data.period = `${sDate}~${eDate}`;
			}
			
			return data;
		} catch (err) {
			logger(err.stack, 'error');
			return false;
		}
	},
	/**
	* 예약 신청
	*
	* return Integer|Boolean 성공한 경우 등록번호(idx), 실패 false
	*/
	apply : async function() {
		
		let transaction;
		try {
			/**
			* travelreservation 
			*  -> idx -> travelreservation_person 
			*/
			transaction = await sequelize.transaction();
			const period = this.params.period.split("_");
			
			let sql = `INSERT INTO travelreservation (memNo, goodsCd, startDate, endDate, name, birth, email, cellPhone)
								VALUES (:memNo, :goodsCd, :startDate, :endDate, :name, :birth, :email, :cellPhone)`;
			let replacements = {
					memNo : this.params.memNo || 0,
					goodsCd : this.params.goodsCd,
					startDate : new Date(Number(period[0])),
					endDate : new Date(Number(period[1])),
					name : this.params.name,
					birth : this.params.birth,
					email : this.params.email,
					cellPhone : this.params.cellPhone,
			};
			const result = await sequelize.query(sql, {
				replacements,
				transaction,
				type : QueryTypes.INSERT,
			});
			
			const idxReservation = result[0];
			for (const personType of ['adult', 'child', 'infant']) {
				const cnt = Number(travel.params['goodsCnt_' + personType]);
				if (cnt == 1) { // 인원수가 1명일때 
					 travel.params['travelerNm_' + personType] = [travel.params['travelerNm_' + personType]];
					 travel.params['travelerBirth_' + personType] = [travel.params['travelerBirth_' + personType]];
					 travel.params['travelerGender_' + personType] = [travel.params['travelerGender_' + personType]];
					 if (personType == 'adult') {
						travel.params['travelerCellPhone_' + personType] = [travel.params['travelerCellPhone_' + personType]];
						travel.params['travelerEmail_' + personType] = [travel.params['travelerEmail_' + personType]];
					 }
				}
				
				for (let i = 0; i < cnt; i++) {
					const sql = `INSERT INTO travelreservation_persons (idxReservation, personType, travelerNm, travelerBirth, travelerGender, travelerCellPhone, travelerEmail)
											VALUES (:idxReservation, :personType, :travelerNm, :travelerBirth, :travelerGender, :travelerCellPhone, :travelerEmail)`;
					 
					const replacements = {
						idxReservation,
						personType,
						travelerNm : travel.params['travelerNm_' + personType][i] || "",
						travelerBirth : travel.params['travelerBirth_' + personType][i] || "",
						travelerGender : travel.params['travelerGender_' + personType][i] || "",
						travelerCellPhone : travel.params['travelerCellPhone_' + personType]?travel.params['travelerCellPhone_' + personType][i]:"",
						travelerEmail : travel.params['travelerEmail_' + personType]? travel.params['travelerEmail_' + personType][i]:"",
					};

					await sequelize.query(sql, {
						replacements,
						transaction,
						type : QueryTypes.INSERT,
					});
				}
			};
		
			await transaction.commit();
			
			return idxReservation;
		} catch (err) {
			logger(err.stack, 'error');
			await transaction.rollback();
			return false;
		}
	},
	/**
	 * 예약 신청 정보 
	 * 
	 * @param Integer idx 신청번호 
	 * @return Object|Boolean 
	 */
	getApply : function(idx) {
		try {
			let sql = `SELECT a.*, b.memNm, b.memId FROM travlreservation AS a 
					   LEFT JOIN  member AS b ON a.memNo = b.memNo 
					   WHERE a.idx = ?`
			cosnt data = await sequelize.query(sql, {
				replacements : [idx],
				type : QueryTypes.SELECT,
			})
			
			const data = rows[0] || {};
			if (data.idx) {
				// 여행자 정보 
				sql = "SELECT * FROM travelreservation_persons WHERE idxReservation = ? ORDER BY regDt";
			}
		} catch(err) {
			logger(err.stack);
			return false;
		}
	},

module.exports = travel;