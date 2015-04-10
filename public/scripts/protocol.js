var protocol_begin = function()
{
	/* IOS fixes for touch */
	document.addEventListener("touchstart", function() {},false);


	var socket = io();
	var my_player_id = null;


	/* Protocol Keying */

	var player_packet  = [];
	var transmit_timer = null;

	var click_start = ((document.ontouchstart !== null) ? 'mousedown': 'touchstart');
	var click_end   = ((document.ontouchend   !== null) ? 'mouseup'  : 'touchend'  );

	$('#key').on(click_start, function()
	{
		$('#tone').get(0).play();
		player_packet.push({start: Date.now()});
	});

	$('#key').on(click_end, function()
	{
		$('#tone').get(0).pause();
		var packet_bit = player_packet[player_packet.length - 1];
		packet_bit.end = Date.now();
		packet_queue();
	});

	var packet_queue = function()
	{
		clearTimeout(transmit_timer);
		transmit_timer = setTimeout(packet_send, 3000);
	};

	var packet_send = function()
	{
		socket.emit('player message', player_packet);
		player_packet = [];
	};



	/* Communication */

	socket.on('disconnect', function()
	{
		$('#messages').html('');
	});

	socket.on('connect', function()
	{
		my_player_id = socket.id;
	});

	socket.on('player remove', function(player)
	{
		var player_element = "#"+player;
		$(player_element).remove();
	});

	socket.on('broadcast player message', function(player, message)
	{
		var player_element = "#"+player;
		var player_image = "http://www.gravatar.com/avatar/"+md5(player)+"?d=retro&f=y&s=64";
		var player_html  = "<div class='box'><img src='"+player_image+"'></div> "+message.length+"<div class='clear'></div>";
			//+"<div class='box' style='background-color:"+message+";'>&nbsp;

		if($(player_element).length > 0)
		{
			$(player_element).html(player_html);
		}
		else
		{
			$('#messages').append($('<li id='+player+'>').html(player_html));
		}
	});
};
