// ﻿var domain = "127.0.0.1";
var domain = "prompts.hrflag.com";
var alipath = 'https://hrflagfile.oss-cn-hangzhou.aliyuncs.com/'


function setCookie(name, value) {
	var Days = 1;
	var exp = new Date();
	exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
	document.cookie = name + "=" + value + ";expires=" + exp.toGMTString() + ";domain=" + domain + ";path=/";
}


function getCookie(name) {
	var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

	if (arr = document.cookie.match(reg))

		return (arr[2]);
	else
		return null;
}

function delCookie(name) {
	var exp = new Date();
	exp.setTime(exp.getTime() - 1);
	var cval = getCookie(name);
	if (cval != null) {
		document.cookie = name + "='';expires=" + exp.toGMTString() + ";domain=" + domain + ";path=/";
	}

}

// 设置sessionStorage
function setSession(name, value) {
	sessionStorage.setItem(name, value);
}

function getSession(name) {
	return sessionStorage.getItem(name)?sessionStorage.getItem(name):""
}

function removeSession(name) {
	sessionStorage.removeItem(name);
}