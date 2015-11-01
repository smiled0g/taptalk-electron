app.user = {
  register: function(username, password, display_name, callback) {
    $.postJson(
      app.getUrl('/register'),
      {
        username: username,
        password: password,
        display_name: display_name
      },
      function(res) {
        app.session.user = res;
        app.session.friends = [];
        callback();
      },
      function(err) {
        console.log(err);
      }
    );
  },
  login: function(username, password, callback) {
    $.postJson(
      app.getUrl('/login'),
      {
        username: username,
        password: password
      },
      function(res) {
        app.session.user = res;
        app.user.getAllFriends(callback);
      },
      function(err) {
        console.log(err);
      }
    );
  },
  logout: function() {
    $.get(app.getUrl('/logout'));
  },
  status: function() {
    $.get(app.getUrl('/status'), {}, function(res){
      console.log(res);
    });
  },
  online: function() {

  },
  offline: function() {

  },
  getAllFriends: function(callback) {
    app.user.getFriends(function(){
      app.user.getPendingFriends(function(){
        app.session.allFriends = app.session.friends.concat(app.session.pendingFriends);
        // Generate all friends map
        app.session.allFriendsMap = {};
        app.session.allFriends.map(function(f){
          app.session.allFriendsMap[f.id] = f;
        });
        callback(app.session.allFriends);
      });
    });
  },
  getFriends: function(callback) {
    // Get accepted + ongoing (requested) friends
    $.get(app.getUrl('/friends'), {}, function(res){
      app.session.friends = res;
      callback(res);
    });
  },
  getPendingFriends: function(callback) {
    $.get(app.getUrl('/friends/pending'), {}, function(res){
      app.session.pendingFriends = res;
      callback(res);
    });
  },
  sendFriendRequest: function(id) {
    $.postJson(app.getUrl('/friends/request'), { target: id }, function(res){
      app.socket.updateFriendsOnlineStatus();
    });
  },
  acceptFriendRequest: function(id) {
    app.user.sendFriendRequest(id)
  },
  declineFriendRequest: function(id) {

  },
  setKeyMap: function(keyIndex, id) {
    app.user.keyMap = app.user.keyMap || {};
    app.user.keyMap[keyIndex] = id;
  },
  getKeyMap: function(keyIndex) {
    return app.user.keyMap && app.user.keyMap[keyIndex];
  }
}
