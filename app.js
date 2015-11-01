var app = {
  user: {},
  ui: {},
  socket: {},
  session: {
    speaking: {}
  },
  getUrl: function(path) {
    return 'https://joyyak.com' + path;
  }
}
window.app = app;
