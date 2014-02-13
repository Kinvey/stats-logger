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
  fs = require('fs'),
  FileBackend;

/**
 * File backend for flushing of stats.
 *
 * @param emitter Stat event emitter for handling flushes
 * @param config File-specific configuration options; includes the filename (path) as well as the outputFormat
 * @returns {FileBackend}
 */
exports.connect = function(emitter, config) {

  var fileBackend;

  FileBackend = function(emitter, config) {
    if (!config || !config.filename || !emitter) {
      process.emit('error', "Emitter and filename are required for the file backend");
      return;
    }

    this.emitter = emitter;
    this.filename = config.filename;
    this.format = config.outputFormat;
    this.statStream = fs.createWriteStream(this.filename, {flags:'a'});
    emitter.on('flush', flush);
  };

  /**
   * Flush the stats to disk
   *
   * @param stats
   */
  var flush = function(stats) {
    fileBackend.processStats(stats);
  };

  /**
   * Write the passed string to disk
   *
   * @param stats A string of stats
   */
  FileBackend.prototype.processStats = function(stats) {
    var self = this,
      output;

    if (self.format) {
      output = mutil.interpolate(self.format, stats);
    } else {
      output = derriveOutput(stats);
    }

    output += '\n';
    self.statStream.write(output);

  };

  /**
   * Close the stream
   */
  FileBackend.prototype.end = function() {
    var self = this;
    fs.close(self.statStream);
  };

  /**
   * Derrive output from the passed stats - use if an output template is not provided
   *
   * @param stats
   * @returns {string}
   */
  var derriveOutput = function(stats) {
    var output = "";
    for (var stat in stats) {
      if (output !== "") {
        output += ' ';
      }
      if (stats.hasOwnProperty(stat)) {
        output += stats[stat];
      }
    }
    return output;
  };

  fileBackend = new FileBackend(emitter, config);

  return fileBackend;
};