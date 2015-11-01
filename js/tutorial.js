// Instance the tour

var steps =  [
  {
    element: "#tutorial-1",
    title: "Find and add your friends to the club!"
  },
  {
    element: "#tutorial-2",
    title: "Drag your friends here, and then press button to talk!"
  }
]

var current = -1;

app.tutorial = {
  init: function() {
    // Initialize the tour
    $(window).on('hashchange', function() {
      console.log('change!');
      current++;
      if(current >= steps.length) {
        window.firstTime = false;
        app.tutorial.finish();
        return;
      }
      $('.tutorial-title').html(steps[current].title);
      $('.tutorial-number').html(current+1);
      if(current == steps.length - 1) {
        $('.nextbtn').html('Finish');
      }
    });
    // Show overlay
    $('.tutorial-container').fadeIn();
  },

  finish: function() {
    $('.tutorial-container').remove();
  }
}
