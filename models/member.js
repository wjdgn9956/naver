const { sequelize, Sequelize : { QueryTypes}} = require("./index");
const logger = require("../lib/logger");
const bcrypt = require("bcrypt");

/**
 * 회원 Model 
 * 
 */

const member = {

    /**
     * 처리할 데이터
     */
    params : {},
    session : {},
    /**
     * 처리할 데이터 설정
     * 
     */
    data :function(params, session) {
        this.params = params;
        this.session = session;
        return this;
    },
    /**
     * 회원 가입 처리
     * 
     */
    join : async function() {
        try{
        const data = this.params;
        const session = this.session;

        let snsType = 'none';
        let snsId = "", hash = "";
        if (session.naverProfile) {
            snsType = 'naver';
            snsId = session.naverProfile.id;

        } else {
        hash = await bcrypt.hash(data.memPw, 10);
        }
        const sql = `INSERT INTO member (memId, memPw, memNm, email, cellPhone, snsType, snsId, address)
                        VALUES (:memId, :memPw, :memNm, :email, :cellPhone, :snsType, :snsId, :address)`;
        
        const replacements = {
                memId : data.memId,
                memPw : hash, 
                memNm : data.memNm,
                email : data.email,
                cellPhone : data.cellPhone,
                address : data.address,
                snsType,
                snsId,
        };

        await sequelize.query(sql,{
            replacements,
            type: QueryTypes.INSERT,
        });
            return true;

       } catch (err) {
            logger(err.stack, 'error');
            return false;
        }
    },
    /**
     * 로그인 처리
     * 
     */

    login : async function(memId, memPw ,req) {
        try {
        /**
         * 1.회원 정보 조회
         * 2. 비밀번호 검증 
         */
        const info = await this.get(memId);
        if (!info) {
            throw new Error(`존재하지 않는 회원입니다. -${memId}`);
        }   

        const match = await bcrypt.compare(memPw, info.memPw);
        if (match) { // 비밀번호 일치  -> 세션 처리
            req.session.memId = info.memId;
            return true;
        }

            return false;

        } catch(err) {
            logger(err.stack, 'error');
            return false;
        }
    },
    /**
     * 회원정보 조회
     * 
     */
    get : async function(memId) {
        try { 
            const sql = "SELECT * FROM member WHERE memId = ?";
            const rows = await sequelize.query(sql, {
                replacements : [memId],
                type : QueryTypes.SELECT,
            })
            
            return rows[0] || {};

        } catch (err) {
            logger(err.stack, 'error');
            return {};
        }
    },

    /**
     * 
     * 회원정보 수정
     * 
     */
    update : async function() {
        try {
            let addSet = "";
            const data = this.params;

            if (data.memPw) {
            addset += ", memPw = :memPw";
            const hash = await bcrypt.hash(data.memPw, 10);
            replacements.memPw = hash;
            }

            
            const sql = `UPDATE member
                         SET
                         memNm = :memNm,
                         email = :email,
                         cellPhone = :cellPhone
                         ${addSet}
                         address = :address
                         WHERE
                             idx = :idx`;

            const replacements = {
                memNm : data.memId,
                email : data.email,
                cellPhone : data.cellPhone,
                address : data.address,
            }                
            result = await sequelize.query(sql, {
                replacements,
                type:QueryTypes.UPDATE,
            })            
            return true;     
        } catch(err) {
            logger(err.stack, 'error')
            return false;
        }
    }
};

module.exports = member;