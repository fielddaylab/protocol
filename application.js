var app  = require('express')();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var path = require('path');

var Player = function(name)
{
	this.color_value = "white";
	this.name = name;
	// tone value
	// History log here
}

var players = {};


app.get('/', function(request, response)
{
	response.sendFile(__dirname + '/public/index.html');
});


io.on('connection', function(socket)
{
	players[socket.id] = new Player(socket.id);

	// Send all current state

	socket.on('disconnect', function()
	{
		delete players[socket.id];
	});


	socket.on('player message', function(message)
	{
		io.emit('broadcast player message', players[socket.id].name, message);
	});
});


http.listen(3000, function()
{
	console.log('listening on *:3000');
});
