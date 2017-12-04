// Copyright 2017 Kinvey, Inc
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

'use strict';

var fs = require('fs');
var googleMetrics = require('google-custom-metrics');
var StackDriver = require('./StackDriver');

// googleStackdriver uses the stackdriver backend and rearranges the upload payload
// Notes:
//   - run only one upload at a time, else timestamps could arrive out of sequence
//     which is a fatal google stackdriver error
//
module.exports.connect = function googleStackdriverConnect( emitter, userConfig ) {
  var config = {};
  for (var k in userConfig) config[k] = userConfig[k];

  config.apiKey = 'not empty';
  var backend = StackDriver.connect(emitter, config);

  var instanceName = process.env.TEST_INSTANCE_NAME || config.useInstanceName || null
  var keyFile = process.env['GOOGLE_APPLICATION_CREDENTIALS'] || backendConfig.keyFile || '/etc/google/auth/application_default_credentials.json';
  try {
    var creds = JSON.parse(fs.readFileSync(keyFile))
  } catch (err) {
    throw new Error('GoogleStackDriver: unable to read json config.keyFile: ' + err.message);
  }

  // override the sendPayload method
  backend.sendPayload = function sendPayload( payload, context ) {
    var self = this;

    // associate the metrics with the instance, if we can
    var platformDetails = googleMetrics.getPlatformDetails(creds);

    // allow override of hostname for easier testing
    platformDetails.instance_name = instanceName || platformDetails.instance_name;

    // convert the legacy format to what google stackdriver expects
    // note that a formerly single upload may require multiple google calls
    var metricsBatches = googleMetrics.convertStackdriverUploadToGoogleStackdriver(platformDetails, payload);

    // do the upload, each batch separately
    googleMetrics.uploadCustomMetricsToGoogleStackdriver(creds, metricsBatches, function(err, replies) {
      for (var i=0; i<replies.length; i++) {
        if (replies[i].statusCode >= 400) {
          var message = replies[i].body && replies[i].body.error && replies[i].body.error.message || replies[i].body;
          self.emitter.emit('error', res.statusCode + ' error sending to Google Stackdriver: ' + message);
        }
      }
    });
  }
}
