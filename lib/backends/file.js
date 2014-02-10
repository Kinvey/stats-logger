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

var mutil = require('mutil'),
  FileProvider;

exports.connect = function(emitter, config) {

  FileProvider = function(emitter, config) {
    this.emitter = emitter;
    this.format = config.outputFormat;

    emitter.on('flush', processStats)
  };

  var processStats = function(stats, callback) {
    var self = this,
      output;
    if (this.format) {
      output = getOutput(stats);
    } else {
      output = derriveOutput(stats);
    }


  };

  var getOutput = function(stats) {
    var self = this;
    return mutil.interpolate(self.format, stats);
  };

  var derriveOutput = function(stats) {
    var output = "";
    for (var stat in stats) {
      if (stats.hasOwnProperty(stat)) {
        output += stat + ' ';
      }
    }
  };

  return new FileProvider(emitter, config);
};