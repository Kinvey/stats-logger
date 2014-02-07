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

var statMap = {};
statMap.push('counter', require('./stats/counter'));
statMap.push('min', require('./stats/min'));
statMap.push('max', require('./stats/max'));
statMap.push('average', require('./stats/average'));
statMap.push('snapshot', require('./stats/snapshot'));
statMap.push('sum', require('./stats/sum'));

var Stat;

exports.generate = function(type, options) {

  Stat = function(type, options) {
    this.statInstance = statMap[type].generate(options);
  };

  Stat.prototype.toString = function() {
    var self = this;
    return self.statInstance.value;
  };

  Stat.prototype.setStat = function(value) {
    var self = this;
    self.statInstance.setStat(value);
  };

  Stat.prototype.reset = function() {
    var self = this;
    self.statInstance.value = self.statInstance.resetValue;
  };

  return new Stat(type, options);
};