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
    if (typeof value !=='undefined' && value !== null) {
      if (max.value === null || max.value === max.resetValue) {
        max.value = value;
      } else if (value > max.value) {
        max.value = value;
      }
    }
  };

  var resetMaxValue = function() {
    if (!max.suppressReset) {
      max.value = max.resetValue;
    }
  };


  var max = {
    name: 'max',
    value: options && typeof options.initialValue !== 'undefined' ? options.initialValue : null,
    resetValue: options && typeof options.resetValue !== 'undefined' ? options.resetValue : null,
    setStat: setValue,
    reset: resetMaxValue,
    suppressReset: options && options.suppressReset || false
  };

  return max;
};
