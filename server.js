var express = require('express');
var app = express();
//app.use(express.directory(__dirname + '/public'))
app.use(express.static(__dirname + '/public'));

var io = require('socket.io').listen(app.listen(8080));
console.log('Listening on port 8080');
var log = [];
io.sockets.on('connection', function (socket) {
    socket.emit('message', { message: 'welcome to the chat' });
    socket.emit('log', { message: log.slice(-10) });
    socket.on('send', function (data) {

    	for(var i=0; i<log.length; i++){
    		if(log[i].message === data.message){
    			return;
    		}
    	}

    	log.push(data);
        io.sockets.emit('message', data);
    });
});