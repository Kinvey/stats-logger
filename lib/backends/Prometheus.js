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
var gateway = null;

// use prom-pushgateway in stackdriver mode
module.exports.connect = function prometheusConnect( emitter, userConfig ) {
  var config = {};
  for (var k in userConfig) config[k] = userConfig[k];

  config.apiKey = 'not empty but not needed';

  // provide stackdriver config settings
  config.stackDriverPort = userConfig.port || 9091;
  config.stackDriverHost = userConfig.host || 'localhost';
  config.stackDriverPath = userConfig.path || '/push/stackdriver';

  var backend = config.stackDriverBackend || StackDriver.connect(emitter, config);

  config.listenTimeout = 30;

  if (!gateway) {
    var createServerCall = (userConfig.sameProcess === undefined || userConfig.sameProcess) ? 'createServer' : 'forkServer';
    gateway = prometheusGateway[createServerCall](config, function(err, info) {
      if (err) throw err;
    })
  }

  return backend;
}
