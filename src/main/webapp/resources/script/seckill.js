//存放主要交互逻辑js代码
//做到模块化(package.类.方法)
var seckill = {
    //封装秒杀相关ajax的url
    URL: {
        now : function () {
            return '/seckill/time/now';
        },
        exposer : function (seckillId) {
            return '/seckill/' + seckillId + '/exposer';
        },
        execution : function (seckillId, md5) {
            return '/seckill/' + seckillId + '/' + md5 + '/execution';
        }
    },
    //获取秒杀地址，控制显示逻辑，执行秒杀
    handleSeckill : function (seckillId, node) {
        node.hide().html('<button class="btn btn-primary btn-lg" id="killBtn">开始秒杀</button>');
        $.post(seckill.URL.exposer(seckillId), {}, function (result) {
            //在回调函数中，执行交互流程
            if(result && result['success']) {
                var exposer = result['data'];
                if(exposer['exposed']) {
                    //开启秒杀
                    //获取秒杀地址
                    var md5 = exposer['md5'];
                    var killUrl = seckill.URL.execution(seckillId, md5);
                    console.log("killUrl=" + killUrl);
                    //按钮绑定一次事件，防止服务器同一时间接到大量URL请求
                    $('#killBtn').one('click', function () {
                        //执行秒杀请求的操作
                        //1.先禁用按钮
                        $(this).addClass('disabled');
                        //2.发送秒杀请求
                        $.post(killUrl, function (result) {
                            if(result && result['success']){
                                var killResult = result['data'];
                                var state = killResult['state'];
                                var stateInfo = killResult['stateInfo'];
                                //显示秒杀结果
                                node.html('<span class="label label-success">' + stateInfo + '</span>');
                            }
                        });
                    });
                    node.show();
                }
                else {
                    //未开启秒杀
                    var now = exposer['now'];
                    var start = exposer['start'];
                    var end = exposer['end'];
                    //重新计算计时逻辑
                    seckill.countdown(seckillId, now, start, end);
                }
            }
            else {
                console.log("result=" + result);
            }
        });
    },

    //验证手机号
    validatePhone : function (phone) {
        if(phone && phone.length == 11 && !isNaN(phone)) {
            return true;
        }
        else {
            return false;
        }
    },

    countdown : function (seckillId, nowTime, startTime, endTime) {
        var seckillBox = $('#seckill-box');
        //时间判断
        if(nowTime > endTime) {
            //秒杀结束
            seckillBox.html('秒杀结束！');
        }
        else if(nowTime < startTime) {
            //秒杀未开始，计时事件绑定
            var killTime = new Date(startTime + 1000);//加一秒，防止用户计时过程中的时间偏移
            seckillBox.countdown(killTime, function (event) {
                //时间格式
                var format = event.strftime('秒杀计时： %D天 %H时 %M分 %S秒');
                seckillBox.html(format);
            }).on('finish.countdown', function () {
                //获取秒杀地址，控制显示逻辑，执行秒杀
                seckill.handleSeckill(seckillId, seckillBox)
            });
        }
        else {
            //秒杀开始
            seckill.handleSeckill(seckillId, seckillBox);
        }
    },

    //详情页秒杀逻辑
    detail: {
        init: function (params) {
            //用户手机验证和登录，计时交互
            //规划交互流程
            //在Cookie中查找手机号
            var killPhone = $.cookie('killPhone');

            if(!seckill.validatePhone(killPhone)) {
                //绑定Phone
                //控制输出
                var killPhoneModal = $('#killPhoneModal');
                //显示弹出层
                killPhoneModal.modal({
                    show : true, //显示弹出层
                    backdrop : false, //禁止位置关闭
                    keyboard : false //关闭键盘事件
                });

                $('#killPhoneBtn').click(function () {
                    var inputPhone = $('#killPhoneKey').val();
                    console.log("inputPhone=" + inputPhone); //TODO
                    if(seckill.validatePhone(inputPhone)){
                        //验证通过，电话写入Cookie，7天过期
                        $.cookie('killPhone', inputPhone, {expires:7, path:'/seckill'});
                        // 刷新页面
                        window.location.reload();
                    }
                    else {
                        //TODO 错误文案信息抽取到前端字典里
                        $('#killPhoneMessage').hide().html('<label class="label label-danger">手机号错误！</label>').show(300);
                    }
                });
            }
            //已经登录
            //计时交互
            var seckillId = params['seckillId'];
            var startTime = params['startTime'];
            var endTime = params['endTime'];
            $.get(seckill.URL.now(), {}, function (result) {
                if(result && result['success']) {
                    var nowTime = result['data'];
                    //时间判断
                    console.log('nowTime=' + nowTime);//todo
                    console.log('endTime=' + endTime);//todo
                    seckill.countdown(seckillId, nowTime, startTime, endTime);

                }
                else {
                    console.log('result:' + result);
                }
            });
        }
    }
};