var options = {
  host: 'joyyak.com',
  port: '443',
  path: '/peerjs',
  secure: true,
};

app.socket = {
  init: function() {
    var peer = app.session.peer = new Peer(options);
    var socket = app.session.socket = io.connect(app.getUrl(''));

    app.session.stream = null;

    peer.on('open', function(id) {
      // Open connection to peer server. Report your ID to TapTalk please!
      console.log('My peer ID is: ' + id);
      app.session.user.peer = id;

      socket.emit('register', {
        token: app.session.user.token,
        peer: id,
      });
      socket.on('ready', function() {
        console.log('ready naka');
        $('.online-status input').prop('checked', true);
        app.ui.updateOnlineStatus();
        app.socket.updateFriendsOnlineStatus();
      });
      socket.on('status', function(data) {
        // console.log('get a status');
        // console.log(data);
        $.extend(true, app.session.allFriendsMap[data.id], data);
        app.socket.updateFriendsOnlineStatus();
      });
      socket.on('refresh', function() {
        app.user.getAllFriends(function(){
          app.session.socket.emit('query');
        });
      });
      socket.on('query', function(data) {
        // console.log('get a query result');
        // console.log(data);
        // Update online status
        data.result.map(function(s){
          app.session.allFriendsMap[s.id].peer = s.peer;
          app.session.allFriendsMap[s.id].online = true;
        });
        app.ui.buildFriendList();
      });
      socket.on('disconnect', function() {
        console.log('disconnect naka');
      });
    });

    peer.on('call', function(call) {
      // Receive a call.

      // Mute my microphone.
      app.session.stream.getAudioTracks()[0].enabled = false;
      call.answer(app.session.stream);

      call.on('stream', function(_stream) {
        // Append the other end's stream to autoplay.
        var audio = $('<audio autoplay />').appendTo('body');
        audio[0].src = (URL || webkitURL || mozURL).createObjectURL(_stream);
      });

      call.on('close', function() {
        // Unmute my microphone.
        stream.getAudioTracks()[0].enabled = true;
        console.log('Closed!');
      });

      call.on('error', function() {
        console.log('An error occured!');
      });

      if (false) {
        // End the call.
        call.close();
      }
    });

    navigator.webkitGetUserMedia (
      {video: false, audio: true},
      function success(stream) {
        app.session.stream = stream;
      },
      function error(err) {
        console.log('Permission denied :(');
      }
    );
  },

  updateFriendsOnlineStatus: function() {
    app.user.getAllFriends(function(){
      app.session.socket.emit('query');
    });
  },

  changeOnlineStatus: function(online) {
    console.log('emit status = '+online);
    app.session.socket.emit('status', {
      online: !!online,
      peer: app.session.user.peer
    });
  },

  call: function(id) {
    app.session.call = app.session.peer.call(app.session.allFriendsMap[id].peer, app.session.stream);
  },

  hangup: function() {
    app.session.call.close();
  }

}
