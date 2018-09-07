window.onload=function () {
    $(function () {
        var limitNumber = 5;   //每页加载条数
        getallData(1) //首次进入页面时 直接调用函数，无需点击即可加载数据
        function getallData(page) {
            $.ajax({   //ajax异步请求 传递page（需跳转的页码） limitNumber （每页显示的数据条数）
                url: '/getallPost',
                data: {page: page, limitNumber: limitNumber},
                type: 'get',
                success: function (res) {   //数据从服务器成功返回后
                    let data = res.data;   //获取后台返回的数据
                    var str = ''
                    data.docArr.forEach(function (item) {
                        str += handleData(item)   //将每条数据经过handleData函数处理后 变成字符串 并拼接
                    })
                    $('#commentAll').html(str)   //将拼接后的字符串渲染到页面
                    // $('.headPic').css('background','url( <%= userInfo.headPic%> )')
                }
            })
        }

        var preNum=1;  //设置上次的页码数（点击上下页时使用）
        //点击页码按钮事件
        $('#paging>li').click(function () {

            let index = $(this).index()-1; //获取页码数，页码数比当前li的下表数多一，具体看li的html布局
            if(index===-1){index=1} //点击首页时
            else if(index===$('#paging>li').length-2){index=$('#paging>li').length-4;}//点击尾页时
            else if(index===0){   //点击上一页时
                if(preNum===1){return}  //判断是否为首页
                index=preNum-1   //在上个页码数的数值上减一
            }
            else if(index===$('#paging>li').length-3){ //点击下一页时
                if(preNum===$('#paging>li').length-4){return}//判断是否为尾页
                index=preNum+1  //在上个页码数的数值上加一
            }
            // console.log(preNum)
            preNum=index  //记录上一次的页码数 （点击上下页时使用）
            getallData(index)  //传入需跳转的页码数 调用getallData函数 从后台获取该页需渲染的数据
            $('#paging>li').eq(index+1).siblings('li').css('background','white') //按钮的样式
            $('#paging>li').eq(index+1).css('background','rgb(134,150,165)')

        })

//传入后台获取的数据 提取所需数据并 拼接成字符串
        function handleData(data) {
            let str =`   
    <div class="comment">
        <div class="info">
            <div class="headPic" style="background: url(${data.headPic});background-size: cover"></div>
            <div class="username">${data.name}</div>
        </div>
        <div class="msg">${data.msg}
            <div class="time">${data.time}</div>
        </div>
    </div>`
            return str;  //返回该字符串
        }

        //点击发表评论时，处理用户未登录情况
        $('input[type=button]').click(function () {
            alert('请先登录!')
            window.location.href='/users/login'
        })

        //点击发表评论时，处理用户提交空内容
        $('input[type=submit]').click(function () {
            if($('textarea').val()===''){
                $('#box>form>h4').css('display','block') //显示空内容警告
                return false  //阻止submit页面刷新
            }
        })
        //空内容警告隐藏
        $('textarea').click(function () {
            $('#box>form>h4').css('display','none')
        })
    })


}