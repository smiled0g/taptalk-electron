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
    $('.friend-item[call-index="'+index+'"]').addClass('active');
    app.friends.call();
  },
  switchFriendOff: function(index) {
    $('.friend-item[call-index="'+index+'"]').removeClass('active');
    app.friends.hangup();
  },
  setKeyListeners: function() {
    $(document).on("keydown", function (e) {
      var key = keys[e.which];
      if(key && (key.index > 0) && !currentKey) {
        currentKey = key;
        app.ui.switchFriendOn(key.index);
      }
    });
    $(document).on("keyup", function (e) {
      var key = keys[e.which];
      if(key && (key.index > 0) && (!currentKey || currentKey.index == key.index)) {
        currentKey = null;
        app.ui.switchFriendOff(key.index);
      }
    });
  },
  setFriendListDragListeners: function() {
    $('.sidebar .friend-status-group.callable .friend-item').draggable({
      helper: "clone"
    });
    $('.main .friend-list .friend-item').droppable({
      hoverClass: "ui-state-hover",
      drop: function(event, ui) {
        var dropIndex = $(this).attr('call-index');
        var id = $(event.toElement).attr('call-id');
        console.log(dropIndex, id);
      }
    });

  },
  showRegister: function() {
    $('.login-panel').addClass('register');
  },
  login: function() {
    var username = $('.login-panel [name="username"]').val().trim(),
        password = $('.login-panel [name="password"]').val().trim();
    app.user.login(username, password, function(){
      app.ui.initApp();
    });
  },
  register: function() {
    var username = $('.login-panel [name="username"]').val().trim(),
        password = $('.login-panel [name="password"]').val().trim(),
        display_name = $('.login-panel [name="display-name"]').val().trim();
    app.user.register(username, password, display_name, function(){
      app.ui.initApp();
    });
  },
  initApp: function() {
    app.ui.setKeyListeners();
    app.ui.setFriendListDragListeners();
    app.socket.init();
    app.ui.buildFriendList();
    app.ui.initFriendSearch();
    $('body').attr('stage', 'app');
    $('.page-container.login-register').css({
      marginTop: -$(document).height()
    });
    setTimeout(function(){
      $('.page-container.login-register').hide();
    }, 2000);
    if(firstTime) {
      window.location.hash = 'tutorial-1';
      app.tutorial.init();
      //app.tutorial.startTour();
    }
  },
  buildFriendList: function() {
    // app.session.friends should be available.
    //
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
};
