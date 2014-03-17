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

  if (options && options.meanType === 'stat' && (!options.emitter || (!options.divisorStat && !options.statName))) {
    process.emit('error',new Error("meanType of stat requires an emitter and divisorStat"));
  } else {

    var emitter = options && options.emitter || null;

    if (options && options.statName && !options.divisorStat) {
      options.divisorStat = options.statName;
    }

    if (options && options.meanType && options.meanType === 'stat') {
      if (options.divisorStat) {
        emitter.on(options.divisorStat, function(value) {
          mean.divisor = value;
          calculateAverage();
        });
      }
      if (options.dividendStat) {
        emitter.on(options.dividendStat , function(value) {
          mean.dividend = value;
          calculateAverage();
        });
      }
    }

    var setValue = function(value) {
      if (typeof value !== 'undefined' && value !== null && (mean.type === 'count' || (mean.type === 'stat' && !mean.dividendStat))) {
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
        mean.value = typeof mean.resetValue !== 'undefined' ? mean.resetValue : null;
        mean.dividend = 0;

        // Only reset divisor if type is not stat - otherwise, divisor changes based on events
        if (mean.type !== 'stat') {
          mean.divisor = 0;
        }
      }
    };

    var calculateAverage = function() {
      var value;
      if (mean.divisor !== 0) {
        value = mean.dividend / mean.divisor;
      } else {
        value = mean.dividend;
      }

      if (typeof mean.fractionDigits !== 'undefined' && mean.fractionDigits !== null) {
        value = value.toFixed(mean.fractionDigits);
      }

      mean.value =  value;
    };


    var mean = {
      name: 'mean',
      value: options && typeof options.initialValue !== 'undefined' ? options.initialValue : null,
      divisor: 0,
      dividend: 0,
      type: options && options.meanType || 'count',
      dividendStat: options && options.dividendStat || null,
      divisorStat: options && options.divisorStat || null,
      setStat: setValue,
      reset: resetMean,
      resetValue: options && typeof options.resetValue !== 'undefined' ? options.resetValue : null,
      suppressReset: options && options.suppressReset || false,
      fractionDigits: options && typeof options.fractionDigits !== 'undefined' ? options.fractionDigits : null
    };

    return mean;
  }
};