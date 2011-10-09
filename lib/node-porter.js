var client = require('request');;
var Futures = require('futures');

exports.Porter = function Porter(resources) {

    var self = this;
    var noop = function() {};
    var version = this.version = "0.0.1";

    function isJSON(str) {
        if (str.length == 0) return false;
        str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@');
        str = str.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
        str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
        return (/^[\],:{}\s]*$/).test(str);
    }

    this.options = {
          protocol: "http"
        , host: "localhost"
        , endpoint: ""
        , port: 80
        , headers: {
              'User-Agent': 'Node('+process.version+') Porter library '+ version
            , 'Accept': 'application/json'
            , 'Content-Type': 'application/json'
          }
    };

    this.headers = this.options.headers;

    this._listeners = {
        'default': noop
    };

    this.on = function(listeners) {
        for (var listener in listeners) {
            if (listeners.hasOwnProperty(listener)) {
                self._listeners[listener] = listeners[listener];
            }
        }
        return self;
    };

    this.use = function(options) {
        for (var option in options) {
            if (options.hasOwnProperty(option)) {
                self.options[option] = options[option];
            }
        }
        return self;
    };

    this.describe = function() {
      return JSON.stringify(resources);
    }; 
    this.request = function(conf) {

        var promise = Futures.future();
        var req = this;
        req._listeners = {};

        for (l in self._listeners) {
            if (self._listeners.hasOwnProperty(l)) {
                req._listeners[l] = self._listeners[l];
            }
        }

        // is callbacks actually plural? if so, merge.
        if (!(typeof conf.callbacks === 'function')) {
            for (c in conf.callbacks) {
                if (conf.callbacks.hasOwnProperty(c)) {
                    req._listeners[c] = conf.callbacks[c];
                }
            }
        } else {
            req._listeners['default'] = conf.callbacks;
        }

        var reqOptions = { 
          headers: self.headers
        , method: conf.method.toUpperCase()
        , uri: conf.url
        }

        if (conf.data) {
            try {

                // if there is data, and there is also an outgoing data validator,
                // verify that the value returned is true, otherwise provide the
                // returned value as the 'err' to the listener/callback.
                var validation = true,
                    validator;

                if ((conf.validators && conf.validators.outbound) || self.outbound) {
                    validator = conf.validators || self;
                    validation = validator.outbound(conf.data);
                    if (validation !== true) {
                        throw new Error(validation);
                    }
                }
                reqOptions.json = conf.data;

            } catch (ex) {
                self._listeners['default'](ex, null, null, null);
            }
        }

        client(reqOptions, function(err, response, data) {
            promise.fulfill(err, response, data); 
        });

        promise.whenever(function(err, response, data) {
          var status = response.statusCode,
              validator, validation = true;

          try {
              response = isJSON(data) ? JSON.parse(data) : data;
          } catch (ex) {
              req._listeners['default'](ex, null, null, null);
          }

          // if there is validation, and it returns anything other 
          // than true, it will be considered an error and that
          // value will be returned as the 'err' of the listener/callback.
          if ((conf.validators && conf.validators['inbound']) || self.inbound) {
              validator = conf.validators || self;
              validation = validator['inbound'](data);
          }

          if (req._listeners[status]) {
              req._listeners[status](validation ? null : validation, data, status);
          } else if (req._listeners['default']) {
              req._listeners['default'](validation ? null : validation, data, status);
          }  
        })

    };

    function normalizePath(path, keys) {
        // normalizePath by TJ Holowaychuk (https://github.com/visionmedia)
        path = path.concat('/?').replace(/\/\(/g, '(?:/').replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional) {
            keys.push(key);
            slash = slash || '';
            return [(optional ? '' : slash), '(?:', (optional ? slash : ''), (format || '') + (capture || '([^/]+?)') + ')', (optional || '')].join('');
        }).replace(/([\/.])/g, '\\$1').replace(/\*/g, '(.+)');
        return new RegExp('^' + path + '$', 'i');
    }

    function req(url, method, replace, data, callbacks, validators, resource) {

      var params = '',
          pcount = 0;

      if (method === 'get') {
          for (var d in data) {
              if (data.hasOwnProperty(d)) {
                  if (pcount === 0) {
                      params += '?';
                  }
                  params += encodeURIComponent(d) + "=" + encodeURIComponent(data[d]) + "&";
                  pcount++;
              }
          }
      }

      new self.request({
          url: [self.options.protocol, '://', self.options.ip || self.options.host, ':', self.options.port, self.options.endpoint, url, params].join(''),
          method: method,
          data: data,
          callbacks: callbacks || null,
          validators: validators ? validators.inbound : null
      })

    }

    function buildResources(resources, ns) {
        for (var resource in resources) {
            if (resources.hasOwnProperty(resource)) {

                if (Object.prototype.toString.call(resources[resource]) == "[object Array]") {

                    ns[resource] = (function(request) {

                        return function() {

                            var keys = [],
                                method = request[0],
                                url = request[1],
                                validators = request[2],
                                matcher = normalizePath(url, keys),

                                args = Array.prototype.slice.call(arguments),
                                alen = args.length,
                                klen = keys.length,
                                key = null;

                            url = url.replace(/{([^{}]*)}/g, function(a, b) {
                                var r = args[0][b];
                                return typeof r === 'string' || typeof r === 'number' ? escape(r) : a;
                            });

                            if (klen > 0) {

                                // If we have keys, then we need at least two arguments
                                // and first argument in a two-argument pair can be assumed
                                // to be the replacement map.
                                if (alen === 1) {
                                    args.splice(0, -1, null);
                                    args.splice(0, -1, null);
                                }

                                if (alen === 2) {
                                    args.splice(1, -1, null);
                                }

                                if (typeof args[0] === 'string') {
                                    if (klen > 1) {
                                        throw new Error('Wrong number of keys in replacement. Expected ' + klen + ' got 1.');
                                    }

                                    key = keys[0];
                                    url = url.replace(':' + key, args[0]);

                                } else {

                                    while (klen--) {
                                        key = keys[klen];
                                        var val = args && args[0] ? args[0][key] : '',
                                            replace = (val === '') ? new RegExp('/?:' + key) : ':' + key;
                                        url = url.replace(replace, encodeURI(val));

                                    }
                                }
                            } else {
                                // If we don't have keys, then we need at least one argument
                                // and the first argument in a two-argument pair can be assumed
                                // to be the data for the request.
                                if (alen < 1 || alen > 2) {
                                    throw new Error('Cannot execute request ' + request + ' with ' + alen + ' arguments.');
                                } else if (alen === 1) {
                                    args.splice(0, -1, null);
                                }

                                args.splice(0, -1, null);
                            }

                            args = [url, method].concat(args, validators, resource);

                            req.apply(null, args);
                        }
                    })(resources[resource]);

                } else {
                    if (!ns[resource]) {
                        ns[resource] = {};
                    }
                    buildResources(resources[resource], ns[resource]);
                }
            }
        }
    }

    buildResources(resources, self);

    return self;
}