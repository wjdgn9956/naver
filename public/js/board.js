$(() => {
    if ($("#contents").length > 0 ){ // contents textarea가 존재하는 경우 에디터 로딩
        CKEDITOR.replace("contents");
        CKEDITOR.config.height = 350;
    }
});