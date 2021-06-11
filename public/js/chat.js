/**
* 채팅
*
*/
const socket = io();

const chat = {
    sessionId : "",
	room : "", // 방이름 
	userNm : "", // 사용자명
	
	
	/** 
	* 페이지 접속시 방이름, 사용자 설정
	*
	*/
	init : function() {
        const uid = new Date().getTime();
		let qs = {};
		location.search.replace("?", '')
						   .split("&")
						   .map((v) => {
							  v = v.split("=");
							  v[1] = decodeURIComponent(v[1]);
							  qs[v[0]] = v[1];
						   });
		this.room = qs.room || 'lobby';
		this.userNm = qs.userNm || uid 
        this.sessionId = "chat_" + uid;
        
		socket.emit('join', this.room);
	},
	
	/**
	* 소켓 서버로 메세지 전송 
	* 
	* @param String message 전송할 메세지 
	*/
	send : function (message) {
		const data = {
            sessionId : this.sessionId,
			room : this.room,
			userNm : this.userNm,
			message : message,
			
		};
		socket.emit("chat", data);
	},
	/**
	* 채팅 메세지가 항상 하단으로 고정 처리 
	*
	*/
	scrollBottom : function() { 
		const h = $(".chat .contents li").outerHeight();
		const st = h *  $(".chat .contents li").length;
		$(".chat .contents").scrollTop(st);
	},
};

/** 메세지 수신 */
socket.on("chat", (data) => {
	let html = $("#chat_template").html();
	let addClass = 'other';
	if (data.userNm == chat.userNm) {
		addClass = 'mine';
	}

	html = html.replace(/<%=addClass%>/g, addClass);
	html = html.replace(/<%=userNm%>/g, data.userNm);
	html = html.replace(/<%=message%>/g, data.message);
	html = html.replace(/<%=room%>/g, data.room);

	$(".chat .contents").append(html);
	chat.scrollBottom();
});

// 페이지 접속시 초기화 
chat.init();

$(function() {
	$(".chat #word").keyup(function(e) {
		if (e.keyCode == 13) { // 엔터키를 입력한 경우 
			const message = $(this).val().trim();
			if (message) { // 전송 문구가 있는 경우는 서버로 전송 
				chat.send(message+getTime())
				$(this).val('');
			}
		}
	});
});


// 현재 날짜 /yy/mm/dd/hh/mm //
function getTime() {

	const date = new Date();
	const year = date.getFullYear().toString();

	let month = date.getMonth()+1;
	month = (month < 10)? "0"+ month.toString() : month.toString();
	
	let day = date.getDate()
	day = (day < 10)? "0"+ day.toString() : day.toString();

	const hour = date.getHours();
	let min = date.getMinutes();
	min = (min < 10)? "0" + min.toString() : min.toString();
	
	return year + "-" + month + "-" + day + "-" + hour + ":" + min;
}

/*
socket.emit('chat', '테스트 채팅 메세지');
socket.on('chat', (arg) => {
	console.log(arg);
});
*/