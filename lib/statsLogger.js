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

var providers = require('providers'),
  EventEmitter = require('event').EventEmitter,
  flush;

exports.initialize = function(flushInterval, provider, providerConfig, stats) {
  var StatsLogger;

  StatsLogger = function(options) {
    this.stats = {};
    this.statsEmitter = new EventEmitter();
    this.provider = providers.initialize(this.statsEmitter, provider, providerConfig);
    this.flush = setTimeout(flush, flushInterval);

  };

  StatsLogger.prototype.addStat = function(name, type, options) {
    var self = this;
    self.stats.push(name, statFactory.initialize(type, options));
  };

  StatsLogger.prototype.removeStat = function(name) {
    var self = this;
    delete self.stats[name];
  };

  StatsLogger.prototype.recordStat = function(name, value) {
    var self = this;
    self.stats[name].record(value);
  };

  StatsLogger.prototype.end = function() {
    var self = this;
    clearTimeout(self.flush);
    self.provider.end();
  };

  flush = function() {
    var self = this;
    self.statsEmitter.emit('flush', stats);
  };

  return new StatsLogger(flushInterval, provider, providerConfig, stats);
};