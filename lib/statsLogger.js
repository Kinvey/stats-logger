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

var EventEmitter = require('events').EventEmitter,
  flush;

/**
 * Entry point to the statLogger module.  Creates and returns an instance of StatsLogger
 *
 * @param flushInterval The time, in milliseconds, to flush the stats to an underlying backend
 * @param backend The name of the backend provider to use
 * @param backendConfig An object of backend-specific configuration options
 * @param stats Optional object of stats
 * @returns {StatsLogger}
 */
exports.createInstance = function(flushInterval, backend, backendConfig, stats) {
  var StatsLogger;

  /**
   * Helper method for deep object clone
   *
   * @param object to clone
   * @returns clone of param
   */

  var cloneObject = function (obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  };

  /**
   * private constructor for StatsLogger object, which records and flushing stats
   *
   * @param flushInterval
   * @param backend
   * @param backendConfig
   * @param stats
   * @constructor
   */
  StatsLogger = function(flushInterval, backend, backendConfig, stats) {
    this.stats = {};
    this.captureFunctions = [];
    this.statGenerator = require('./stat');
    this.statsEmitter = new EventEmitter();
    this.flushInterval = flushInterval;

    if (typeof backend === 'string') {
      this.backend = require('./backends/' + backend).connect(this.statsEmitter, backendConfig);
    } else if (typeof backend === 'object') {
      this.backend = backend.connect(this.statsEmitter, backendConfig);
    }

    this.flushTimer = null;

    if (stats) {
      for (var stat in stats) {
        if (stats.hasOwnProperty(stat)) {
          this.addStat(stat, stats[stat].type, stats[stat].options || null);
        }
      }
    }
  };

  /**
   * Add a stat to the list of tracked stats
   *
   * @param name The name of the stat, which will be referenced when recording a stat
   * @param type The type of stat (e.g. counter, mean, snapshot, etc)
   * @param options Stat-specific options
   */
  StatsLogger.prototype.addStat = function(name, type, options) {
    var self = this;
    if (!options) {
      options = {};
    }

    options.emitter = self.statsEmitter;

    self.stats[name] = self.statGenerator.generate(type, options);
  };

  /**
   * Remove a stat from the list of tracked stats
   *
   * @param name The name of the stat to be removed
   */
  StatsLogger.prototype.removeStat = function(name) {
    var self = this;
    delete self.stats[name];
  };

  /**
   * Record a stat
   *
   * @param name The name of the stat to record
   * @param value The value to record to the stat
   */
  StatsLogger.prototype.recordStat = function(name, value) {
    var self = this;

    self.stats[name].setStat(value);
    self.statsEmitter.emit(name, self.stats[name].toString());
  };

  /**
   * Record a stat once per flush, just before the flush is executed.  
   *
   * @param name The name of the stat to record
   * @param statFunction A function that returns the value to record to the stat
   */
  StatsLogger.prototype.captureStatOnFlush = function(name, statFunction){
    var self = this;
    self.captureFunctions.push({ name: name, statFunction: statFunction });
  }

  /**
   * Get the value of a specific stat
   *
   * @param name The name of the stat
   * @returns {*} The value of the stat
   */
  StatsLogger.prototype.getStatValue = function(name) {
    var self = this;
    return self.stats[name].toString();
  };

  /**
   * End the collection of stats and stop flushing to the underlying backend
   */
  StatsLogger.prototype.end = function() {
    var self = this;
    if (self.flushTimer) {
      self.flush();
    }
    clearInterval(self.flushTimer);
    self.backend.end();
    self.stats = {};
  };

  /**
   * Manually flush stats to the backend
   */
  StatsLogger.prototype.flush = function() {
    var self = this;

    if (self.captureFunctions.length > 0) {
      for (var i = 0; i < self.captureFunctions.length; i++) {
        var func = self.captureFunctions[i];
        try {
          self.recordStat(func.name, func.statFunction());
        }
        catch (e) {
          console.log("Error collecting stat on flush:" + e);
        }
      }
    }

    var now = new Date();
    self.stats.lastFlushTime = now.toISOString();
    self.stats.lastFlushTimeUnix = Math.floor(now.getTime() / 1000);

    self.statsEmitter.emit('flush', self.stats);

    if (self.stats) {
      for (var stat in self.stats) {
        if (self.stats.hasOwnProperty(stat) && typeof self.stats[stat].reset !== 'undefined') {
          self.stats[stat].reset();
        }
      }
    }

  };

  /**
   * Start the flushing of stats at the specified statsInterval to the underlying backend
   */
  StatsLogger.prototype.start = function() {
    var self = this;
    if (self.flushTimer !== null) {
      self.flush();
      self.stop();
    }
    self.flushTimer = setInterval(self.flush.bind(self), self.flushInterval);
  };

  /**
   * Stop the flushing of stats to the underlying backend
   */
  StatsLogger.prototype.stop = function() {
    var self = this;
    if (self.flushTimer) {
      clearInterval(self.flushTimer);
    }
    self.flushTimer = null;
  };

  return new StatsLogger(flushInterval, backend, cloneObject(backendConfig), stats);
};
