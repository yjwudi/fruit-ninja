var http = require("http");
var fs = require('fs');
var url = require('url');
var libPath = require("path");
var funGetContentType=function(filePath){
    var contentType="";

    //使用路径解析模块获取文件扩展名
    var ext=libPath.extname(filePath);

    console.log(filePath);
    switch(ext){
        case ".html":
            contentType= "text/html";
            break;
        case ".js":
            contentType="text/javascript";
            break;
        case ".css":
            contentType="text/css";
            break;
        case ".gif":
            contentType="image/gif";
            break;
        case ".jpg":
            contentType="image/jpeg";
            break;
        case ".png":
            contentType="image/png";
            break;
        case ".ico":
            contentType="image/icon";
            break;
        default:
        contentType="application/octet-stream";
    }
    return contentType; //返回内容类型字符串
}
exports.start = function(){
    http.createServer(function(request, response) {
        var pathname = url.parse(request.url).pathname;
        console.log(pathname);
        var ext = pathname.match(/(\.[^.]+|)$/)[0];//取得后缀名
        console.log(ext);
        switch(ext){
        	case ".png":
            case ".css":
            case ".js":
            	var fname = require('path').join(__dirname, "."+request.url);
            	console.log(fname);
                fs.readFile(fname/*"."+request.url*/, 'utf-8',function (err, data) {//读取内容
                    if (err) throw err;
                    response.writeHead(200, {"Content-Type": funGetContentType("."+request.url)});
                    response.write(data);
                    response.end();
                });
                break;
            default:
                fs.readFile('./index.html', 'utf-8',function (err, data) {//读取内容
                    if (err) throw err;
                    response.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                    response.write(data);
                    response.end();
                });
 
        }
 
    }).listen(8888);
    console.log("server start...");
}