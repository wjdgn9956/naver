/**
* body태그에 추가되는 클래스 처리 
*
*/
module.exports.bodyClass = (req, res, next) => {
	/* body 클래스 자동 완성(url 기준) */
	let url = req.url;
	let end = url.indexOf("?");
	if (end !== -1) {
		url = url.slice(0,end);
	}
	end = url.indexOf("#");
	if (end !== -1) {
		url = url.slice(0,end);
	}
	
	let addClass = addClass2 = "";
	if (url == '/') addClass = "main";
	else {
		url = url.split("/");
		if (url.length > 2) {
			addClass = url[1] + "_" + url[2];
		} else {
			addClass = url[1];
		}
		
		addClass2 = url[1];
	}
	
	res.locals.bodyClass = addClass;
	res.locals.bodyClass2 = addClass2;
	next();
};