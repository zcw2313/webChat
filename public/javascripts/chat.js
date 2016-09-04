$(document).ready(function(e) {
	$(window).keydown(function(e){
		if(e.keyCode == 116)
		{
			if(!confirm("刷新会将所有数据情况，确定要刷新么？"))
			{
				e.preventDefault();
			}
		}
	});
	var from = $('#user_label').attr('name');
	$("#input_content").html("");
	if (/Firefox\/\s/.test(navigator.userAgent)){
	    var socket = io.connect({transports:['xhr-polling']}); 
	} 
	else if (/MSIE (\d+.\d+);/.test(navigator.userAgent)){
	    var socket = io.connect({transports:['jsonp-polling']}); 
	} 
	else { 
	    var socket = io.connect(); 
	}
    socket.emit('online',JSON.stringify({user:from}));
	// 点击用户进行聊天
	$('#list li').on('click', function() {
        $(this).siblings().removeClass('chat');
        $(this).addClass('chat');
        var to = $(this).attr('to');
        $.ajax({
            type:'GET',
            url:'/content',
            data: {from:from,to:to}
        })
        .done(function(res){
          if(res.success === 1){
            $('#contents').html('');
            console.log(res.messages)
            for(var i = 0; i < res.messages.length; i++){
                var message = res.messages[i];
                var msg = message.from + " " + new Date(message.time).toLocaleString() + "<br/>" + message.msg + "<br/>";
                updateMsgForm(msg);
            }
          }
        })
		$('#toolbar').html(from + '和' + to + '的聊天');
		$('#toolbar').attr('from', from);
		$('#toolbar').attr('to', to);
	});

    $('#loginout').on('click',function(){
        socket.emit('offline',JSON.stringify({user:from}));
    })

	// 更新对话框
  function updateMsgForm(message) {
    var chatmessages = $('#contents').html();
    chatmessages += message;
    $('#contents').html(chatmessages);
  }

  // 发送信息
  $('#say').on('click', function() {
    var to = $('#toolbar').attr('to');
    var msg = $('#input_content').text();
    if (from && to && msg) {
        $.ajax({
            type:'GET',
            url:'/msg',
            data: {from:from,to:to,msg:msg}
        })
        .done(function(res){
          if(res.success === 1){
            socket.emit('chat message', from, to, msg);
            var message = from + " " + new Date().toLocaleString() + "<br/>" + msg + "<br/>";
            updateMsgForm(message);
            $('#input_content').text('');
          }
        })
    }
  });

   // 接收信息
  socket.on(from + '_message', function(from, msg, time) {
    var ele = $('#list li[to="'+from+'"]');
    if(!ele.hasClass('chat')){
        ele.trigger("click")
    }
    var message = from + "  " + new Date(time).toLocaleString() + "<br/>" + msg + '<br/>';
    updateMsgForm(message);
  });

  socket.on('system',function(data){
        var data = JSON.parse(data);
        var time = getTimeShow(data.time);
        var msg = '';
        if(data.type =='online')
        {
            msg += '用户 ' + data.msg +' 上线了！';
        } else if(data.type =='offline')
        {
            msg += '用户 ' + data.msg +' 下线了！';
        } else if(data.type == 'in')
        {
            msg += '你进入了聊天室！';
        } else
        {
            msg += '未知系统消息！';
        }
        var msg = '<div style="color:#f00">SYSTEM('+time+'):'+msg+'</div>';
        updateMsgForm(msg);
        play_ring("/ring/online.wav");
    });

    socket.on('userflush',function(data){
        var data = JSON.parse(data);
        var name = data.user;
        if(data.type =='online'){
            $('#list li').each(function(index,item){
                if($(item).attr('to') == name){
                    $(item).addClass('online');
                }
            })
        }else{
            $('#list li').each(function(index,item){
                if($(item).attr('to') == name){
                    $(item).removeClass('online');
                }
            })
        }
    });

    function play_ring(url){
		var embed = '<audio id="ringE" src="'+url+'" autoplay="true" hidden="true" style="height:0px; width:0px;0px;"></audio>';
		$("#ring").html(embed);
	}

    function getTimeShow(time)
    {
        var dt = new Date(time);
        time = dt.getFullYear() + '-' + (dt.getMonth()+1) + '-' + dt.getDate() + ' '+dt.getHours() + ':' + (dt.getMinutes()<10?('0'+ dt.getMinutes()):dt.getMinutes()) + ":" + (dt.getSeconds()<10 ? ('0' + dt.getSeconds()) : dt.getSeconds());
        return time;
    }
});
