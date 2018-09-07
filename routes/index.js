var express = require('express');
var router = express.Router();
const read = require('../util/read.js')
const path = require('path')
const fs = require('fs')
const mongoC = require('mongodb').MongoClient
const dbUrl = "mongodb://localhost:27017"
const formidable = require('formidable')

/* 渲染首页. */
router.get('/', function (req, res, next) {
    mongoC.connect(dbUrl, (err, client) => {
        if (err) {
            console.log(err)
            client.close()
            return
        }
        let info = client.db('info')
        let article = info.collection('article')
        let comment = info.collection('comment')
        article.find().limit(4).sort({tx: -1}).toArray((err, result) => {
            if (err) {
                return console.log(err)
            }
            // console.log(result)
            let articleResult = result
            // res.render('index',{title:'首页',article:result})
            comment.find().limit(4).sort({tx: -1}).toArray((err, result) => {
                if (err) {
                    return console.log(err)
                }
                console.log(result)
                res.render('index', {title: '首页', article: articleResult, comment: result})
            })
        })

    })
    // console.log(req.locals)
});

router.get('/article', function (req, res, next) {
    mongoC.connect(dbUrl, (err, client) => {
        if (err) {
            console.log(err)
            client.close()
            return
        }
        let info = client.db('info')
        let article = info.collection('article')
        article.find().toArray((err, result) => {
            if (err) {
                return console.log(err)
            }
            // console.log(result)
            res.render('article/index', {title: '博文', count: result.length, allArticle: result})
        })
    })
})

router.get('/getArticlePost', function (req, res) {
    let page = req.query.page
    let limitNumber = req.query.limitNumber;
    mongoC.connect(dbUrl, (err, client) => {
        if (err) {
            console.log(err)
            client.close()
            return
        }
        let info = client.db('info')
        let article = info.collection('article')
        article.find({}).limit(Number(limitNumber)).skip((page - 1) * limitNumber).sort({tx: -1}).toArray(function (err, docArr) {
            //查询数据  限制条件为 只读取（limitNumber）条数据 并跳过（page-1)*limitNumber 条数据
            if (err) {
                res.json({type: -1, msg: '数据查询失败', data: {}})
                client.close()
                return
            }
            res.json({type: 1, msg: '数据查询成功', data: docArr}) //返回数据到前端
        })
    })
})


router.get('/article/:name', function (req, res, next) {
    var articleId = req.params.name
    // console.log(articleId)
    mongoC.connect(dbUrl, (err, client) => {
        if (err) {
            console.log(err)
            client.close()
            return
        }
        let info = client.db('info')
        let article = info.collection('article')
        article.find({tx: Number(articleId)}).toArray((err, result) => {
            if (err) {
                return console.log(err)
            }
            // console.log(result[0])
            res.render('article/articleModel', {title: '博文详情', article: result[0]})
        })
    })
})

router.get('/release', function (req, res, next) {
    res.render('article/release', {title: '发表博文'})
})

router.post('/release', function (req, res, next) {
    var form = new formidable.IncomingForm();
    let basepath = path.normalize(path.join(__dirname, '../public', 'article'))
    form.uploadDir = basepath
    form.keepExtensions = true
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.log(err)
            return
        }
        // console.log(fields)
        // console.log(files.articleFile.name)
        // console.log(files.coverPic.name)
        // console.log(files.articleFile.path.split('\\')[files.articleFile.path.split('\\').length-1])
        // console.log(files.coverPic.path)
        let fileName = files.articleFile.path.split('\\')[files.articleFile.path.split('\\').length - 1]
        let picName = files.coverPic.path.split('\\')[files.coverPic.path.split('\\').length - 1]

        mongoC.connect(dbUrl, (err, client) => {
            if (err) {
                console.log(err)
                client.close()
                return
            }
            let info = client.db('info')
            let article = info.collection('article')
            let t = new Date().toLocaleString()
            let tx = +new Date()
            article.insert({
                title: fields.title,
                about: fields.about,
                time: t,
                tx: tx,
                filePath: '/article/' + fileName,
                picPath: '/article/' + picName
            }, (err) => {
                if (err) {
                    return console.log(err)
                }
                res.redirect('/article')
            })
        })
    })
})


//渲染相册首页
router.get('/album/index', function (req, res, next) {
    read.walkDir(path.join(__dirname, '../public', 'photo'), (dirArr) => {
        res.render('album/index', {title: '相册', dirArr});
    })
})

//渲染相片页
router.get('/album/img/:name', function (req, res, next) {
    var dirName = req.params.name
    read.walkFile(path.join(__dirname, '../public', 'photo', dirName), (fileArr) => {
        res.render('album/photo', {title: '相片页', fileArr, dirName: dirName});
    })
});

//渲染留言页
router.get('/say', function (req, res, next) {
    mongoC.connect(dbUrl, (err, client) => {
        if (err) {
            console.log(err)
            client.close()
            return
        }
        let info = client.db('info') //数据库
        let comment = info.collection('comment')  //comment集合（有关评论）
        comment.count({}, (err, count) => {   //.count获取该集合总数据条数
            if (err) {
                return console.log(err)
            }
            res.render('say', {title: '留言', count: count});
        })
    })
});

//提交留言，重定向到say页面
router.post('/say', function (req, res) {
    if (req.body.msg) {
        mongoC.connect(dbUrl, (err, client) => {
            if (err) {
                console.log(err)
                client.close()
                return
            }
            let info = client.db('info')
            let comment = info.collection('comment')
            let t = new Date().toLocaleString()
            let tx = +new Date()
            comment.insert({
                msg: req.body.msg,
                name: req.session.user.name,
                time: t,
                tx: tx,
                headPic: req.session.user.headPic
            }, (err) => {
                if (err) {
                    return console.log(err)
                }
            })
        })
    }
    res.redirect('/say')
})

//ajax异步处理，服务端返回后台数据
router.get('/getallPost', function (req, res) {
    let page = req.query.page
    let limitNumber = req.query.limitNumber;
    mongoC.connect(dbUrl, (err, client) => {
        if (err) {
            console.log(err)
            client.close()
            return
        }
        let info = client.db('info')
        let comment = info.collection('comment')
        comment.find({}).limit(Number(limitNumber)).skip((page - 1) * limitNumber).sort({tx: -1}).toArray(function (err, docArr) {
            //查询数据  限制条件为 只读取（limitNumber）条数据 并跳过（page-1)*limitNumber 条数据
            if (err) {
                res.json({type: -1, msg: '数据查询失败', data: {}})
                client.close()
                return
            }
            // console.log(docArr)
            // console.log(count)
            res.json({type: 1, msg: '数据查询成功', data: {docArr}}) //返回数据到前端
        })
    })
})

module.exports = router;
