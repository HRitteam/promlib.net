// 仅在明确可用的顶级域名场景下注入 domain，避免本地/预发环境无法写入 cookie。
var cookieDomain = "127.0.0.1";
if (location.hostname === "prompts.hrflag.com") {
    cookieDomain = "prompts.hrflag.com";
}

function setCookie(name, value) {
    var Days = 3;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + value + ";expires=" + exp.toGMTString() + ";domain=" + cookieDomain + ";path=/";
}


function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

    if (arr = document.cookie.match(reg))
        return decodeURIComponent(arr[2]);
    else
        return null;
}

function delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null) {
        document.cookie = name + "='';expires=" + exp.toGMTString() + ";domain=" + cookieDomain + ";path=/";
    }
}
