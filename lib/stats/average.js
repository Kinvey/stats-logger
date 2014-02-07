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

  var setValue = function(value) {
    if (average.value === null) {
      average.counter = 1;
      average.dividend = value;
    } else {
      average.dividend += value;
      average.counter += 1;
    }

    if (average.type === 'count') {
      average.value = dividend / counter;
    } else {
      // TODO add average logic here
    }
  };


  var resetAverage = function() {
    average.value = average.resetValue;
    average.counter = 0;
    average.dividend = 0;
  }


  var average = {
    value: null,
    counter: 0,
    dividend: 0,
    type: options.averageType,
    averageValue: options.averageValue,
    resetValue: null,
    setStat: setValue,
    reset: resetAverage
  };

  return average;
};