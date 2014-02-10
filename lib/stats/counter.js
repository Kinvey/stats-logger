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
    if (value || typeof value === 'undefined') {
      counter.value += counter.increment;
    } else {
      counter.value -= counter.increment;
    }
  };

  var resetCounter = function() {
    counter.value = counter.resetValue;
  };


  var counter = {
    value: options && options.initialValue || 0,
    increment: options && options.incrementFactor || 1,
    resetValue: options && options.resetValue || 0,
    setStat: setValue,
    reset: resetCounter
  };

  return counter;

};
