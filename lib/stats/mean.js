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

  if (options && options.meanType === 'stat' && (!options.emitter || !options.statName)) {
    process.emit('error',new Error("meanType of stat requires an emitter and statName"));
  } else {

    var emitter = options && options.emitter || null;

    if (options && options.meanType && options.meanType === 'stat') {
      emitter.on(options.statName, function(value) {
        mean.divisor = value;
        calculateAverage();
      });
    }

    var setValue = function(value) {
      if (typeof value !== 'undefined' && value !== null) {
        if (mean.value === null) {
          mean.dividend = value;
        } else {
          mean.dividend += value;
        }

        if (mean.type === 'count') {
          mean.divisor += 1;
        }

        calculateAverage();
      }
    };

    var resetMean = function() {
      if (!mean.suppressReset) {
        mean.value = null;
        mean.counter = 0;
        mean.dividend = 0;

        // Only reset divisor if type is not stat - otherwise, divisor changes based on events
        if (mean.type !== 'stat') {
          mean.divisor = 0;
        }
      }
    };

    var calculateAverage = function() {
      if (mean.divisor !== 0) {
        mean.value = mean.dividend / mean.divisor;
      } else {
        mean.value = mean.dividend;
      }
    };


    var mean = {
      name: 'mean',
      value: null,
      divisor: 0,
      dividend: 0,
      type: options && options.meanType || 'count',
      statName: options && options.statName || null,
      setStat: setValue,
      reset: resetMean,
      suppressReset: options && options.suppressReset || false
    };

    return mean;
  }
};