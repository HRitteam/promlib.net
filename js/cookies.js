// var domain = "prompts.hrflag.com";
var domain = "127.0.0.1";


function setCookie(name, value) {
    var Days = 3;
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
