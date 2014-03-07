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

var statMap = {
  counter: require('./stats/counter'),
  min: require('./stats/min'),
  max: require('./stats/max'),
  mean: require('./stats/mean'),
  snapshot: require('./stats/snapshot'),
  calculated: require('./stats/calculated')
},
  Stat;

/**
 * Generate a stat of the specified type.
 *
 * @param type The name of the stat type (e.g. 'counter', 'snapshot', etc.)
 * @param options Stat-specific options
 * @returns {Stat}
 */
exports.generate = function(type, options) {

  Stat = function(type, opt) {
    this.statInstance = statMap[type].generate(opt);
  };

  /**
   * Override of toString, returns the value of the stat
   *
   * @returns stat value
   */
  Stat.prototype.toString = function() {
    var self = this;
    return self.statInstance.value;
  };

  /**
   * Set a specific stat to include the passed value
   *
   * @param value
   */
  Stat.prototype.setStat = function(value, options) {
    var self = this;
    self.statInstance.setStat(value, options);
  };

  /**
   * Reset a stat counter
   */
  Stat.prototype.reset = function() {
    var self = this;
    self.statInstance.reset();
  };

  return new Stat(type, options);
};