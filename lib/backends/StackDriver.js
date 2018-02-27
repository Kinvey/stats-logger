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

var https = require('https'),
  http = require('http'),
  StackDriverBackend;

/**
 * Stack Driver backend for flushing of stats.
 *
 * @param emitter Stat event emitter for handling flushes
 * @param config File-specific configuration options; includes the filename (path) as well as the outputFormat
 * @returns {StackDriverBackend}
 */
exports.connect = function(emitter, config) {

  var stackDriverBackend;

  StackDriverBackend = function(emitter, config) {
    if (!config || !config.apiKey || !config.statsMap || !emitter) {
      process.emit('error', 'Emitter, statsMap, and apiKey are required for the Stack Driver backend');
      return;
    }

    this.emitter = emitter;
    this.apiKey = config.apiKey;
    this.source = config.source || null;
    this.statsMap = config.statsMap || {};
    this.stackDriverHost = config.stackDriverHost || 'custom-gateway.stackdriver.com';
    this.stackDriverPath = config.stackDriverPath || '/v1/custom';
    this.stackDriverPort = config.stackDriverPort || 443;
    this.userAgent = 'stackdriver-stats-logger-backend/' + require('../../package.json').version;

    emitter.on('flush', flush);
  };

  /**
   * Flush the stats to disk
   *
   * @param stats
   */
  var flush = function(stats) {
    stackDriverBackend.processStats(stats);
  };

  /**
   * Write the passed string to disk
   *
   * @param stats A string of stats
   */
  StackDriverBackend.prototype.processStats = function(stats) {
    var self = this;

    var payload = {
      timestamp : parseInt(stats.lastFlushTimeUnix),
      proto_version : 1,
      data : []
    };

    for (var stat in stats) {
      if (stats.hasOwnProperty(stat) && self.statsMap[stat]) {
        self.addStat(stat, stats, payload);
      }
    }

    self.sendPayload(payload);

  };

  /**
   * Close the stream
   */
  StackDriverBackend.prototype.end = function() {
    var self = this;
  };

  StackDriverBackend.prototype.sendPayload = function(payload, context) {
    var self = this;
    var message = JSON.stringify(payload);

    var options = {
      host : self.stackDriverHost,
      path : self.stackDriverPath,
      port : self.stackDriverPort,
      method : 'POST',
      headers : {
        "Content-Length" : message.length,
        "Content-Type" : "application/json; charset=utf-8",
        "x-stackdriver-apikey" : self.apiKey,
        "User-Agent": self.userAgent
      }
    };

    // perform the HTTPS request
    var request = (options.port === 443) ? https.request : http.request;
    var req = request(options, function(res) {
      // 4xx and 5xx errors
      if (Math.floor(res.statusCode / 100) === 4 || Math.floor(res.statusCode / 100) === 5){
        self.emitter.emit('error', res.statusCode + " error sending to Stackdriver");
      }

    });
    req.write(message);
    req.end();

    req.on('error', function(e) {
      self.emitter.emit('error', e);
    });
  };

  /**
   * Derrive output from the passed stats - use if an output template is not provided
   *
   * @param name
   * @param stats
   * @param payload
   *
   */
  StackDriverBackend.prototype.addStat = function (name, stats, payload) {
    var self = this;

    var stackDriverStat = {
      name: self.statsMap[name],
      value: stats[name].toString(),
      collected_at: parseInt(stats.lastFlushTimeUnix)
    };

    if (self.source) {
      stackDriverStat.instance = self.source;
    }

    payload.data.push(stackDriverStat);
  };

  stackDriverBackend = new StackDriverBackend(emitter, config);

  return stackDriverBackend;
};
