//找出文件
var path = require('path')
var fs = require('fs')

//读取某个文件夹中的文件
var walkFile = function(paths,callback){
    let fileArr=[];
    fs.readdirSync(paths).forEach((file)=>{
        status=fs.statSync(path.join(paths,file));
        if(status.isFile()){
            fileArr.push(file)
        }
    })
    callback(fileArr)
}

//读取文件夹
var walkDir = function(paths,callback){
    let dirArr=[];
    fs.readdirSync(paths).forEach((file)=>{
        status=fs.statSync(path.join(paths,file));
        if(status.isDirectory()){
            dirArr.push(file)
        }
    })
    callback(dirArr)
}

//将walkFile和walkDir方法挂载
exports.walkFile=walkFile;
exports.walkDir=walkDir;