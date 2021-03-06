var express = require('express');
var app  = express();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var path = require('path');

var Player = function(name)
{
	this.color_value = {bits:[]};
	this.name = name;
	// tone value
	// History log here
}

var players = {};

app.use("/scripts", express.static(__dirname + '/public/scripts'));
app.use("/styles",  express.static(__dirname + '/public/styles'));
app.use("/static",  express.static(__dirname + '/public/static'));

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
		socket.emit('broadcast player packet', player.name, player.color_value);
	}

	// send new player to all others
	socket.broadcast.emit('broadcast player packet', players[socket.id].name, players[socket.id].color_value);


	socket.on('disconnect', function()
	{
		io.emit('player remove', players[socket.id].name);
		delete players[socket.id];
	});


	socket.on('player transmit packet', function(packet)
	{
		players[socket.id].color_value = packet;

		io.emit('broadcast player packet', players[socket.id].name, packet);
	});
});


http.listen(3000, function()
{
	console.log('listening on *:3000');
});
