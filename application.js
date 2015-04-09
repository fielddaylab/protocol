var app  = require('express')();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var path = require('path');

app.get('/', function(request, response)
{
	response.sendFile(__dirname + '/public/index.html');
});


io.on('connection', function(socket)
{
	console.log('a user connected');

	socket.on('disconnect', function()
	{
		console.log('user disconnected');
	});


	socket.on('chat message', function(message)
	{
		console.log('message: ' + message);

		io.emit('chat message', message);
	});
});


http.listen(3000, function()
{
	console.log('listening on *:3000');
});
