$(function() {
	/** 에디터 로딩 */
	if ($("#contents").length > 0) {
		CKEDITOR.replace("contents");
		CKEDITOR.config.height=350;
	}
	
	/** 상품 이미지 삭제 */
	$("body").on("click", ".uploaded_images .remove", function() {
		if (!confirm('정말 삭제하시겠습니까?')) {
			return;
		}
		const _images = $(this).closest(".images");
		const idx = _images.data("idx");
		if (!idx) return;
		
		axios.get('/file/delete/' + idx)
			.then((res) => {
				if (res.data.isSuccess) { // 파일 삭제 성공시 이미지 제거 
					_images.remove();
				} else {
					alert("이미지 삭제 실패하였습니다.");
				}
			})
			.catch((err) => {
				console.error(err);
			});
	});	
	
	/** 패키지 일정 목록 처리 모드 변경 */
	$("#frmTravelPackages select.mode").change(function() {
		if ($(this).val() == 'delete') { // 삭제 
			frmTravelPackages.action = "/admin/travel/package?_method=DELETE";
		} else { // 수정 
			frmTravelPackages.action = "/admin/travel/package?_method=PATCH";
		}
	});
});

/**
* 파일 업로드 콜백 
*
* @params Object data 파일 업로드 후 데이터 
*
*  gid에 main 이 포함되어 있으면 메인 이미지
*          list이 포함되어 있으면 목록 이미지 
*/
function fileUploadCallback(data) {
	const tag = `
		<span class='images' 
				data-idx='${data.idx}' 
				style="background:url('${data.fileUrl}') no-repeat center center; background-size: cover;">
				<div onclick="layer.popup('/file/view/${data.idx}', 600, 600);"></div>
				<i class='xi-close-min remove'></i>
		</span>
	`;

	if (data.gid.indexOf("main") != -1) { // 메인 
		$(".main_images").append(tag);
	} else if (data.gid.indexOf("list") != -1) { // 목록
		$(".list_images").append(tag);
	} else { // 에디터 이미지 
		const img = `<img src='${data.fileUrl}'>`;
		CKEDITOR.instances.contents.insertHtml(img);
		$(".desc_images").append(tag);
	}
	
	layer.close();
}