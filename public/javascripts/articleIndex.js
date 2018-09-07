window.onload=function () {
    $(function () {
        var limitNumber = 5;   //每页加载条数
        getallData(1) //首次进入页面时 直接调用函数，无需点击即可加载数据
        function getallData(page) {
            $.ajax({   //ajax异步请求 传递page（需跳转的页码） limitNumber （每页显示的数据条数）
                url: '/getArticlePost',
                data: {page: page, limitNumber: limitNumber},
                type: 'get',
                success: function (res) {   //数据从服务器成功返回后
                    let data = res.data;   //获取后台返回的数据
                    var str = ''
                    data.forEach(function (item) {
                        str += handleData(item)   //将每条数据经过handleData函数处理后 变成字符串 并拼接
                    })
                    $('#articleLeft>.con').html(str)   //将拼接后的字符串渲染到页面
                }
            })
        }

        var preNum=1;  //设置上次的页码数（点击上下页时使用）
        //点击页码按钮事件
        $('#articleLeft>.btn>li').click(function () {

            let index = $(this).index()-1; //获取页码数，页码数比当前li的下表数多一，具体看li的html布局
            console.log(index)
            if(index===-1){index=1} //点击首页时
            else if(index===$('#articleLeft>.btn>li').length-2){index=$('#articleLeft>.btn>li').length-4;}//点击尾页时
            else if(index===0){   //点击上一页时
                if(preNum===1){return}  //判断是否为首页
                index=preNum-1   //在上个页码数的数值上减一
            }
            else if(index===$('#articleLeft>.btn>li').length-3){ //点击下一页时
                if(preNum===$('#articleLeft>.btn>li').length-4){return}//判断是否为尾页
                index=preNum+1  //在上个页码数的数值上加一
            }
            // console.log(preNum)
            preNum=index  //记录上一次的页码数 （点击上下页时使用）
            getallData(index)  //传入需跳转的页码数 调用getallData函数 从后台获取该页需渲染的数据
            $('#articleLeft>.btn>li').eq(index+1).siblings('li').css('background','white') //按钮的样式
            $('#articleLeft>.btn>li').eq(index+1).css('background','rgb(134,150,165)')

        })

//传入后台获取的数据 提取所需数据并 拼接成字符串
        function handleData(data) {
            let str =`   
            <li>
                <a href="/article/${data.tx}"> ${ data.title }</a>
                <a href="/article/${data.tx}"><img src="${data.picPath}" alt=""></a>
                <div>
                    <p> ${ data.about }</p>
                    <p> ${ data.time }</p>
                </div>
            </li>`
            return str;  //返回该字符串
        }

    })


}