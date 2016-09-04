var express = require('express');
var router = express.Router();
var User = require('../controls/user')
var Message = require('../models/message')
var socket_io = require('socket.io');

router.get('/', User.signinRequired, User.index);
router.get('/msg', function(req,res){
    var _message = {}
    _message.from = req.query.from
    _message.to = req.query.to
    _message.msg = req.query.msg
    _message.mapuser = _message.from + '-' + _message.to
    var message = new Message(_message)
    message.save(function(err,message){
        if(err){
          console.log(err)
        }
        res.json({success:1})
    })
});
router.get('/content', function(req,res){
    var from = req.query.from
    var to = req.query.to
    Message.find({$or:[{from:from,to:to},{from:to,to:from}]},function(err,messages){
        if(err){
          console.log(err)
        }
        res.json({success:1,messages:messages})
    })
});
router.get('/user/signin', User.showsignin);
router.get('/user/signup', User.showsignup);
router.get('/user/list', User.list);
router.get('/loginout', User.loginout);
router.post('/signin', User.signin);
router.post('/signup', User.signup);

router.prepareSocketIO = function (server) {
    var io = socket_io.listen(server);
    io.sockets.on('connection',function(socket){
        socket.on('online',function(data){
            var data = JSON.parse(data);
            io.emit('system',JSON.stringify({type:'online',msg:data.user,time:(new Date()).getTime()}));
            io.emit('userflush',JSON.stringify({type:'online',user:data.user}));
        });
        socket.on('offline',function(data){
            var data = JSON.parse(data);
            io.emit('system',JSON.stringify({type:'offline',msg:data.user,time:(new Date()).getTime()}));
            io.emit('userflush',JSON.stringify({type:'offline',user:data.user}));
        });
        // 处理所有的聊天信息,所传递的参数包括: from(发送者), to(接收者), msg(聊天信息)
        socket.on('chat message', function(from, to, msg) {
            var time = Date.now();
            // 将信息发送给to(接收者)
            io.emit(to + '_message', from, msg, time);
        });
    });
};

module.exports = router;
