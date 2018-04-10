// Copyright 2018 Kinvey, Inc
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

'use strict';

var StackDriver = require('./StackDriver');
var prometheusGateway = require('prom-pushgateway');
try {
    // the Prometheus backend optionally includes prom-client default stats
    var promClient = require('prom-client');
    promClient.collectDefaultMetrics();
} catch (err) { }

// use prom-pushgateway to create a prometheus scrapable endpoint
// that re-exports the pushed legacy stackdriver metrics
module.exports.connect = function prometheusConnect( emitter, userConfig ) {
  var config = {};
  for (var k in userConfig) config[k] = userConfig[k];

  config.apiKey = 'not empty but not needed';

  // provide stackdriver config settings
  config.stackDriverPort = userConfig.port || 9091;
  config.stackDriverHost = userConfig.host || 'localhost';
  config.stackDriverPath = userConfig.path || '/push/stackdriver';
  config.statsMap = userConfig.statsMap || {};

  var backend = config.stackDriverBackend || StackDriver.connect(emitter, config);

  // allow 5 seconds for the prom gateway to start, else emit error
  config.listenTimeout = 5;

  // include prom-client default metrics if available
  if (promClient) config.readPromMetrics = function() { return promClient.register.metrics() };

  // cater to Prometheus limitations
  config.port = userConfig.port || 9091;
  config.maxMetricAgeMs = 60000;        // only report fresh metrics
  config.omitTimestamps = true;         // let prometheus attach its own metric-collected-at timestamps
  config.anyPort = true;                // if config.port is not available, listen on some other port

  if (userConfig.sameProcess) {
    backend._gateway = prometheusGateway.createServer(config, function(err, info) {
      if (err) return emitter.emit('error', err);
      backend.stackDriverPort = info.port;
    })
    backend.close = function close(cb) { backend._gateway.close(cb) }
  }
  else {
    backend._gateway = prometheusGateway.forkServer(config, function(err, info) {
      if (err) return emitter.emit('error', err);
      backend.stackDriverPort = info.port;
    })
    backend.close = function close(cb) { backend._gateway.pid && process.kill(backend._gateway.pid) }
  }

  return backend;
}
