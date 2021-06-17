/** swiper 영역 */
window.addEventListener("DOMContentLoaded",function(e){

  var swiper = new Swiper('.swiper-container', {
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
          el: '.swiper-pagination',
          clickable : true,
        },
      loop:true,
      autoplay:{
          delay:5000,
      }
      
    });
},false);

/** 주소 검색 */

$(() => {

   

  /**주소 검색 */
  $(".address").click(function(){
      new daum.Postcode({
          oncomplete : function(data){
             $("input[name='address']").val(data.address);
          }
      }).open();
  })
});

// 파일 업로드//
$(function() {
	$("body").on("change", ".file_upload_form input[type='file']", function() {
		$(this).closest("form").submit();
	});
 
});