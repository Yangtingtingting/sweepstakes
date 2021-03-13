function GetQueryString(name)
{
	var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if(r!=null)return  unescape(r[2]); return null;
}
var gid=GetQueryString("id");
// appplat==1是app里的否则则是浏览器中的
var appplat=GetQueryString("appplat");
var phonenumber=GetQueryString("phonenumber");

function closelayer(){
	// alert('关闭弹出页');
	layer.close(layerindex);
};
function layerendfun(){
	appbox.rotatedoing=false;
	appbox.resetfun();
}

var appbox=new Vue({
	el:'#appbox',
	data:{
		'degnum':0,
		'zj_type':'',
		'typecount':6,
		'nologin':true,
		'noregist':true,
		'robotname':'',

		'lasttimes':0,
		'allearn':'0MB',
		'thistimeearn':'',

		'phonenumber':'',
		'dzp_clickstatus':4, /*dzp_clickstatus 值为1	表示APP打开 登录状态; dzp_clickstatus 值为2	表示APP打开 不是登录状态; dzp_clickstatus 值为0	表示非APP打开; dzp_clickstatus 值为3	表示非APP打开	老用户; dzp_clickstatus 值为4	表示非APP打开	新用户;*/
		'iptphonenumber':'',
		'userphonenumber':'',
		'phonecheckbox':true,
		'havetransition':true,
		'lasttimesallearnStatus':true,
		'choujiangtimes':0,/*抽奖次数*/
		'rotatedoing':false,/*非-正在抽奖中*/
		'getphonemsgwords':'点击获取验证码',
		'getphonemsgtimeS':60,
		'iptphonemsg':'',
		'honoree':'',
        'honoreestatus':false,

        'postget_allearn':'',
        'postget_choujiangtimes':'',

	},
	methods:{
       /*iptphonemsg  万能验证码: 45561846957352359264*/

// ------------------------------------------------------------------------
		ifapppalt:function(){
			var _this=this;
			if(appplat==1){
				console.log('这是APP打开的页面');
				this.phonecheckbox=false;
				// appbox.appgetusermsg();
				this.dzp_clickstatus=1;
				// this.dzp_clickstatus=2;
				this.userphonenumber=phonenumber;
                _this.$http.post('/api/lottery/activity/mobile',JSON.stringify({
                    "mobile":_this.userphonenumber,
                    "userName":_this.userphonenumber,
                    // "verifyCode":'45561846957352359264',
                }),{emulateJSON: true}).then(function (msg) {
                    /*验证手机号和短信验证码成功*/
                    // console.log(msg)
                    console.log(msg.data.lotteryTimes);
                    _this.choujiangtimes=msg.data.lotteryTimes;
                    if(msg.data.totalPrize==null||msg.data.totalPrize==''||msg.data.totalPrize==undefined||msg.data.totalPrize==0){
                        // 总流量为0
                        msg.data.totalPrize=0;
					}else {
                        // 总流量不为0
                        if(msg.data.honoree==''||msg.data.honoree==null||msg.data.honoree==undefined){
                            _this.honoreestatus=true;
                        }
                    }
                    _this.allearn=msg.data.totalPrize+'MB';
                    _this.honoree=msg.data.honoree;
                    _this.phonecheckbox=false;
                    sessionStorage.setItem('cookieuserphone',_this.userphonenumber);
                }).catch(function (msg) {
                    console.log(msg)
                    appbox.layerfun('抱歉','','','获取用户信息失败,请重新加载！','');
                })
			}else{
				console.log('appplat未传参或者是浏览器打开的页面');
			}
		},
		// app打开时获取用户信息-------设置抽奖次数及页面状态

        // 领奖人手机号录入
        gethonoreenumber:function () {
            var _this=this;
            var str= this.honoree;
            if(str==""){
                // appbox.layerfun(title,liuliang,cjtimes,tips);
                appbox.layerfun('抱歉','','','手机号不能为空！','');
                return;
            }else {
                var re = /^[1][3,4,5,6,7,8][0-9]{9}$/
                if (re.test(str)) {
                    console.log("手机号格式正确");
                    _this.$http.post('/api/lottery/honoree',JSON.stringify({
                        "mobile":_this.userphonenumber,
                        "honoree":_this.honoree,
                    }),{emulateJSON: true}).then(function (msg) {
                        console.log(msg.data.code);
                        // sessionStorage.setItem('cookieuserphone',_this.userphonenumber);
                        if(msg.data.message=='领奖成功！'){
                            // appbox.layerfun(title,liuliang,cjtimes,tips,fun);
                            appbox.layerfun('成功','','','领奖手机号录入成功!','');
                            _this.honoreestatus=false;
                        }else {
                            appbox.layerfun('抱歉','','','领奖手机号录入失败,请重试！','');
                        }
                    }).catch(function (msg) {
                        console.log(msg);
                        // appbox.layerfun(title,liuliang,cjtimes,tips,fun);
                        appbox.layerfun('抱歉','','','领奖手机号录入失败,请重试！','');
                    })
                } else {
                    appbox.layerfun('抱歉','','','手机号格式错误！','');
                    return;
                }
            }


        },
		// 点击转盘抽奖
		dzp_clickfun:function(){
			this.phonecheckbox=false;
				if(this.rotatedoing){
					return;
				}
				appbox.resetfun();
				appbox.getjiangpintype();
		},
		// 验证手机号并获取验证码操作
		getphonemsgclick:function(){
            var _this=this;
            var timeinterval='';
            if(_this.getphonemsgwords!='点击获取验证码'){
                return;
            }
            // 输入内容是否为空及是否符合正则
            var str= this.iptphonenumber;
            if(str==""){
                // appbox.layerfun(title,liuliang,cjtimes,tips);
                appbox.layerfun('抱歉','','','手机号不能为空！','');
                return;
            }else{
                var re = /^[1][3,4,5,6,7,8][0-9]{9}$/
                if (re.test(str)) {
                    console.log("手机号格式正确");
                    // _this.dzp_clickstatus=0;
                    _this.userphonenumber=_this.iptphonenumber;

                    _this.$http.get('/api/lottery/captchas/mobile/'+_this.userphonenumber).then(function (msg) {
							console.log(msg.data.message);


                            clearInterval(timeinterval);
                            timeinterval=setInterval(function(){
                                _this.getphonemsgtimeS--;
                                _this.getphonemsgwords=_this.getphonemsgtimeS+'s后再次获取';
                                if(_this.getphonemsgtimeS==0){
                                    _this.getphonemsgwords='点击获取验证码';
                                    _this.getphonemsgtimeS=60;
                                    clearInterval(timeinterval);
                                }
                            }, 1000);
						},function (msg) {
							// console.log(msg.data);
                            appbox.layerfun('抱歉','','',msg.data.message,'');
                            return;
						})
                } else {
                    appbox.layerfun('抱歉','','','手机号格式错误！','')
					return;
                }
            }
		},
		// 验证手机号及验证码.成功后存储userphonenumber即可参与抽奖
		testphonenumber:function () {
		    var _this=this;
			var str= this.iptphonenumber;
			if(str==""){
				// appbox.layerfun(title,liuliang,cjtimes,tips);
				appbox.layerfun('抱歉','','','手机号不能为空！','');
				return;
			}else if(_this.iptphonemsg==''){
				appbox.layerfun('抱歉','','','请输入短信验证码!','');
				return;
			}else {
				var re = /^[1][3,4,5,6,7,8][0-9]{9}$/
				if (re.test(str)) {
					console.log("手机号格式正确");
					// _this.dzp_clickstatus=0;
					_this.userphonenumber=_this.iptphonenumber;
					_this.$http.post('/api/lottery/activity/mobile',JSON.stringify({
						"mobile":_this.userphonenumber,
						"userName":_this.userphonenumber,
						"verifyCode":_this.iptphonemsg,
					}),{emulateJSON: true}).then(function (msg) {
                        /*验证手机号和短信验证码成功*/
                        // console.log(msg)
                        console.log(msg.data.lotteryTimes);
                        _this.choujiangtimes=msg.data.lotteryTimes;
                        if(msg.data.totalPrize==null){
                            msg.data.totalPrize=0;
                        }
                        _this.allearn=msg.data.totalPrize+'MB';
                        _this.honoree=msg.data.honoree;
                        _this.phonecheckbox=false;
                        sessionStorage.setItem('cookieuserphone',_this.userphonenumber);
					}).catch(function (msg) {
						console.log(msg.data.message)
                        appbox.layerfun('抱歉','','',msg.data.message,'');
					})
                } else {
					appbox.layerfun('抱歉','','','手机号格式错误！','');
					return;
				}
			}
		},
		// 请求后台获取中奖类型
		getjiangpintype:function(){
			// var apiphonenumber= this.userphonenumber
			if(this.choujiangtimes==0){
				// appbox.layerfun(title,liuliang,cjtimes,tips);
				appbox.layerfun('抱歉','','','抽奖次数已经用完了','');
				return;
			}
		    var _this=this;
		    // 正在转动抽奖
		    this.rotatedoing=true;
            var postphonenum = '';
		    postphonenum = _this.userphonenumber;
            getjiangpintypeurl='/api/lottery/'+postphonenum;


			_this.$http.post(getjiangpintypeurl).then(function (msg) {
                _this.postget_choujiangtimes=msg.data.lotteryTimes;
                _this.postget_allearn=msg.data.totalPrize+'MB';
                if(_this.postget_allearn=='MB'){
                    _this.postget_allearn='0MB'
                }
                _this.honoree=msg.data.honoree;
                _this.thistimeearn=msg.data.prize;
                _this.phonecheckbox=false;
                if(msg.data.prizeId==0){
                    _this.zj_type=5;
                    _this.thistimeearn='5GB'
				}else if(msg.data.prizeId==1){
                    _this.zj_type=2;
                    _this.thistimeearn='2GB'
				}else if(msg.data.prizeId==2){
                    _this.zj_type=4;
                    _this.thistimeearn='1GB'
                }else if(msg.data.prizeId==3){
                    _this.zj_type=3;
                    _this.thistimeearn='500MB'
                }else if(msg.data.prizeId==4){
                    _this.zj_type=1;
                    _this.thistimeearn='100MB'
                }else if(msg.data.prizeId==5){
                    _this.zj_type=6;
                    _this.thistimeearn='0MB'
                }
				_this.typecount=6;
				// console.log(_this.zj_type);
				appbox.rotatefun();
			},function (msg) {
				console.log(msg);
			})
		},
        layerfun:function(title,liuliang,cjtimes,tips,fun){
            if(appplat==1){
                // 这是APP打开的页面
                if(tips==''||tips==null||tips==undefined){
                    //不是提示类消息--中了多少流量未中奖等消息
                    var layerindexcontent='';
                    if(liuliang=='0MB'){
                        layerindexcontent='<div class="layer-tips"><div class="layertitle">很遗憾</div><p class="layerp1">您未获得流量奖励</p><p class="layerp2">剩余抽奖机会'+cjtimes+'次</p><a style="display: none" class="layerappdownload" href="javascript:void(0)">app中分享活动获取更多抽奖机会吧</a><div class="layerclosebtn" onclick="closelayer()"></div></div>';
                    }else {
                        layerindexcontent='<div class="layer-tips"><div class="layertitle">'+title+'</div><p class="layerp1">获得<span>'+liuliang+'</span>奖励,在<span>个人奖励页</span>查看</p><p class="layerp2">剩余抽奖机会'+cjtimes+'次</p><a style="display: none" class="layerappdownload" href="javascript:void(0)">app中分享活动获取更多抽奖机会吧</a><div class="layerclosebtn" onclick="closelayer()"></div></div>';
                    }

                    layerindex=layer.open({
                        type: 1,
                        skin: 'layer-tips-box', //样式类名
                        title:0,
                        area: ['6.74rem','4.46rem'],
                        closeBtn: 0, //不显示关闭按钮
                        anim: 2,
                        shadeClose: false, //开启遮罩关闭
                        content:layerindexcontent,
                        end:function(){
                            if(fun=='layerendfun'){
                                appbox.layerendfun();
                            }
                        }
                    });
                }else if(tips=='抽奖次数已经用完了'){
                    layerindex=layer.open({
                        type: 1,
                        skin: 'layer-tips-box', //样式类名
                        title:0,
                        area: ['6.74rem','4.46rem'],
                        closeBtn: 0, //不显示关闭按钮
                        anim: 2,
                        shadeClose: false, //开启遮罩关闭
                        // content: '手机号不能为空！'
                        content:'<div class="layer-tips"><div class="layertitle">'+title+'</div><p class="layerp1">'+tips+'<a class="layerappdownload" href="javascript:void(0)">点击右上角分享活动获取更多抽奖机会吧</a><div class="layerclosebtn" onclick="closelayer()"></div></div>',
                        end:function(){
                            if(fun=='layerendfun'){
                                appbox.layerendfun();
                            }
                        }
                    });
                } else {
                    //是提示类消息-----报错提示等消息
                    layerindex=layer.open({
                        type: 1,
                        skin: 'layer-tips-box', //样式类名
                        title:0,
                        area: ['6.74rem','4.46rem'],
                        closeBtn: 0, //不显示关闭按钮
                        anim: 2,
                        shadeClose: false, //开启遮罩关闭
                        // content: '手机号不能为空！'
                        content:'<div class="layer-tips"><div class="layertitle">'+title+'</div><p class="layerp1">'+tips+'<a style="display: none" class="layerappdownload" href="javascript:void(0)">app中分享活动获取更多抽奖机会吧</a><div class="layerclosebtn" onclick="closelayer()"></div></div>',
                        end:function(){
                            if(fun=='layerendfun'){
                                appbox.layerendfun();
                            }
                        }
                    });
                }

            }else {
                // appplat未传参或者是浏览器打开的页面
                if(tips==''||tips==null||tips==undefined){
                    //不是提示类消息--中了多少流量等未奖等消息
                    var layerindexcontent='';
                    if(liuliang=='0MB'){
                        layerindexcontent='<div class="layer-tips"><div class="layertitle">很遗憾</div><p class="layerp1">您未获得流量奖励</p><p class="layerp2">剩余抽奖机会'+cjtimes+'次</p><a class="layerappdownload" target="_blank" href="http://a.app.qq.com/o/simple.jsp?pkgname=com.diting.pingxingren&channel=0002160650432d595942&fromcase=60001">app中分享活动获取更多抽奖机会吧</a><div class="layerclosebtn" onclick="closelayer()"></div></div>';
                    }else {
                        layerindexcontent='<div class="layer-tips"><div class="layertitle">'+title+'</div><p class="layerp1">获得<span>'+liuliang+'</span>奖励,在<span>个人奖励页</span>查看</p><p class="layerp2">剩余抽奖机会'+cjtimes+'次</p><a class="layerappdownload" target="_blank" href="http://a.app.qq.com/o/simple.jsp?pkgname=com.diting.pingxingren&channel=0002160650432d595942&fromcase=60001">app中分享活动获取更多抽奖机会吧</a><div class="layerclosebtn" onclick="closelayer()"></div></div>';
                    }

                    layerindex=layer.open({
                        type: 1,
                        skin: 'layer-tips-box', //样式类名
                        title:0,
                        area: ['6.74rem','4.46rem'],
                        closeBtn: 0, //不显示关闭按钮
                        anim: 2,
                        shadeClose: false, //开启遮罩关闭
                        content:layerindexcontent,
                        end:function(){
                            if(fun=='layerendfun'){
                                appbox.layerendfun();
                            }
                        }
                    });
                }else if(tips=='抽奖次数已经用完了'){
                    layerindex=layer.open({
                        type: 1,
                        skin: 'layer-tips-box', //样式类名
                        title:0,
                        area: ['6.74rem','4.46rem'],
                        closeBtn: 0, //不显示关闭按钮
                        anim: 2,
                        shadeClose: false, //开启遮罩关闭
                        // content: '手机号不能为空！'
                        content:'<div class="layer-tips"><div class="layertitle">'+title+'</div><p class="layerp1">'+tips+'<a class="layerappdownload" target="_blank" href="http://a.app.qq.com/o/simple.jsp?pkgname=com.diting.pingxingren&channel=0002160650432d595942&fromcase=60001">app中分享活动获取更多抽奖机会吧</a><div class="layerclosebtn" onclick="closelayer()"></div></div>',
                        end:function(){
                            if(fun=='layerendfun'){
                                appbox.layerendfun();
                            }
                        }
                    });
                }else {
                    //是提示类消息-----报错提示等消息
                    layerindex=layer.open({
                        type: 1,
                        skin: 'layer-tips-box', //样式类名
                        title:0,
                        area: ['6.74rem','4.46rem'],
                        closeBtn: 0, //不显示关闭按钮
                        anim: 2,
                        shadeClose: false, //开启遮罩关闭
                        // content: '手机号不能为空！'
                        content:'<div class="layer-tips"><div class="layertitle">'+title+'</div><p class="layerp1">'+tips+'<a style="display: none" class="layerappdownload" href="http://a.app.qq.com/o/simple.jsp?pkgname=com.diting.pingxingren&channel=0002160650432d595942&fromcase=60001">app中分享活动获取更多抽奖机会吧</a><div class="layerclosebtn" onclick="closelayer()"></div></div>',
                        end:function(){
                            if(fun=='layerendfun'){
                                appbox.layerendfun();
                            }
                        }
                    });
                }
            };


        },
        closelayer:function(){
            layer.close(layerindex);
            this.phonecheckbox=false;
        },
        resetfun:function(){
            var _this=this;
            console.log('resetfun');
            // this.dzp_clickstatus=0;

            this.havetransition=false;
            this.degnum =0;
        },
		rotatefun:function(){
		    var _this=this;
			console.log('rotatefun');
			// 重置输入框里的手机号码并隐藏输入框
			this.iptphonenumber='';
			this.phonecheckbox=false;
			this.havetransition=true;
			// 设置对应的旋转角度
			// this.degnum = 30+3600+(this.zj_type-0.5)*(360/this.typecount);
			this.degnum = 3600+(this.zj_type-0.5)*(360/this.typecount);
			// choujiangtimes=this.choujiangtimes;
			var timeout=setTimeout(function(){

                _this.choujiangtimes=_this.postget_choujiangtimes;
                _this.allearn=_this.postget_allearn;
				// appbox.layerfun(title,liuliang,cjtimes,tips,fun);
				// appbox.layerfun('恭喜您','10000MB',1001,'','layerendfun');
				if(_this.zj_type==6 && _this.thistimeearn=='0MB'){
                    appbox.layerfun('很遗憾',_this.thistimeearn,_this.choujiangtimes,'','layerendfun');
				}else {
                    appbox.layerfun('恭喜您',_this.thistimeearn,_this.choujiangtimes,'','layerendfun');
				}
			},6100)
		},
		layerendfun:function(){
			this.rotatedoing=false;
			appbox.resetfun();

			var _this=this;
            // app中判断是否录入领奖人信息
            if(appplat==1){
                // 如果是在app中打开才会执行
                if(_this.postget_allearn=='MB'||_this.postget_allearn=='0MB'){

                }else {
                    // 总流量不为0
                    if(_this.honoree==''||_this.honoree==null||_this.honoree==undefined){
                        _this.honoreestatus=true;
                    }
                }
            }
		}
	},
	filters:{
		selffun:function (val) {
			// 判断方法
		}
	},
	computed:{

	},
	watch:{
        iptphonenumber:function () {
			// this.iptphonemsg='45561846957352359264';
        }
	},
	mounted:function () {
		Vue.nextTick(function () {
			// appbox.alertfun();
		})
	},
	beforeCreate:function(){
		Vue.nextTick(function () {
			// 验证是否登录
			// appbox.iflogined();
			appbox.resetfun();
			appbox.ifapppalt();
		})
	}
})