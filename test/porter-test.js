var   vows = require('vows')
    , assert = require('assert')
    , Porter = require('../lib/node-porter.js').Porter
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

}).listen(13378, "127.0.0.1");

// Create a Test Suite
vows.describe('Porter Node.js library')
.addBatch({
  'Porter library': {
    topic: new(Porter),

    'is callable': function (topic) {
      assert.instanceOf(topic, Porter);
    },
    'has function use': function (topic) {
      assert.isFunction(topic.use);
    },
    'has function on': function (topic) {
      assert.isFunction(topic.on);
    },
    'has function request': function (topic) {
      assert.isFunction(topic.request);
    },
    "doesn't have function isJSON": function (topic) {
      assert.isUndefined(topic.isJSON);
    },
    "contains default options": function (topic) {
      assert.isObject(topic.options);
    },
    "contains default headers": function (topic) {
      assert.isObject(topic.options.headers);
    },
    "endpoint is empty": function (topic) {
      assert.isEmpty(topic.options.endpoint);
    },
  }
})
.addBatch({
  'Porter instance ': {
    topic: new Porter({
      'groupA': {
        'resourceA': ['get', '/test1/:name'],
      },
      'groupB': {
        'resourceA': ['post', '/test2/:book'],
        'resourceB': ['get', '/test2/:id']
      }
    }).use({host:"localhost", port: 13378}),

    "call to groupB.resourceB GET with custom parameter": {
       topic: function (porter) {
         porter.groupB.resourceB({"id":1988},this.callback);
       },
       'result is "requested URL /test2/1988"': function (req) {
           assert.include (req, "GET: /test2/1988");
       }
     },
    "call to groupA.resourceA GET with custom parameter": {
       topic: function (porter) {
         porter.groupA.resourceA({"name":"hi"},this.callback);
       },
       'result is "requested URL /test1/hi"': function (req) {
           assert.include (req, "GET: /test1/hi");
       }
     },
    "call to groupB.resourceA POST with custom parameter and payload": {
       topic: function (porter) {
         porter.groupB.resourceA({"book":"some"},{"test":"test"},this.callback);
       },
       'result is "requested URL /test2/some with custom payload"': function (req) {
           assert.include (req, 'POST: /test2/some > {"test":"test"}');
       }
     },
     "call to groupB.resourceB GET with custom parameter (second time)": {
        topic: function (porter) {
          porter.groupB.resourceB({"id":"some' fancy title @ :)"},this.callback);
        },
        'result is "requested URL /test2/some\' fancy title @ :)"': function (req) {
            assert.include (req, "GET: /test2/some%27%20fancy%20title%20@%20:)");
        }
      }
  }
}).export(module);