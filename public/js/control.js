$(document).ready(function(){
    //reset web to top
    $(window).on('beforeunload', function() {
        $(window).scrollTop(0);
     });
    //change color navbar
    $(window).scroll(function(){
        var scroll = $(window).scrollTop();
        if (scroll > 300) {
            $(".bg-nav").addClass("bg-navc");
        }
        else {
            $(".bg-nav").removeClass("bg-navc");	
        }
    });
    //navber side left
    function openNav() {
        document.getElementById("navbarSupportedContent").style.width = "250px";
    }
      
    function closeNav() {
        document.getElementById("navbarSupportedContent").style.width = "0";
    }
    
    $(function() {
        var textarea = document.querySelector('textarea');
      
        textarea.addEventListener('keydown', autosize);
      
        function autosize() {
          var el = this;
            el.style.cssText = 'height:auto; padding:0';
            // for box-sizing other than "content-box" use:
            // el.style.cssText = '-moz-box-sizing:content-box';
            el.style.cssText = 'height:' + el.scrollHeight + 'px';
        }
      });
    
    $(".custom-file-input").on("change", function() {
        var fileName = $(this).val().split("\\").pop();
        $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
    });

});
