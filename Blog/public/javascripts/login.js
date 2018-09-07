$(function () {
    $('#login>span').click(function () { // 切换登陆-》注册
        $(this).parent().css('display','none')
        $('#register').css('display','block')
    })
    $('#register>span').click(function () { //切换注册-》登陆
        $(this).parent().css('display','none')
        $('#login').css('display','block')
    })
    $('#register p:first').click(function () { //注册页 隐藏警告信息
        $('.wrong').css('display','none')
    })

    $('#login p').click(function () {  //登陆页 隐藏警告信息
        $('.wrong').css('display','none')
    })

    //处理注册信息
    $('#register p:last').click(function(){
        let userVal = $('#register [name="user"]').val()  //获取注册的用户名
        let pswVal = $('#register [name="password"]').val() //获取注册的密码

        //以post请求方式 向后台传递数据
        $.post('/users/register',{user:userVal,password:pswVal},(res)=>{
            if(res.type == 1){     //接收后台传来的 type 及数据
                alert('注册成功！请登录！')
                window.location.href = '/users/login' //注册成功则跳转到登陆页面
            }else if(res.type == -2){  //注册失败
                $('.wrong').html(res.msg)
                $('.wrong').css('display','block')
            }else if(res.type == -3){  //用户名或密码为空
                $('.wrong').html(res.msg)
                $('.wrong').css('display','block')
            }else{ //用户名已存在
                $('.wrong').html(res.msg)
                $('.wrong').css('display','block')
            }
        })
    })
    //点击登陆
    $('#login p:last').click(function(){
        let userVal = $('#login [name="user"]').val()
        let pswVal = $('#login [name="password"]').val()
        if(!userVal){
            $('.wrong').html('请输入用户名')
            $('.wrong').css('display','block')
            return}
        $.post('/users/login',{user:userVal,password:pswVal},(res)=>{
            if(res.type == 1){//登陆成功
                window.location.href = '/'
                // 前端界面的操作路由  跳转到首页
            }
            else if(res.type == -2){
                $('.wrong').html(res.msg)
                $('.wrong').css('display','block')
            }
            else if(res.type == -1){
                $('.wrong').html(res.msg)
                $('.wrong').css('display','block')
            }
            else{
                $('.wrong').html(res.msg)
                $('.wrong').css('display','block')
            }
        })
    })


})


