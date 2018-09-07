var express = require('express');
var router = express.Router();
const mongoC = require('mongodb').MongoClient
const dbUrl = "mongodb://localhost:27017"
const fs = require('fs')
const path = require('path')
const formidable = require('formidable')

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

//渲染登陆页面
router.get('/login', (req, res) => {
    res.render('login')
})

//处理用户注册数据
router.post('/register', function (req, res, next) {
    //处理注册用户名或密码为空情况
    if (!req.body.user || !req.body.password) {
        res.json({type: -3, msg: '用户名、密码不能为空'});
        return
    }
    mongoC.connect(dbUrl, (err, client) => {
        if (err) {
            console.log(err)
            client.close()
            return
        }
        let info = client.db('info')
        let user = info.collection('user') //user集合（有关用户信息）

        user.find({name: req.body.user}).toArray((err, result) => {  //查找数据库  找字段name且类型为req.body.user 的数据
            if (err) {
                console.log(err)
                res.json({type: -2, msg: '注册失败'})  //res.json向前端传输 type 和 数据（多个以逗号隔开）
            }
            if (result.length > 0) {  //若查询结果长度大于0，即该用户名已存在
                res.json({type: -1, msg: '该用户名已被注册'})
            } else {
                res.json({type: 1, msg: '注册成功'})
                //往数据库中插入新增用户的信息
                user.insert({name: req.body.user, password: req.body.password}, (err) => {
                    if (err) {
                        return console.log(err)
                    }
                })
            }
        })
    })
});

//处理用户登陆数据
router.post('/login', function (req, res, next) {
    mongoC.connect(dbUrl, (err, client) => {
        if (err) {
            console.log(err)
            client.close()
            return
        }
        let info = client.db('info')
        let user = info.collection('user')
        //在数据库中匹配该用户名
        user.find({name: req.body.user}).toArray((err, result) => {
            if (err) {
                console.log(err)
                res.json({type: -2, msg: '登录失败'})
            }
            //查询结果长度小于等于0  即该用户名不存在
            if (result.length <= 0) {
                res.json({type: -1, msg: '该用户名不存在'})
            } else {
                //若用户名存在则匹配对用的密码
                if (result[0].password == req.body.password) {
                    req.session.user = {} //匹配成功，则向session数据添加user字段 且 类型为该用户名
                    req.session.user.name = result[0].name
                    // console.log(req.session.user)
                    res.json({type: 1, msg: '登录成功'}) //向前端发送数据
                }
                else {
                    res.json({type: -3, msg: '密码错误'})
                }//处理 匹配不成功
            }
        })
    })
});

router.get('/changeInfo', (req, res) => {
    res.render('changeInfo', {title: '修改信息'})
})

router.post('/changeInfo', (req, res) => {
    var form = new formidable.IncomingForm();
    let basepath = path.normalize(path.join(__dirname, '../public', 'headPic'))
    form.uploadDir = basepath
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.log(err)
            return
        }
        // console.log(fields.password)
        // console.log(files.picFile.name)

        let extname = path.extname(files.picFile.name) //获取上传文件的扩展名
        let newpaw = fields.password
        let userName = req.session.user.name    //获取当前用户账号名

        if (extname) {
            let oldpath = files.picFile.path;    //获取图片上传到的原地址
            let newPath = path.normalize(path.join(basepath, userName + extname))//设置上传图片新地址
            fs.rename(oldpath, newPath, (err) => { //将原地址的图片重命名到新地址 （目的是设置上传图片的名称）
                if (err)
                    console.log(err)
                return
            })
            mongoC.connect(dbUrl, (err, client) => {
                if (err) {
                    console.log(err)
                    return
                }
                var info = client.db('info')
                var user = info.collection('user')
                user.update({name: userName}, {$set: {headPic: '/headPic/' + userName + extname}}, (err, r) => {
                    if (err) {
                        console.log(err)
                        return
                    }
                    // res.redirect('/')
                })
            })
            req.session.user.headPic = '/headPic/' + userName + extname
        }

        if (newpaw) {
            mongoC.connect(dbUrl, (err, client) => {
                if (err) {
                    console.log(err)
                    return
                }
                var info = client.db('info')
                var user = info.collection('user')
                user.update({name: userName}, {$set: {password: newpaw}}, (err, r) => {
                    if (err) {
                        console.log(err)
                        return
                    }
                })
            })
        }

        res.redirect('/')


    })
})

//处理退出登录
router.get('/out', function (req, res, next) {
    req.session.user = '' //删除session字段的类型（即用户名）
    res.redirect('/users/login') //重定向到登陆页面
});

module.exports = router;
