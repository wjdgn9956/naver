const express = require('express');
const path = require('path');
const morgan = require('morgan');
const nunjucks = require('nunjucks');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('./lib/logger');
const { sequelize } = require('./models');
const { mainMenu } = require('./middlewares/main_menu'); // 메인 메뉴 
const { loginSession } = require('./middlewares/login_session'); // 로그인 세션 처리 
const { bodyClass } = require('./middlewares/body_class'); // bodyClass
const chat = require("./middlewares/chat");
const app = express();


const server = require('http').createServer(app);
const io = require('socket.io')(server);
chat(io); // 채팅 미들웨어

/** front 라우터 */
const indexRouter = require('./routes'); // 메인 페이지 
const memberRouter = require('./routes/member'); // 회원 페이지 
const boardRouter = require('./routes/board'); // 게시판 페이지
const fileRouter = require("./routes/file"); // 파일 업로드
const travelRouter = require("./routes/travel"); // 여행 상품 페이지
const mypageRouter = require("./routes/mypage"); //마이페이지 라우터

/** admin 라우터 */
const adminRouter = require('./routes/admin'); // 관리자 메인페이지 
const adminMemberRouter = require('./routes/admin/member'); // 회원관리
const adminBoardRouter = require('./routes/admin/board'); // 게시판관리 
const adminTravelRouter = require("./routes/admin/travel"); // 여행 상품관리
const adminReservationRouter = require("./routes/admin/reservation"); // 여행 예약관리


dotenv.config();



app.set('port', process.env.PORT || 3000);
app.set('view engine', 'html');
nunjucks.configure('views', {
		express : app,
		watch : true,
});

/** 데이터베이스 연결 */
sequelize.sync({ force : false})
	.then(() => {
		logger("데이터베이스 연결 성공");
	})
	.catch((err) => {
		logger(err.message, "error");
		logger(err.stack, "error");
	});

if (process.env.NODE_ENV == 'production') {
	app.use(morgan('combined'));
} else {
	app.use(morgan('dev'));
}

app.use(cookieParser(process.env.COOKIE_SECRET)); // CookieParser 미들웨어 등록

/** 세션 기본 설정 */
app.use(session({
	resave : false,
	saveUninitialized : true,
	secret : process.env.COOKIE_SECRET,
	cookie : {
		httpOnly : true,
		secure : false,
	},
	name : 'yhsession',
}));

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended : false }));


app.use(loginSession); // 로그인 세션 처리
app.use(mainMenu); // 메인멘뉴 


/** bodyClass 처리 */
app.use(bodyClass); 


/** Front 라우터 등록 */
app.use("/", indexRouter); // 메인페이지 
app.use("/member", memberRouter); // 회원페이지
app.use("/board", boardRouter); // 게시판 페이지 
app.use("/file", fileRouter); // 파일 업로드 페이지
app.use("/travel", travelRouter); // 여행 페이지
app.use("/mypage", mypageRouter); // 마이페이지 라우터



/** Admin 라우터 등록 */
app.use("/admin", adminRouter); // 관리자 메인
app.use("/admin/member", adminMemberRouter); // 회원 관리
app.use("/admin/board", adminBoardRouter); // 게시판 관리 
app.use("/admin/travel", adminTravelRouter); //여행상품관리
app.use("/admin/reservation", adminReservationRouter); //여행 예약관리

/** 채팅방 입장 라우터 S*/
app.get("/chat", (req, res, next) => {
	res.render("chat");
})

app.get("/chat/room", (req, res, next) => {
	
	if (!req.query.room || !req.query.userNm) {
		return res.send("<script>alert('방 이름과 닉네임을 모두 입력하세요');history.back();</script>");
	}
	return res.render("chat_room");
})

/** 채팅방 입장 라우터 E*/

// 없는 페이지 처리 
app.use((req, res, next) => {
	const error = new Error(`${req.method} ${req.url}는 없는 페이지 입니다.`);
	error.status = 404;
	next(error);
});

app.use((err, req, res, next) => { // 오류처리 미들웨어 
	err.status = err.status || 500;
	logger("[" + err.status + "]" + err.message, 'error');
	logger(err.stack, 'error');
	
	if (process.env.NODE_ENV == 'production') err.stack = "";

	res.locals.error = err;
	
	res.status(err.status).render("error");
});

server.listen(app.get('port'), () => {
	console.log(app.get('port'), '번 포트에서 대기 중');
});