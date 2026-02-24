// ================= 全局变量配置 =================
var activityId = "A202511260904999"; // 固定活动ID
var SpecialId = "A00001"; // 固定来源ID
var APIPath = "https://form.hrflag.com/WebAPI/"

var SceneNum = 0;
var outSiteData;
var SourceId;
var SourceName;
var activityPrice = 0; // 默认为0，通过接口更新
var JsonStr = ""; // 通用扩展字段，普通活动为空即可
var orderid;
var AddressId;
var IsNoPayment;
var layer;
var isPost = false; // 防止重复提交

// IP信息占位
var returnCitySN = {
	cip: "未知",
	cname: "未知"
};

var companyStr = '';
var IsFormSignUp = false;
var IsFormPhone = '';
var isChange = false; // 是否是老用户回填

// ================= 初始化逻辑 =================
$(document).ready(function() {
	// 隐藏默认的模块，等待逻辑判断显示
	$('.Addresstotalbox').hide();
	$('.AddressInfo').hide();
	$('.reportprice').hide();
	$(".msgbox").hide();
	
	SpecialId = getQueryString("SpecialId") ? getQueryString("SpecialId") : "A00001";

	clearComtent(); // 清空内容
	BindDepartment(); // 绑定部门下拉
	BindTradeInfo(); // 绑定行业下拉
	BindScale(); // 绑定规模下拉

	// 初始化Layui layer
	if (typeof layui !== 'undefined') {
		layui.use(['layer'], function() {
			layer = layui.layer;
		});
	}

	// ★★★ 修复点：初始化下拉框交互逻辑 (之前缺失的部分) ★★★
	bindDropdownEvents();

	// 地址相关点击事件
	$('.addAddress').click(function() {
		var phoneNo = $("#PhoneNo").val();
		window.location.href = 'https://events.hrflag.com/createaddress.html?phone=' + phoneNo;
	});
	$('.changeadd').click(function() {
		var phoneNo = $("#PhoneNo").val();
		window.location.href = 'https://events.hrflag.com/deliveryaddress.html?phone=' + phoneNo;
	});

	var nowDate = GetDate();

	// 获取活动配置信息
	outSiteData = getTip(activityId);
	GetSourceIdBySpecialId(activityId, SpecialId);

	// 设置页面标题
	$("#ActityTitle").html(getTitle(activityId));
	// $(document).attr("title", getTitle(activityId)); // 如果是嵌入式页面，可能不需要改Title

	BindSceneInfo(activityId); // 绑定场次
	GetCompanyPolicy(activityId); // 绑定隐私协议/授权公司
	
	 $("#default-plan").click();

	// 检查活动是否下线
	$.ajax({
		type: "post",
		url: APIPath + "NewForm/UpdateActivityStatus?dtNowDate=" + nowDate + "&strActivityId=" +
			activityId,
		dataType: "json",
		success: function(data) {
			if (!data) {
				$(".over").css("display", "block"); // 活动已结束
				$(".formbody").hide();
			} else {
				$(".formbody").css("display", "block");
			}
		}
	});
});

// ================= ★★★ 新增：方案选择逻辑 ★★★ =================
// element: 点击的DOM元素
// price: 价格
// planName: 方案名称
window.selectPlan = function(element, price, planName) {
	// 1. 移除所有卡片的选中样式
	$(".plan-card").removeClass("active");
	// 2. 给当前点击的卡片添加选中样式
	$(element).addClass("active");

	// 3. 更新全局变量
	activityPrice = price;
	JsonStr = planName;

	// 4. 清除错误提示
	$("#InflagError").html("");

	console.log("已选择方案:", JsonStr, "价格:", activityPrice);
}

// ================= 新增：权益展开/收起逻辑 =================
window.toggleFeatures = function(event, btn) {
    // 阻止冒泡，防止触发卡片的 selectPlan 点击事件（虽然触发了也没事，但为了体验更好）
    event.stopPropagation();
    event.preventDefault();

    // 获取当前卡片内的隐藏容器
    var card = $(btn).closest('.plan-card');
    var hiddenDiv = card.find('.more-features');
    
    // 判断当前状态
    if (hiddenDiv.hasClass('hidden')) {
        // 展开
        hiddenDiv.removeClass('hidden'); // 移除 hidden 类，内容显示，盒子高度自动撑开
        $(btn).html('Expand Benefits ▲');
    } else {
        // 收起
        hiddenDiv.addClass('hidden');
        $(btn).html('Expand All Benefits ▼');
    }
}

// ★★★ 修复点：新增下拉框控制逻辑 ★★★
function bindDropdownEvents() {
	// 1. 行业下拉点击
	// 监听外层容器 IndustryGroup 的点击，因为 input 是 readonly 的
	$("#IndustryGroup").click(function(e) {
		// 如果输入框是 disabled (未验证手机)，则提示并拦截
		if ($("#Industry").prop('disabled')) {
			if (layer) layer.msg('请先输入手机号并验证');
			return;
		}
		e.stopPropagation(); // 阻止冒泡
		$("#TradeInfo").toggleClass("hidden"); // 切换显示/隐藏类名
		$("#departmentList").addClass("hidden"); // 确保另一个下拉是关的
	});

	// 2. 部门下拉点击
	$("#DepartmentGroup").click(function(e) {
		if ($("#Department").prop('disabled')) {
			if (layer) layer.msg('请先输入手机号并验证');
			return;
		}
		e.stopPropagation();
		$("#departmentList").toggleClass("hidden");
		$("#TradeInfo").addClass("hidden");
	});

	// 3. 选中行业选项
	// 使用 .on 绑定，确保动态生成的 li 也能触发
	$("#TradeInfo").on("click", "li", function(e) {
		e.stopPropagation();
		var val = $(this).text();
		$("#Industry").val(val); // 赋值给 input
		$("#TradeInfo").addClass("hidden"); // 隐藏菜单
		$("#tradNameError").html(""); // 清除错误提示
	});

	// 4. 选中部门选项
	$("#departmentList").on("click", "li", function(e) {
		e.stopPropagation();
		var val = $(this).text();
		$("#Department").val(val);
		$("#departmentList").addClass("hidden");
		$("#departmentError").html("");
	});

	// 5. 点击页面空白处关闭所有下拉
	$(document).click(function() {
		$(".selbox").addClass("hidden");
	});
}


// ================= 输入框事件监听 =================
// 监听浏览器后退，刷新地址信息
window.addEventListener('popstate', () => {
	getAddressInfo();
});
window.addEventListener('storage', (event) => {
	if (event.key === 'dataFromPageB') {
		getAddressInfo();
		localStorage.removeItem('dataFromPageB');
	}
});

// ================= 核心功能函数 =================

// 获取验证码
$("#GetCode").click(function(event) {
	var re = /^1[3456789]\d{9}$/;
	var txtPhoneNum = $('#PhoneNo').val();
	IsFormPhone = $('#PhoneNo').val();

	if (txtPhoneNum == '') {
		$("#phoneError").html("请输入您的手机号");
		return false;
	} else if (!re.test(txtPhoneNum)) {
		$("#phoneError").html("手机号格式错误");
		return false;
	}

	// 检查是否已报名
	if (IsApply(activityId, "", txtPhoneNum)) {
		if (!activityPrice && !outSiteData) {
			$("#phoneError").html("您已报名过该活动，请勿重复报名");
			return false;
		} else if (!activityPrice && outSiteData) {
			$("#phoneError").html("您已提交过信息，正在为您跳转");
			setTimeout(function() {
				top.location.href = outSiteData;
			}, 3000);
			return false;
		}
	}

	$("#phoneError").html("");
	if (IsBanned(txtPhoneNum)) {
		Hint();
		return false;
	}

	// UI 倒计时逻辑
	// ★★★ 修复点：适配 Neon 风格的按钮状态 ★★★
	$("#GetCode").addClass('eight').removeClass('text-primary-1').addClass('text-gray-500'); // 变灰
	$(".getcode").addClass("getcodeborder");

	IsFormSignUpnew(); // 检查来源记录

	var time = 60;
	settime(this);

	function settime(obj) {
		if (time == 0) {
			$("#GetCode").css('pointer-events', 'auto');
			$(obj).attr('disabled', false);
			$(obj).html("获取验证码");
			// 恢复高亮颜色
			$("#GetCode").removeClass('eight').addClass('text-primary-1').removeClass('text-gray-500');
			$(".getcode").removeClass("getcodeborder");
			$("#yzpass").addClass('duinone'); // 注意：这里的类名要和 CSS 中的 hidden 对应
			$("#GetCode").removeClass('duinone'); // 这里的 duinone 对应 hidden
			time = 60;
			return;
		} else {
			$("#GetCode").css('pointer-events', 'none');
			$("#GetCode").css('border-color', '#ccc');
			$(obj).html(time + "s后重新获取");
			time--;
		}
		setTimeout(function() {
			settime(obj)
		}, 1000);
	}

	// 发送验证码请求
	$.ajax({
		async: false,
		type: "POST",
		url: APIPath + "Form/GetVF",
		data: {
			"": txtPhoneNum
		},
		dataType: "json",
		success: function(data) {}
	});
});

// 验证码输入检测
var funCode = 5;
document.querySelector('#VerCode').oninput = function() {
	if (funCode == 0) {
		funCode = 5;
		return;
	}
	var txtPhoneNum = $('#PhoneNo').val();
	var txtCode = $('#VerCode').val();

	if (txtCode != "") {
		$("#codeError").html("");
	}

	if (txtCode.length == 6) {
		var re = /^1[3456789]\d{9}$/;
		if (txtPhoneNum == '') {
			$("#phoneError").html("请输入您的手机号");
			return false;
		} else if (!re.test(txtPhoneNum)) {
			$("#phoneError").html("手机号格式错误");
			return false;
		} else {
			$("#phoneError").html("");
		}

		// 校验验证码接口
		$.ajax({
			async: false,
			type: "POST",
			url: APIPath + "Form/CheckVFCode",
			data: {
				"PhoneNumber": txtPhoneNum,
				"MsgCode": txtCode
			},
			dataType: "json",
			success: function(data) {
				if (data == "1") {
					funCode = 1;
					$("#verCodeError").html("验证码错误");
				} else if (data == "2") {
					funCode = 2;
					$("#verCodeError").html("验证码失效，请重新获取！");
				} else if (data == "0") {
					funCode = 0;
					$("#verCodeError").html("");
					$(".code").removeClass("codey");

					// ★★★ 修复点：验证成功显示绿色对勾，隐藏按钮 ★★★
					$("#yzpass").removeClass("hidden").removeClass("duinone");
					$("#GetCode").addClass("hidden");

					passCheck(); // 通过验证，解锁表单
					getUser(txtPhoneNum); // 回填用户信息
					getAddressInfo(txtPhoneNum); // 获取地址信息
				}
			}
		});
	}
};

 // 获取URL参数的通用函数 (兼容 URLSearchParams)
            function getQueryString(name) {
                // 优先使用 URLSearchParams
                if (typeof URLSearchParams !== 'undefined') {
                    const urlParams = new URLSearchParams(window.location.search);
                    if(urlParams.has(name)) {
                        return urlParams.get(name);
                    }
                }
                // 降级使用正则
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
                var r = window.location.search.substr(1).match(reg);
                if (r != null) return unescape(r[2]);
                return null;
            }

// 获取用户信息回填
function getUser(phone) {
	$.ajax({
		async: false,
		type: "post",
		url: APIPath + "NewForm/GetUser?phone=" + phone,
		dataType: "json",
		success: function(data) {
			if (data.length > 0) { // 存在
				isChange = true;
				$("#Name").val(data[0].Name);
				$("#Company").val(data[0].Company);
				$("#Industry").val(data[0].TradName);
				$("#Department").val(data[0].Department);
				$("#Position").val(data[0].Position);
				$("#Email").val(data[0].Email);
				calcelError();
			}
		}
	});
}

// 验证通过后解锁表单
function passCheck() {
	// 手机和验证码锁定，变灰
	$('#PhoneNo').attr("readonly", true).addClass("opacity-50");
	$('#VerCode').attr("readonly", true).addClass("opacity-50");

	// 解锁文本框 (设为 false 即启用)
	$('#Name').attr("disabled", false).removeClass("opacity-50");
	$('#Company').attr("disabled", false).removeClass("opacity-50");
	$('#Position').attr("disabled", false).removeClass("opacity-50");
	$('#Email').attr("disabled", false).removeClass("opacity-50");

	// ★★★ 修复点：下拉框特殊处理 ★★★
	// 下拉框的 Input 保持 readonly (防手机键盘弹出)，但移除 disabled (允许点击)
	$('#Industry').attr("disabled", false).attr("readonly", true);
	$('#Department').attr("disabled", false).attr("readonly", true);
	// 移除容器的透明度
	$('#IndustryGroup').removeClass("opacity-50");
	$('#DepartmentGroup').removeClass("opacity-50");
}

// ================= 表单提交主逻辑 =================
$("#SubmitInfo").click(function() {
	var sceneId = checkCh();
	var phoneNo = $("#PhoneNo").val();
	var verCode = $('#VerCode').val();
	var name = $("#Name").val();
	var company = $("#Company").val();
	var industry = $("#Industry").val();
	var department = $("#Department").val();
	var position = $("#Position").val();
	var email = $("#Email").val().trim();
	var checkState = document.getElementsByName("iread")[0].checked;

	// 默认空值，保持接口参数兼容
	var ComCity = "";
	var CompanySize = $("#Scale").val();
	var ProjectName = "";
	var TrackName = "";
	var ReferenceName = "";
	var phoneIn = "归属地未知";

	var status = true;

	// --- 基础字段验证 ---
	if (SceneNum > 0 && sceneId == "") {
		$("#changError").html("请选择报名场次");
		status = false;
	} else {
		$("#changError").html("");
	}

	if (phoneNo == "") {
		$("#phoneError").html("请先输入手机号并进行验证");
		status = false;
	}
	if (verCode == "") {
		$("#verCodeError").html("请先输入验证码");
		status = false;
	}
	if (name == "") {
		$("#userNameError").html("请输入姓名");
		status = false;
	}
	if (company == "") {
		$("#companyError").html("请输入公司");
		status = false;
	} else if (VieString(company)) {
		$("#companyError").html("公司不存在，请重新输入");
		status = false;
	}
	if (industry == "") {
		$("#tradNameError").html("请选择行业");
		status = false;
	}
	if (department == "") {
		$("#departmentError").html("请选择部门");
		status = false;
	}
	if (position == "") {
		$("#positionError").html("请输入职位");
		status = false;
	}
	if (email == "") {
		$("#emailError").html("请输入邮箱");
		status = false;
	} else {
		var re =
			/^([a-zA-Z0-9]+[-|_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[-|_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,6}$/;
		if (!re.test(email)) {
			$("#emailError").html("邮箱格式错误");
			status = false;
		}
	}

	// ★★★ 核心新增：验证是否选择了方案 ★★★
	if (activityPrice == 0 || JsonStr == "") {
		$("#InflagError").html("请先选择您的订阅方案");
		status = false;
	} else {
		$("#InflagError").html("");
	}

	if (IsBanned(phoneNo)) {
		Hint();
		return false;
	}

	if (!checkState) {
		$("#chedkError").html("请先勾选同意");
		status = false;
	}

	if (status == false) return false;

	disabledSubmitButton("SubmitInfo");

	if (isPost) return;
	isPost = true;

	// 获取手机归属地（异步，但这里为了逻辑简单放在提交前）
	$.ajax({
		async: false,
		type: 'POST',
		url: APIPath + 'PhoneInCont/GetPhoneIn',
		data: {
			"Phone": phoneNo
		},
		dataType: "json",
		success: function(data) {
			if (data.data.sp != "") {
				phoneIn = data.data.province + data.data.city + data.data.sp;
			}
		}
	});

	getorder();

	// 显示加载动画
	if (layer) layer.load(1, {
		shade: [0.5, '#000']
	});

	// --- 提交数据 ---
	$.ajax({
		type: "post",
		url: APIPath + "NewForm/AddCustomerInfoTwo",
		dataType: "json",
		data: {
			"PhoneNo": phoneNo,
			"Name": name,
			"ActivityId": activityId,
			"Company": company,
			"Industry": industry,
			"Position": position,
			"Department": department,
			"Email": email,
			"Comefrom": "活动报名",
			"PhoneIn": phoneIn,
			"SceneId": sceneId,
			"ProjectName": ProjectName,
			"TrackName": TrackName,
			"ReferenceName": ReferenceName,
			"IPAddress": returnCitySN.cname,
			"IPAttac": returnCitySN.cip,
			"JsonStr": JsonStr, // 通用活动此字段传空
			"CompanyId": companyStr,
			"Source": SourceId
		},
		success: function(data) {
			if (!IsFormSignUp) {
				AddustomerSource(phoneNo);
			}
			if (layer) layer.closeAll("loading");

			if (data) {
				SetCookie(phoneNo); // 更新Cookie

				// 如果是老用户，尝试更新用户信息
				if (isChange) {
					$.ajax({
						type: "post",
						url: APIPath + "NewForm/UpdateUserByPhone",
						data: {
							"PhoneNo": phoneNo,
							"Name": name,
							"Company": company,
							"Industry": industry,
							"Position": position,
							"Department": department,
							"Email": email
						},
						dataType: "json",
						success: function(d) {
							isPost = false;
						}
					});
				}

				// 如果有外部跳转链接 (OutSite)
				if (outSiteData) {
					$("#linktip").css('display', 'block');
					setTimeout(function() {
						top.location.href = outSiteData;
					}, 3000);
					return;
				}

				// 无需付费，直接显示成功
				if (!activityPrice) {
					// ★★★ 修复点：隐藏表单，显示 Neon 风格的成功提示 ★★★
					$("#partner-form").addClass("hidden");
					$(".success").removeClass("hidden");
				}

				$(".over").css("display", "none");
				isPost = false;

			} else {
				// 提交失败
				$(".over").css("display", "block");
				$(".formbody").css("display", "none");
				isPost = false;
			}
		},
		error: function() {
			if (layer) layer.closeAll("loading");
			isPost = false;
			alert("提交请求失败，请检查网络");
		}
	});
});

// ================= 辅助功能函数 =================

function calcelError() {
	$("#phoneError").html("");
	$("#verCodeError").html("");
	$("#userNameError").html("");
	$("#companyError").html("");
	$("#tradNameError").html("");
	$("#positionError").html("");
	$("#emailError").html("");
	$("#chedkError").html("");
}

function clearComtent() {
	var verCode = $('#VerCode').val();
	if (verCode == "") {
		$('#Name').val("");
		$('#Company').val("");
		$('#Industry').val("");
		$('#Department').val("");
		$('#Position').val("");
		$('#Email').val("");
	}
}

function checkCh() {
	var result = "";
	$(".checkbox").each(function(i) {
		if ($(this).is(':checked')) {
			result += "," + $(this).val();
			$("#changError").html("");
		}
	});
	return result == "" ? "" : result.substr(1, result.length);
}

// 获取IP信息
function getIPInfo() {
	return new Promise(function(resolve) {
		$.ajax({
			url: 'https://api.ip138.com/ip/?datatype=jsonp&token=bb7ae2ac668da329b5ef844f46a4f160',
			type: 'GET',
			dataType: 'jsonp',
			timeout: 3000,
			success: function(res) {
				if (res.data && res.data.length > 0) {
					returnCitySN.cip = res.ip;
					returnCitySN.cname = res.data[0] + "," + res.data[1] + "," + res.data[2];
				}
				resolve();
			},
			error: function() {
				resolve();
			}
		});
	});
}

// 绑定部门下拉
function BindDepartment() {
	$.ajax({
		url: APIPath + "Departmen/GetAllDepart",
		type: "POST",
		dataType: "json",
		success: function(data) {
			$("#Department").val(data.data[0].DepartmentName);
			var html = "";
			$(data.data).each(function() {
				html += "<li>" + this.DepartmentName + "</li>";
			});
			// ★★★ 修复点：使用正确的 ID 'departmentList' 填充数据 ★★★
			$("#departmentList").html(html);
		}
	});
}

// 绑定规模下拉
function BindScale() {
	var data = [{
		Scale: "0-49人"
	}, {
		Scale: "50-99人"
	}, {
		Scale: "100-499人"
	}, {
		Scale: "500-999人"
	}, {
		Scale: "1000-9999人"
	}, {
		Scale: "10000人以上"
	}];
	$("#Scale").val(data[0].Scale);
	$(data).each(function() {
		$("#scale").append("<li>" + this.Scale + "</li>");
	});
}

// 绑定行业下拉
function BindTradeInfo() {
	$.ajax({
		url: APIPath + "Departmen/GetAllTradeInfo",
		type: "POST",
		dataType: "json",
		success: function(data) {
			var html = "";
			$(data.data).each(function() {
				html += "<li>" + this.TradeName + "</li>";
			});
			// ★★★ 修复点：使用正确的 ID 'TradeInfo' 填充数据 ★★★
			$("#TradeInfo").html(html);
		}
	});
}

// 绑定场次信息
function BindSceneInfo(activityId) {
	$.ajax({
		type: "post",
		url: APIPath + "NewForm/GetSceInfoById?ActivityId=" + activityId,
		dataType: "json",
		success: function(data) {
			if (data.length > 0) {
				SceneNum = data.length;
				if (SceneNum == 1) {
					$("#SceneTS").html("报名场次选择");
				}
				$("#Chang").removeClass("ChangNone");
				$("#SceneInfo").empty();
				$(data).each(function() {
					var che = data.length == 1 ? "checked" : "";
					$("#SceneInfo").append(
						"<div class='select' onclick=\"CheckClick(this)\" contenteditable='false'>" +
						"<div class= 'option-label' > <p>" + this.SceneName + "</p></div >" +
						"<input class='checkbox' type='checkbox' name='attr36' value='" + this
						.SceneId + "' " + che + ">" +
						"<div class='checkboxInput'></div>" +
						"</div>");
				});
			}
		}
	});
}

function CheckClick(data) {
	$("#changError").html("");
	var checkbox = $(data).find("input[type='checkbox']");
	checkbox.prop('checked', !checkbox.is(":checked"));
}

// 获取隐私协议公司
function GetCompanyPolicy(activityId) {
	$.ajax({
		type: "post",
		url: APIPath + "Activity/MenuComPrivacyShow?ActivityIds=" + activityId,
		dataType: "json",
		success: function(data) {
			for (var i = 0; i < data.length; i++) {
				companyStr += data[i].CompanyId;
				if (i < data.length - 1) companyStr += ',';
				var name = data[i].EnAbbreviation || data[i].CompanyName;
				var dot = (i == data.length - 1) ? "" : "、";
				$("#policyList").append(
					"<a target='_blank' href='https://hrflag.com/HRflag/PrivacyClause?id=" + data[i]
					.CompanyId + "'>" + name + "</a>" + dot);
			}
			if (data.length != 0) $("#IsMandate").removeClass("readnone");
		},
	});
}

// ================= 支付与订单逻辑 =================

// 获取订单号
function getorder() {
	$.ajax({
		url: 'https://form.hrflag.com/WxSpAPI/MicroLesson/GetOrderNo',
		method: 'GET',
		success: (res) => {
			orderid = res;
			updateorder(); // 生成订单
		}
	});
}

// 更新订单信息并跳转支付
function updateorder() {
	var phoneNo = $("#PhoneNo").val();
	getIPInfo().then(function() {
		$.ajax({
			url: 'https://form.hrflag.com/WebAPI/FormOrder/AddFormOrderInfo',
			method: 'POST',
			data: {
				OrderMark: orderid,
				ActivityID: activityId,
				Phone: phoneNo,
				PayType: 0,
				IP: returnCitySN.cip,
				IPAddress: returnCitySN.cname,
				Price: activityPrice,
				TakeDeliveryInfoId: AddressId ? AddressId : "00000000-0000-0000-0000-000000000000",
				JsonStr: JsonStr
			},
			success: (res) => {
				window.location.href = 'https://pay.hrflag.com/reportsPay.html?order=' +
				orderid;
			}
		});
	});
}

function getFormIsBuy() {
	$.ajax({
		url: 'https://form.hrflag.com/WebAPI/FormOrder/IfFormIsBuy?activityId=' + activityId,
		method: "POST",
		success: function(res) {
			if (res[0].IsOrderForm == 1 || res[0].IsOrderForm == 2) {
				if (res[0].Price > 0) {
					$('.reportprice').show();
					$('.addprice').text(res[0].Price);
					activityPrice = res[0].Price;
				}
			}
		}
	});
}

// 获取收货地址 (如果活动需要)
function getAddressInfo() {
	var phoneNo = $("#PhoneNo").val();
	$.ajax({
		url: 'https://form.hrflag.com/WebAPI/FormOrder/GetTakeDeliveryInfo?phone=' + phoneNo,
		method: "POST",
		success: function(res) {
			$('.phonename').empty();
			$('.AddressTxt').empty();
			if (activityPrice >= 0) {
				if (res.length > 0) {
					$('.Addresstotalbox').show();
					$('.changeadd').show();
					$('.addAddress').hide();
					$('.AddressInfo').show();
					$('.phonename').append("<div>收货信息：</div>" + res[0].Name + '，' + res[0].Phone);
					$('.AddressTxt').append("<div>收货地址：</div>" + res[0].Region + ' - ' + res[0].AddressTxt);
					AddressId = res[0].Id;
				} else {
					$('.Addresstotalbox').show();
					$('.changeadd').hide();
					$('.addAddress').show();
				}
			}
		}
	});
}

// ================= 通用工具函数 =================

function getTitle(id) {
	var title;
	$.ajax({
		async: false,
		type: "post",
		url: APIPath + "NewForm/GetActivityName?id=" + id,
		dataType: "json",
		success: function(data) {
			title = data;
		}
	});
	return title;
}

function getTip(id) {
	var outSite = "";
	$.ajax({
		async: false,
		type: "post",
		url: APIPath + "NewForm/GetActivityById?ActivityID=" + id,
		dataType: "json",
		success: function(data) {
			outSite = data[0].OutSite;
			if (data[0].TipMsg && data[0].TipMsg.length != 0) {
				$("#tipMsg").empty().html(data[0].TipMsg);
				$("#linkMsg").html(data[0].TipMsg);
			}
		}
	});
	return outSite;
}

function IsApply(ActivityId, SceneId, Phone) {
	var result = false;
	$.ajax({
		async: false,
		type: "post",
		url: APIPath + "NewForm/CheckCustomSignIn?ActivityId=" + ActivityId + "&SceneId=" + SceneId +
			"&PhoneNo=" + Phone,
		dataType: "json",
		success: function(data) {
			result = data;
		}
	});
	return result;
}

function IsBanned(phone) {
	// 此处可添加黑名单逻辑，目前直接返回false
	return false;
}

function Hint() {
	alert("您已被限制报名");
}

function IsFormSignUpnew() {
	$.ajax({
		async: false,
		type: "post",
		url: APIPath + "NewForm/IsFormSignUp?FormId=" + activityId + "&Phone=" + IsFormPhone,
		dataType: "json",
		success: function(data) {
			IsFormSignUp = data.data;
		}
	});
}

function GetSourceIdBySpecialId(activityId, SpecialId) {
	$.ajax({
		type: "post",
		url: APIPath + "NewForm/GetSourceIdBySpecialId?ActivityId=" + activityId + "&SpecialId=" + SpecialId,
		dataType: "json",
		success: function(data) {
			SourceId = data[0].SourceId;
			SourceName = data[0].SourceName;
			$(".SourceName").html(data[0].SourceName);
			AddSourceView(SourceId);
		}
	});
}

function AddSourceView(SourceId) {
	$.ajax({
		async: false,
		type: "post",
		url: APIPath + "NewForm/AddSourceView",
		data: {
			"SourceId": SourceId
		},
		dataType: "json",
		success: function(data) {}
	});
}

function AddustomerSource(phoneNo) {
	var sid = SourceId ? SourceId : "A00001";
	$.ajax({
		async: false,
		type: "post",
		url: APIPath + "/NewForm/AddustomerSoure?ActivityId=" + activityId + "&SourceId=" + sid +
			"&SpecialId=" + SpecialId + "&PhoneNoId=" + phoneNo,
		dataType: "json",
		success: function(data) {}
	});
}

function disabledSubmitButton(submitButtonName) {
	$("#" + submitButtonName).attr({
		"disabled": "disabled"
	});
	var timeoutObj = setTimeout(function() {
		$("#" + submitButtonName).removeAttr("disabled");
		clearTimeout(timeoutObj);
	}, 10000);
}

function VieString(data) {
	const regex = /^([a-zA-Z0-9])\1$/; // 简单的防乱填校验
	return regex.test(data);
}

function GetDate() {
	var myDate = new Date();
	return myDate.getFullYear() + '-' + conver(myDate.getMonth() + 1) + "-" + conver(myDate.getDate()) + " " + conver(
		myDate.getHours()) + ':' + conver(myDate.getMinutes()) + ":" + conver(myDate.getSeconds());
}

function conver(s) {
	return s < 10 ? '0' + s : s;
}

function SetCookie(phone) {
	$.ajax({
		async: false,
		type: "POST",
		url: APIPath + "System/GetUserInfo",
		data: {
			"PhoneNumber": phone,
		},
		dataType: "json",
		success: function(data) {
			if (data) {
				if (data.Success == "1") {
					var dep = data.UserOutput.Department == null ? '人力资源部' : data.UserOutput.Department;
					var tra = data.UserOutput.TradeName == null ? '行业/Industry' : data.UserOutput.TradeName;
					setCookie('UserId', data.UserOutput.UserId)
					setCookie('Name', data.UserOutput.Name)
					setCookie('PhoneNumber', data.UserOutput.PhoneNumber)
					setCookie('Email', data.UserOutput.Email)
					setCookie('Company', data.UserOutput.Company)
					setCookie('Department', dep)
					setCookie('Position', data.UserOutput.Position)
					setCookie('TradeName', tra)
				}
			}
		}
	});
}


function setCookie(name, value) {
	var Days = 30;
	var exp = new Date();
	exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
	document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

function getCookie(name) {
	var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
	if (arr = document.cookie.match(reg)) return unescape(arr[2]);
	else return null;
}