


$(window).ready(function () {
  // 鼠标 hover 效果只绑定一次
  $("#buttonOpen").on("mouseenter", function () {
    $(this).find(".lucide-menu").removeClass("text-gray-900").addClass("text-white");
  });

  $("#buttonOpen").on("mouseleave", function () {
    const isScrolled = $(window).scrollTop() > 80;
    if (isScrolled) {
      $(this).find(".lucide-menu").removeClass("text-white").addClass("text-gray-900");
    } else {
      $(this).find(".lucide-menu").removeClass("text-gray-900").addClass("text-white");
    }
  });

  // 滚动样式处理
  $(window).on('scroll', function () {
    const isScrolled = $(window).scrollTop() > 80;

    $(".header_box").toggleClass("header_box-scroll", isScrolled);
    $(".header_height").toggleClass("header_height-scroll", isScrolled);
    $(".logo_box").toggleClass("logo_box-scroll", isScrolled);
    $(".header_logo").toggleClass("header_logo-scroll", isScrolled);
    $(".header-button").toggleClass("header-button-scroll", isScrolled);
    $(".login_button").toggleClass("login_button-scroll", isScrolled);
    $(".login_out").toggleClass("login_out-scroll", isScrolled);
    $(".span_menu").toggleClass("span_menu-scroll", isScrolled);
    $(".clickEn, .clickCn").toggleClass("btn_language_scroll yuyan", isScrolled).toggleClass("", !isScrolled);;
    // 更换 logo 图片
    const logoSrc = isScrolled
      ? "https://academy.hrflag.com/imgs/logo-academy.svg"
      : "https://academy.hrflag.com/imgs/logo-academy-white.svg";
    $(".header_logo").attr("src", logoSrc);

    // 切换菜单图标颜色
    $(".lucide-menu").toggleClass("text-blue-svg", isScrolled).toggleClass("text-white", !isScrolled);
  });
 

  $("#buttonOpen").click(function () {
    $("body").addClass("no-scroll"); // 禁止页面滚动
    $(".globalnav-root").attr("style", "display:flex");
    $(".nav-menu__container").addClass("open")
    const menu = $(".nav-menu__container");
    menu.removeClass("animate-out").addClass("animate-in");
  });
  $(".menu-close__button, .overlay").click(function () {
    const menu = $(".nav-menu__container");
    menu.removeClass("animate-in").addClass("animate-out");
    $(".nav-menu__container").removeClass("open")
    // 动画结束后隐藏背景容器
    setTimeout(function () {
      $(".globalnav-root").css("display", "none");
      $("body").removeClass("no-scroll"); // 恢复页面滚动
    }, 100); // 和动画时间一致
  });

  
  // 点击按钮返回顶部
  const $backToTopButton = $("#backToTop");
  $backToTopButton.on("click", function () {
    $("html, body").animate({ scrollTop: 0 }, "smooth");
  });

  // 图片路径数组
  const images = [
    'https://hrflagfile.oss-cn-hangzhou.aliyuncs.com/Web/ebiglobal/imgback2.jpg',
    'https://hrflagfile.oss-cn-hangzhou.aliyuncs.com/Web/ebiglobal/imgback3.jpg',
    'https://hrflagfile.oss-cn-hangzhou.aliyuncs.com/Web/ebiglobal/imgback4.jpg',
    'https://hrflagfile.oss-cn-hangzhou.aliyuncs.com/Web/ebiglobal/imgback5.jpg'
  ];

  // 随机选择图片并设置为 footer 中的 img 标签
  function setRandomFooterImage() {
    const randomIndex = Math.floor(Math.random() * images.length);
    const randomImage = images[randomIndex];
    // document.querySelector('#footer .footer_box img').src = randomImage;
    $(".footer-imgback").attr("src", randomImage)
    $(".footer-imgback").show();
  }

  // 页面加载完成后调用函数
  window.onload = setRandomFooterImage;

});





















