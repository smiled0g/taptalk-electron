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
      app.session.peerId = id;

      socket.emit('register', {
        token: app.session.user.token,
        peer: id,
      });
      socket.on('ready', function() {
        console.log('ready naka');
      });
      socket.on('status', function(data) {
        console.log('get a status');
        console.log(data);
      });
      socket.on('query', function(data) {
        console.log('get a query result');
        console.log(data);
      });
      socket.on('disconnect', function() {
        console.log('disconnect naka');
      });
    });

    peer.on('call', function(call) {
      // Receive a call.

      // Mute my microphone.
      stream.getAudioTracks()[0].enabled = false;
      call.answer(stream);

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

    if (false && stream !== null) {
      // Make a call to some peer ID!
      // Please some how make sure that I'm not calling someone else nor listening to someone.
      peer.call('peer-id', app.session.stream);
    }
  },
  fetchOnlineStatus: function() {
    app.session.socket.emit('query');
  }




}
