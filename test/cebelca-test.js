var   vows = require('vows')
    , assert = require('assert')
    , cbzapi = require('../lib/cebelcabiz-api.js')
    , http = require('http');

//Test server

http.createServer(function (req, res) {
  if (req.method == "POST") {
    req.on("data",function(data) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end(req.method+": "+req.url + " > "+ data);
    })
  }else{
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(req.method+": "+req.url);
  }

}).listen(13379, "127.0.0.1");

// Create a Test Suite
vows.describe('cebelcabiz-cli api library')
.addBatch({
  'Cebelca API': {
    topic: cbzapi("123456789abcdef", "user", "password"),
    'has function use': function (topic) {
      assert.isFunction(topic.use);
    },
    'has function on': function (topic) {
      assert.isFunction(topic.on);
    },
    'has function describe': function (topic) {
      assert.isFunction(topic.describe);
    },
  }
})
.export(module);


cbzapi("123456789abcdef", "user", "password").describe()