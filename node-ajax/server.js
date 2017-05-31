var http=require("http");
var server=http.createServer(function(req,res){
    if(req.url!=="/favicon.ico"){
        res.writeHead(200,{"Content-Type":"text/plain","Access-Control-Allow-Origin":"http://localhost"});
        res.write("你好啊!");
        /*
        var arr = new Array(3);
        arr[0] = 2.2;
        arr[1] = 0;
        arr[2] = 10;
        res.write(arr);
        */
    }
    res.end();
});
server.listen(1337,"localhost",function(){
    console.log("开始监听...");
});