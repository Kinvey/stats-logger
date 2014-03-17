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

exports.generate = function(options) {

  var emitter = options && options.emitter || null;

  var setValue = function(stat, value) {
    if (typeof calculated.statMap[stat] === 'undefined') {
      return;
    }

    if (typeof value !=='undefined' && value !== null) {
      calculated.statMap[stat] = value;
    }

    calculate();
  };

  var resetCalc = function() {
    if (!calculated.suppressReset) {
      calculated.value = typeof calculated.resetValue !== 'undefined' ? calculated.resetValue : null;
      calculated.statMap = {};
      calculated.stats.forEach(function(stat) {
        calculated.statMap[stat] = null;
      });
    }
  };

  var calculate = function() {
    try {
      calculated.value = calculated.calcFunction.call(null, calculated.stats, calculated.statMap);
    } catch (e) {
      calculated.value = null;
    }
  };


  var calculated = {
    name: 'calculated',
    value: options && typeof options.initialValue !== 'undefined' ? options.initialValue : null,
    resetValue: options && typeof options.resetValue !== 'undefined' ? options.resetValue: null,
    statMap: {},
    stats: options && options.stats || [],
    calcFunction: options && options.calcFunction || function() {},
    setStat: setValue,
    reset: resetCalc,
    suppressReset: options && options.suppressReset || false
  };

  calculated.stats.forEach(function(stat) {
    calculated.statMap[stat] = null;
    if (emitter) {
      emitter.on(stat, function(value) {
        setValue(stat, value);
      });
    }
  });

  return calculated;
};