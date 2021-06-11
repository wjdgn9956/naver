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
