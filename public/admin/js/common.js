$(function() {
	/** 전체 선택 S */
	$(".check_all").click(function() {
		const target = $(this).data("target-name");
		$(this).closest("form")
				.find("input[name='" + target + "']")
				.prop("checked", $(this).prop("checked"));
	});
	/** 전체 선택 E */
	
	/** 상품코드 자동생성 S */
	$(".generate_goodsCd").click(function() {
		const uid = new Date().getTime();
		$(this).closest("form").find("input[name='goodsCd']").val(uid);
	});
	/** 상품코드 자동생성 E */
	
	/** 파일 업로드 폼에서 파일 선택시 자동 submit */
	$("body").on("change", ".file_upload_form input[type='file']", function() {
		$(this).closest("form").submit();
	});
	
	/** datepicker */
	$(".datepicker").datepicker({
		dateFormat : "yy-mm-dd",
	});
});