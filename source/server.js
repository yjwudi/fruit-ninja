var express = require('express');
var bodyParser = require('body-parser');
var fs=require("fs");
var app = express();

//通过express.static访问静态文件，这里访问的是ajax.html
app.use(express.static("./"));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

//路由获取post方式传递的数据
app.post("/ajaxjs.js", function(request, response){
  var str = request.body;
  //var arr = str.split(",");
  console.log(str.length);
  console.log(str);      // this a json object
  //response.send(str);    // echo the result back
  //var test = '557 600 451 600 551 600 487 600 334 600 270 600 240 600 134 600';
  var arr = str[0].toString();
  for(var i = 1; i < str.length; i++)
  {
    arr = arr + ' ' + str[i].toString();
  }
  console.log(arr.length);
  console.log(arr);
  /*
  const execFile = require('child_process').execFile;
  const child = execFile('.\\Exec\\DoubleWedgeIntersaction-argc.exe',[arr], (error, stdout, stderr) =>{
    if(error){
      throw error;
    }
    console.log(stdout);
    response.send(stdout);
  });
  */
  response.send("hello");
  
});

app.listen(3000, function() {   //监听http://127.0.0.1:3000端口
    console.log("server start");
});