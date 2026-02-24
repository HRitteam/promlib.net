
var WxSpAPI = "https://form.hrflag.com/WxSpAPI/";
var APIPath = "https://form.hrflag.com/webapi/";
var testAPI = "";
var cip = "未知"; 
var cname = "未知";

/*获取地址栏参数*/
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = location.search.substr(1).match(reg);
    if (r != null) return unescape(decodeURI(r[2]));
    return '';
}

// 获取ip地址
function getIP(){
	if(cip == "未知"){
		$.ajax({
			url: 'https://api.ip138.com/ip/?datatype=jsonp&token=bb7ae2ac668da329b5ef844f46a4f160',
			type: 'GET',
			dataType: 'JSON',
			async: false,
			success: function(res) {
				if (res.data.length > 0) {
					cip = res.ip;
					cname = res.data[0] + "," + res.data[1] + "," + res.data[2];
				}
		
			},
			error: function(d, textStatus, jqXHR) {
				if (d === 202) {
					console.log('iP138.com平台：无效Token、余额不足、格式错误');
				} else {
					console.log(d);
				}
			}
		});
	}
}

$('body').append(`
    <div class="panel_alert" style="position: fixed;top: 0;left: 0;z-index: 9;width: 100%;height: 100%;display: none;">
      <div style="position: absolute;top: 20%;left: 50%;transform: translate(-50%, -50%);width: 446px;">
        <div class="alert alert-success" style="background: #222;display:none;" role="alert">
          <div class="d-flex">
            <div>
              <!-- Download SVG icon from http://tabler-icons.io/i/check -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon alert-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 12l5 5l10 -10" />
              </svg>
            </div>
            <div class="alert_text"></div>
          </div>
        </div>
        <div class="alert alert-warning" style="background: #222;display:none;" role="alert">
          <div class="d-flex">
            <div>
              <!-- Download SVG icon from http://tabler-icons.io/i/alert-triangle -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon alert-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path
                  d="M10.24 3.957l-8.422 14.06a1.989 1.989 0 0 0 1.7 2.983h16.845a1.989 1.989 0 0 0 1.7 -2.983l-8.423 -14.06a1.989 1.989 0 0 0 -3.4 0z"
                />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <div class="alert_text"></div>
          </div>
        </div>
        <div class="alert alert-danger" style="background: #222;display:none;" role="alert">
          <div class="d-flex">
            <div>
              <!-- Download SVG icon from http://tabler-icons.io/i/alert-circle -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon alert-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <div class="alert_text"></div>
          </div>
        </div>
        <div class="alert alert-info" style="background: #222;display:none;" role="alert">
          <div class="d-flex">
            <div>
              <!-- Download SVG icon from http://tabler-icons.io/i/info-circle -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon alert-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                <path d="M12 9h.01" />
                <path d="M11 12h1v4h1" />
              </svg>
            </div>
            <div class="alert_text"></div>
          </div>
        </div>
      </div>
    </div>
`)

/*  showToast
    1.成功
    2.警告
    3.错误
    4.信息
*/


function showToast(text, type) {
    $(".panel_alert").show();
    $(".alert_text").html(text);
    switch (type) {
        case 1:
            $(".alert-success").show();
            break;
        case 2:
            $(".alert-warning").show();
            break;
        case 3:
            $(".alert-danger").show();
            break;
        case 4:
            $(".alert-info").show();
            break;
    
        default:
            break;
    }
    setTimeout(function () {
        $(".panel_alert").hide();
        $(".alert-warning").hide();
        $(".alert-success").hide();
        $(".alert-danger").hide();
        $(".alert-info").hide();
    }, 2500);
}

