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

var stat = require('./stat'),
  moment = require('moment'),
  EventEmitter = require('event').EventEmitter,
  flush;

exports.createInstance = function(flushInterval, backend, backendConfig, stats) {
  var StatsLogger;

  StatsLogger = function(flushInterval, backend, backendConfig, stats) {
    this.stats = {};
    this.statsEmitter = new EventEmitter();
    this.flushInterval = flushInterval;
    this.backend = require('./backends/' + backend).connect(this.statsEmitter, backendConfig);
    this.flushTimer = null;

    if (stats) {
      for (var stat in stats) {
        if (stats.hasOwnProperty(stat)) {
          this.addStat(stat.name, stat.type, stat.options);
        }
      }
    }
  };

  StatsLogger.prototype.addStat = function(name, type, options) {
    var self = this;
    if (!options) {
      options = {};
    }

    options.emitter = self.statsEmitter;

    self.stats.push(name, stat.generate(type, options));
  };

  StatsLogger.prototype.removeStat = function(name) {
    var self = this;
    delete self.stats[name];
  };

  StatsLogger.prototype.recordStat = function(name, value) {
    var self = this;
    self.stats[name].record(value);
    self.statsEmitter.emit(name, self.stats[name].value);
  };

  StatsLogger.prototype.getStatValue = function(name) {
    var self = this;
    return self.stats[name];
  };

  StatsLogger.prototype.end = function() {
    var self = this;
    clearTimeout(self.flush);
    self.provider.end();
  };

  StatsLogger.prototype.flush = function() {
    var self = this;
    self.stats.lastFlushTime = moment();
    self.statsEmitter.emit('flush', self.stats);
  };

  StatsLogger.prototype.start = function() {
    var self = this;
    if (self.flushTimer !== null) {
      flush();
      self.flushTimer = setTimeout(self.flush(), self.flushInterval);
    } else {
      // TODO:  behavior if timer already is running?
    }
  };

  StatsLogger.prototype.stop = function() {
    var self = this;
    clearTimeout(self.flushTimer);
    self.flushTimer = null;
  };

  return new StatsLogger(flushInterval, provider, providerConfig, stats);
};