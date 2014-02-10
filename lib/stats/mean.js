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

  var emitter = options.emitter;


  if (options.meanType === 'stat') {
    emitter.on(options.statName, function(value) {
      mean.counter = value;
      calculateAverage();
    });
  }

  var setValue = function(value) {
    if (mean.value === null) {
      mean.dividend = value;
    } else {
      mean.dividend += value;
    }

    if (mean.type === 'count') {
      mean.counter += 1;
    }

    calculateAverage();
  };

  var resetMean = function() {
    mean.value = mean.resetValue;
    mean.counter = 0;
    mean.dividend = 0;
  };

  var calculateAverage = function() {
    if (mean.divisor !== 0) {
      mean.value = mean.dividend / mean.divisor;
    }
  };


  var mean = {
    value: null,
    divisor: 0,
    dividend: 0,
    type: options.meanType,
    statName: options.statName,
    resetValue: null,
    setStat: setValue,
    reset: resetMean
  };

  return mean;
};