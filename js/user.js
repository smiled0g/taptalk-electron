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
        app.user.getFriends(callback);
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
  getFriends: function(callback) {
    $.get(app.getUrl('/friends'), {}, function(res){
      app.session.friends = res;
      callback(res);
    });
  },
  sendFriendRequest: function(id) {
    
  }
}
