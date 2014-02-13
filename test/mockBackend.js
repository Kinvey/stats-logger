// Copyright 2014 Kinvey, Inc
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

"use strict";

var MockBackend;

exports.connect = function(emitter, config) {

  var mockBackend;

  MockBackend = function(emitter, config) {
    if (!config || !emitter) {
      process.emit('error', "Emitter and config are required for the file backend");
      return;
    }

    this.emitter = emitter;
    this.config = config;

    emitter.on('flush', flush);
  };

  var flush = function(stats) {
    mockBackend.processStats(stats);
  };

  MockBackend.prototype.processStats = function(stats) {
    var output;

    output = "";
    for (var stat in stats) {
      if (output !== "") {
        output += ' ';
      }
      if (stats.hasOwnProperty(stat)) {
        output += stats[stat];
      }
    }

    emitter.emit('flushProcessed', output);

  };

  MockBackend.prototype.end = function() {
    return null;
  };

  mockBackend = new MockBackend(emitter, config);

  return mockBackend;
};