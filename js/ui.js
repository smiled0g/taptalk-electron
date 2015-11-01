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

  }
};
