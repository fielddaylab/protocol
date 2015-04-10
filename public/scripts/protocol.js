var protocol_begin = function()
{
	/* IOS fixes for touch */
	document.addEventListener("touchstart", function() {},false);


	var socket = io();
	var my_player_id = null;


	/* Protocol Keying */

	var player_packet  = {bits:[]};
	var transmit_timer = null;
	var high_color = "#2980b9";
	var low_color  = "transparent";

	var click_start = ((document.ontouchstart !== null) ? 'mousedown': 'touchstart');
	var click_end   = ((document.ontouchend   !== null) ? 'mouseup'  : 'touchend'  );

	$('#key').on(click_start, function()
	{
		$('#tone').get(0).play();

		if(!player_packet.start)
		{
			player_packet.start = Date.now();
		}

		// Check for Off bit
		var packet_bit = player_packet.bits[player_packet.bits.length - 1];
		if(packet_bit)
		{
			packet_bit.end  = Date.now() - player_packet.start;
			packet_bit.time = packet_bit.end - packet_bit.start;
		}

		player_packet.bits.push({state: high_color, start: Date.now() - player_packet.start});
	});

	$('#key').on(click_end, function()
	{
		$('#tone').get(0).pause();
		var packet_bit = player_packet.bits[player_packet.bits.length - 1];

		packet_bit.end  = Date.now() - player_packet.start;
		packet_bit.time = packet_bit.end - packet_bit.start;

		// Off bit
		player_packet.bits.push({state: low_color, start: Date.now() - player_packet.start});

		packet_queue();
	});

	var packet_queue = function()
	{
		clearTimeout(transmit_timer);
		transmit_timer = setTimeout(packet_send, 3000);
	};

	var packet_send = function()
	{
		// Clear trailing off bit
		var last_bit = player_packet.bits[player_packet.bits.length - 1];
		if(!last_bit.end)
		{
			player_packet.bits.pop();
		}

		player_packet.end = Date.now()
		player_packet.time = player_packet.end - player_packet.start;

		socket.emit('player transmit packet', player_packet);
		player_packet = {bits:[]};
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

	socket.on('broadcast player packet', function(player, packet)
	{
		var player_element = "#"+player;
		var player_image = "http://www.gravatar.com/avatar/"+md5(player)+"?d=retro&f=y&s=64";
		var player_html  = "<div class='box'><img src='"+player_image+"'></div> ";

		for(var bit in packet.bits)
		{
			var width = "25px";
			var color = packet.bits[bit].state;
			player_html+= "<div class='bit' style='width:"+width+"; background-color:"+color+"'>"+packet.bits[bit].time+"</div>"
		}

		    player_html += "<div class='clear'></div>";
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
