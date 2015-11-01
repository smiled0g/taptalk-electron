var keys = {
  65: { key: 'A', index: 1},
  83: { key: 'S', index: 2},
  68: { key: 'D', index: 3},
  90: { key: 'Z', index: 4},
  88: { key: 'X', index: 5},
  67: { key: 'C', index: 6},
  32: { key: 'Spacebar', index: 7}
};

var currentKey = null;

var firstTime = true;

app.ui = {
  switchFriendOn: function(index) {
    $('.friend-item[key-index="'+index+'"]').addClass('active');
  },
  switchFriendOff: function(index) {
    $('.friend-item[key-index="'+index+'"]').removeClass('active');
  },
  setKeyListeners: function() {
    $(document).on("keydown", function (e) {
      var key = keys[e.which];
      var id = app.user.getKeyMap(key.index);
      if(id && app.session.allFriendsMap[id].online) {
        if(key && (key.index > 0) && !currentKey) {
          currentKey = key;
          app.ui.switchFriendOn(key.index);
          app.socket.call(
            app.user.getKeyMap(key.index)
          );
        }
      }
    });
    $(document).on("keyup", function (e) {
      var key = keys[e.which];
      if(key && (key.index > 0) && (!currentKey || currentKey.index == key.index)) {
        currentKey = null;
        app.ui.switchFriendOff(key.index);
        app.socket.hangup();
      }
    });
  },
  setFriendListDragListeners: function() {
    $('.sidebar .friend-status-group.callable .friend-item').draggable({
      helper: "clone"
    });
  },
  setFriendListDropListeners: function() {
    $('.main .friend-list .friend-item').droppable({
      hoverClass: "ui-state-hover",
      drop: function(event, ui) {
        var keyIndex = $(this).attr('key-index');
        var id = $(event.toElement).attr('call-id');
        app.ui.setKeyItemToFriend(keyIndex, id);
      }
    });
  },
  setKeyItemToFriend: function(keyIndex, id) {
    var $key = $('.friend-list .friend-item[key-index="'+keyIndex+'"]');
    app.user.setKeyMap(keyIndex, id);
    $key.find('.avatar').css({ backgroundImage: 'url("'+app.session.allFriendsMap[id].display_img+'")' });
    $key.find('.name').text(app.session.allFriendsMap[id].display_name);
    app.ui.updateKeyItemStatus();
  },
  showRegister: function() {
    $('.login-panel').addClass('register');
  },
  login: function() {
    var username = $('.login-panel [name="username"]').val().trim(),
        password = $('.login-panel [name="password"]').val().trim();
    app.user.login(username, password, function(){
      $(".welcome-message").html('Welcome back, '+app.session.user.display_name);
      app.ui.initApp();
    });
  },
  register: function() {
    var username = $('.login-panel [name="username"]').val().trim(),
        password = $('.login-panel [name="password"]').val().trim(),
        display_name = $('.login-panel [name="display-name"]').val().trim();
    app.user.register(username, password, display_name, function(){
      $(".welcome-message").html('Welcome, '+app.session.user.display_name);
      app.ui.initApp();
      window.location.hash = 'tutorial-1';
      app.tutorial.init();
    });
  },
  transitionLogo: function() {
    var logoOffset = $('.login-panel .logo').position();
    $('.login-panel').css({ paddingTop: 130 });
    $('.login-panel .logo').css({
      position: 'fixed',
      top: logoOffset.top,
      left: logoOffset.left+30
    }).appendTo('body');
    $('.logo').animate({
      top: 110,
      left: 40,
      width: 200
    }, 1000);
  },
  initApp: function() {
    app.ui.transitionLogo();
    app.ui.setKeyListeners();
    app.ui.setFriendListDropListeners();
    app.socket.init();
    app.socket.updateFriendsOnlineStatus();
    app.ui.initFriendSearch();
    $('body').attr('stage', 'app');
    $('.page-container.login-register').css({
      marginTop: -$(document).height()
    });
    setTimeout(function(){
      $('.page-container.login-register').hide();
    }, 2000);
    setTimeout(function(){
      $('.online-status').click();
    }, 1000);
  },
  updateKeyItemStatus: function() {
    $('.main .friend-item').each(function(i, item){
      $(item).removeClass('online').removeClass('offline')
      var keyIndex = $(item).attr('key-index');
      var id = app.user.getKeyMap(keyIndex);
      if(id) {
        if(app.session.allFriendsMap[id].online) {
          $(item).addClass('online');
        } else {
          $(item).addClass('offline');
        }
      }
    });
  },
  buildFriendList: function() {
    // app.session.friends should be available.
    var status = ["accepted", "pending", "requested"];
    var friendList = {};
    status.map(function(s){
      friendList[s] = app.session.allFriends.filter(function(f){
        return f.status === s;
      });
    });
    friendList["online"] = friendList["accepted"].filter(function(f){return f.online;});
    friendList["offline"] = friendList["accepted"].filter(function(f){return !f.online;});
    // Populate list
    // Online
    $('.friend-list.current-friends > ul.online').find('li').remove();
    friendList["online"].map(function(f) {
      $('<li class="friend-item" call-id="'+f.id+'">' +
          f.display_name +
        '</li>')
      .appendTo($('.friend-list.current-friends > ul.online'));
    });
    // Offline
    $('.friend-list.current-friends > ul.offline').find('li').remove();
    friendList["offline"].map(function(f) {
      $('<li class="friend-item" call-id="'+f.id+'">' +
          f.display_name +
        '</li>')
      .appendTo($('.friend-list.current-friends > ul.offline'));
    });
    // requested
    $('.friend-list.current-friends > ul.pending').find('li').remove();
    friendList["pending"].map(function(f) {
      $('<li class="friend-item">' +
          f.display_name +
        '</li>')
      .appendTo($('.friend-list.current-friends > ul.pending'));
    });
    // requested
    $('.friend-list.current-friends > ul.requested').find('li').remove();
    friendList["requested"].map(function(f) {
      $('<li class="friend-item">' +
          f.display_name +
          '<button class="decline-request minimal" onclick="app.user.declineFriendRequest('+f.id+')">' +
            '<i class="ion ion-android-close"></i>' +
          '</button>' +
          '<button class="accept-request minimal" onclick="app.user.acceptFriendRequest('+f.id+')">' +
            '<i class="ion ion-android-done"></i>' +
          '</button>' +
        '</li>')
      .appendTo($('.friend-list.current-friends > ul.requested'));
    });

    app.ui.setFriendListDragListeners();
    app.ui.updateKeyItemStatus();
  },
  initFriendSearch: function() {
    $('.search-container input').on('keydown', function(event) {
      event.stopPropagation();
    });
    $('.search-container input').on('keyup', function(event){
      event.stopPropagation();
      var keyword = $(this).val();
      if(keyword.length >= 3) {
        $.get(app.getUrl('/search'), { q: keyword }, function(res){
          app.ui.buildFriendSearchResults(res);
        })
      } else {
        $('.friend-list.search-results').hide();
        $('.friend-list.current-friends').show();
      }
    });
  },
  buildFriendSearchResults: function(results) {
    $('.friend-list.current-friends').hide();
    $('.friend-list.search-results').show().find('ul > li').remove();
    results.map(function(r){
      $('<li class="friend-item" user-id="'+r.id+'">' +
          r.display_name +
          '<button class="send-request minimal" onclick="app.user.sendFriendRequest('+r.id+');$(this).parent().remove()">' +
            '<i class="ion ion-ios-plus-empty"></i>' +
          '</button>' +
        '</li>')
        .appendTo($('.friend-list.search-results > ul'));
    });
  },
  updateOnlineStatus: function() {
    var status = $('.online-status input').is(':checked');
    app.socket.changeOnlineStatus(status);
  }
};
