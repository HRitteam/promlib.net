﻿// 1. 定义 HTML 结构
var headerHtml = `
	<div class="Top_Nav">
		<!-- 顶部导航栏 -->
		<header class="navbar navbar-expand-md d-print-none bg-[#080808]" style="box-shadow:none;border-bottom: 1px solid rgb(48 50 54); position: relative; z-index: 1020;">
			<div class="container-xl">
				<!-- 左侧：菜单按钮 -->
				<h1 class="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3 headerh1">
					<a href="javascript:;" id="btn_open_sidebar" style="color: #fff; text-decoration: none; display: flex; align-items: center; gap: 8px; cursor: pointer;">
						<!-- 菜单图标 -->
						<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-menu-2" width="28" height="28" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
						   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
						   <path d="M4 6l16 0"></path>
						   <path d="M4 12l16 0"></path>
						   <path d="M4 18l16 0"></path>
						</svg>
						<span style="font-size: 15px; font-weight: normal; margin-left: 5px;">Menu</span>
					</a>
				</h1>

				<!-- 右侧：用户信息 -->
				<div class="navbar-nav flex-row order-md-last">
					<div class="nav-item dropdown">
						<a href="#" class="nav-link d-flex lh-1 text-reset p-0" data-bs-toggle="dropdown"
							aria-label="Open user menu">
							<span class="avatar avatar-sm avatar_image"></span>
							<div class="d-none d-xl-block ps-2">
								<div class="userName" style="color: #fff;">Username</div>
								<div class="small text-secondary UserCompany"></div>
							</div>
						</a>
						<div class="dropdown-menu dropdown-menu-end dropdown-menu-arrow bg-[#080808]" style="border: 1px solid rgb(48 50 54);">
							<a class="dropdown-item exit" style="color:#fff;">Log out</a>
						</div>
					</div>
				</div>
			</div>
		</header>
	</div>

	<!-- 遮罩层 -->
	<div id="Sidebar_Mask" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 1040;"></div>

	<!-- 侧边栏 -->
	<div class="Left_Nav_Drawer bg-[#080808]" style="display: none; position: fixed; top: 0; left: -280px; height: 100vh; width: 280px !important; z-index: 1050; box-shadow: 2px 0 10px rgba(0,0,0,0.5); overflow-y: auto;">
		<aside class="navbar navbar-vertical navbar-expand-lg" data-bs-theme="dark" style="background: transparent; width: 100%; height: auto; min-height: 100vh;">
			<div class="container-fluid" style="display: block;">
				<!-- 侧边栏顶部 -->
				<div style="display: flex; justify-content: flex-start; align-items: center; width: 100%; padding: 15px 0px;">
					<!-- 关闭按钮 -->
					<a href="javascript:;" id="btn_close_sidebar" style="color: #fff;padding: .5rem calc(calc(var(--tblr-page-padding) * 2) / 2); opacity: 0.8; transition: opacity 0.3s;">
						<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-x" width="28" height="28" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
						   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
						   <path d="M18 6l-12 12"></path>
						   <path d="M6 6l12 12"></path>
						</svg>
					</a>
				</div>

				<div class="collapse navbar-collapse show" id="sidebar-menu" style="display: block;">
					<ul class="navbar-nav left_navbar">
						<li class="nav-item nav_li">
							<a class="nav-link" href="/personal/promptlibrary.html">
								<img class="d-md-none d-lg-inline-block" style="width: 16px;margin-right:8px" src="./static/b26.svg" >
								<span class="nav-link-title">AI Prompt Library</span>
							</a>
						</li>
						<li class="nav-item nav_li" style="margin-bottom: 50px;">
							<a class="nav-link logout" href="javascript:void(0)">
								<img class="d-md-none d-lg-inline-block" style="width: 16px;margin-right:8px" src="./static/icon19.svg" >
								<span class="nav-link-title">Log out</span>
							</a>
						</li>
					</ul>
				</div>
			</div>
		</aside>
	</div>
`

$(window).ready(function() {
	// 1. 将HTML插入页面
	$("#header").append(headerHtml);

	// ==========================================
	// 【新增】自动高亮菜单逻辑 (核心修改)
	// ==========================================
	var currentPath = window.location.pathname; // 获取当前页面路径，例如 "/personal/promptlibrary.html"

	// 遍历所有侧边栏菜单项的链接
	$(".left_navbar .nav_li a").each(function() {
		var $thisLink = $(this);
		var linkHref = $thisLink.attr("href");

		// 排除掉 javascript:void(0) 的链接（如退出登录）
		// 并判断当前路径是否包含了菜单链接的路径
		if (linkHref && linkHref !== "javascript:void(0)" && currentPath.indexOf(linkHref) !== -1) {
			
			// 1. 给当前 li 添加 active 类
			$thisLink.closest('.nav_li').addClass("active").siblings().removeClass("active");

			// 2. 特殊处理图标切换
			// 如果是 "promptlibrary.html"，切换图片为 b26.svg
			if (linkHref.indexOf("promptlibrary.html") !== -1) {
				$thisLink.find("img").attr('src', './static/b26.svg');
			}
			
			// 如果未来有其他菜单需要切换图标，可以在这里继续加 else if...
		}
	});
	// ==========================================

	var aiEmail = getCookie("aiEmail");
	var aiName = getCookie("aiName");
	var aiPicture = getCookie("aiPicture");
	var token = getCookie("token");
	if(aiEmail){
		$(".userName").html(aiName);
		$(".UserCompany").html(aiEmail)
		$(".avatar_image").css("background-image", `url(${aiPicture})`)
	}
	// --- 登录/Token 校验逻辑 ---
	$.ajax({
		url: `http://3.238.5.209:8888/api/auth/IsSessionValid?email=${aiEmail}&clientTicks=${token}`,
		async: true,
		type: "POST",
		dataType: 'json',
		success: function (res) {
			if(!res){
				clearLoginInfo()
				location.href = "../login.html"
			}
		}
	})
	
	// --- 退出逻辑 ---
	$(".exit, .logout").click(function() {
		clearLoginInfo()
		location.href = "../login.html"
	})

	function clearLoginInfo() {
		delCookie("aiEmail")
		delCookie("aiName")
		delCookie("aiPicture")
	}

	// --- 侧边栏动画交互 ---

	// 打开侧边栏
	$("#header").on("click", "#btn_open_sidebar", function() {
		$("#Sidebar_Mask").fadeIn(200);
		$(".Left_Nav_Drawer").show().animate({ "left": "0px" }, 250);
	});

	// 关闭侧边栏
	$("#header").on("click", "#btn_close_sidebar, #Sidebar_Mask", function() {
		$(".Left_Nav_Drawer").animate({ "left": "-280px" }, 250, function(){
			$(this).hide();
		});
		$("#Sidebar_Mask").fadeOut(200);
	});
})