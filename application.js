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

	// Send all current state to new player.
	for(var player_id in players)
	{
		var player = players[player_id];
		socket.emit('broadcast player message', player.name, player.color_value);
	}

	// send new player to all others
	socket.broadcast.emit('broadcast player message', players[socket.id].name, players[socket.id].color_value);


	socket.on('disconnect', function()
	{
		io.emit('player remove', players[socket.id].name);
		delete players[socket.id];
	});


	socket.on('player message', function(message)
	{
		players[socket.id].color_value = message;

		io.emit('broadcast player message', players[socket.id].name, message);
	});
});


http.listen(3000, function()
{
	console.log('listening on *:3000');
});
