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

var EventEmitter = require('events').EventEmitter,
  googleMetrics = require('google-custom-metrics'),
  sinon = require('sinon'),
  fileBackend = require('../lib/backends/file'),
  stackDriverBackend = require('../lib/backends/StackDriver'),
  googleStackDriverBackend = require('../lib/backends/GoogleStackDriver'),
  nock = require('nock');

describe("backends", function() {
  var emitter;

  before(function(done) {
    emitter = new EventEmitter();
    done();
  });

  afterEach(function(done) {
    emitter.removeAllListeners('flush');
    done();
  });

  describe("fileBackend", function() {

    it('should write a static text line', function(done) {
      var options = {filename: "./stats.log", outputFormat: "{foo}"};
      var stat = {foo: "bar"};
      var fb = fileBackend.connect(emitter, options);
      var fileStub = sinon.stub(fb.statStream, "write", function(value) {
        value.should.eql("bar\n");
        fb.statStream.write.restore();
        done();
      });
      emitter.emit('flush', stat);
    });

    it('should respond to multiple flush events', function(done) {
      var options = {filename: "./stats.log", outputFormat: "{foo}"};
      var stat = {foo: "bar"};
      var stat2 = {foo: "bar2"};
      var stat3 = {foo: "bar3"};
      var fb = fileBackend.connect(emitter, options);
      var fileStub = sinon.stub(fb.statStream, "write", function(value) {
        switch(fileStub.callCount) {
          case 1:
            value.should.eql("bar\n");
            break;
          case 2:
            value.should.eql("bar2\n");
            break;
          case 3:
            value.should.eql("bar3\n");
            break;
        }
      });
      emitter.emit('flush', stat);
      emitter.emit('flush', stat2);
      emitter.emit('flush', stat3);

      fileStub.callCount.should.eql(3);
      fb.statStream.write.restore();
      done();
    });

    it('should ignore tags with no corresponding stat', function(done) {
      var options = {filename: "./stats.log", outputFormat: "{foo} {foo2}"};
      var stat = {foo: "bar"};
      var fb = fileBackend.connect(emitter, options);
      var fileStub = sinon.stub(fb.statStream, "write", function(value) {
        value.should.eql("bar {foo2}\n");
        fb.statStream.write.restore();
        done();
      });
      emitter.emit('flush', stat);

    });

    it('should ignore stats with no corresponding tags', function(done) {
      var options = {filename: "./stats.log", outputFormat: "{foo}"};
      var stat = {foo: "bar", foo2: "bar2"};
      var fb = fileBackend.connect(emitter, options);
      var fileStub = sinon.stub(fb.statStream, "write", function(value) {
        value.should.eql("bar\n");
        fb.statStream.write.restore();
        done();
      });
      emitter.emit('flush', stat);
    });

    it('should respond to multiple stats', function(done) {
      var options = {filename: "./stats.log", outputFormat: "{foo} {foo2} {foo3}"};
      var stat = {foo: "bar", foo2: "bar2", foo3: "bar3"};
      var fb = fileBackend.connect(emitter, options);
      var fileStub = sinon.stub(fb.statStream, "write", function(value) {
        value.should.eql("bar bar2 bar3\n");
        fb.statStream.write.restore();
        done();
      });
      emitter.emit('flush', stat);
    });

    it('should output static text within a template', function(done) {
      var options = {filename: "./stats.log", outputFormat: "{foo} is not a {foo2}"};
      var stat = {foo: "bar", foo2: "bar2"};
      var fb = fileBackend.connect(emitter, options);
      var fileStub = sinon.stub(fb.statStream, "write", function(value) {
        value.should.eql("bar is not a bar2\n");
        fb.statStream.write.restore();
        done();
      });
      emitter.emit('flush', stat);
    });


    it('should format timestamp objects like moment with the object toString() method', function(done) {
      var options = {filename: "./stats.log", outputFormat: "{lastFlushTime} {foo} {foo2}"};
      var flushTime = { toString: function(){ return "Sat Feb 15 2014 00:00:00 GMT-0500" } };
      var stat = {foo: "bar", foo2: "bar2", lastFlushTime: flushTime};
      var fb = fileBackend.connect(emitter, options);
      var fileStub = sinon.stub(fb.statStream, "write", function(value) {
        value.should.eql("Sat Feb 15 2014 00:00:00 GMT-0500 bar bar2\n");
        fb.statStream.write.restore();
        done();
      });
      emitter.emit('flush', stat);
    });

    it('should be able to include a moment format function in the template', function(done) {
      var options = {filename: "./stats.log", outputFormat: "{lastFlushTime} {foo} {foo2}"};
      var flushTime = Math.floor(new Date("2014-02-15 EST").getTime() / 1000);
      var stat = {foo: "bar", foo2: "bar2", lastFlushTime: flushTime};
      var fb = fileBackend.connect(emitter, options);
      var fileStub = sinon.stub(fb.statStream, "write", function(value) {
        value.should.eql("1392440400 bar bar2\n");
        fb.statStream.write.restore();
        done();
      });
      emitter.emit('flush', stat);
    });

    it('should be able to output all values if a template is not included', function(done) {
      var options = {filename: "./stats.log"};
      var stat = {foo: "bar", foo2: "bar2"};
      var fb = fileBackend.connect(emitter, options);
      var fileStub = sinon.stub(fb.statStream, "write", function(value) {
        value.should.eql("bar bar2\n");
        fb.statStream.write.restore();
        done();
      });
      emitter.emit('flush', stat);
    });

    it('should emit an error if a filename is not included', function(done) {
      var options = {outputFormat: "{lastFlushTime} {foo} {foo2}"};
      process.once('error', function(err) {
        err.should.eql("Emitter and filename are required for the file backend");
        done();
      });
      var fb = fileBackend.connect(emitter, options);
    });

    it('should emit an error if an emitter is not included', function(done) {
      var options = {filename: "./stats.log", outputFormat: "{lastFlushTime} {foo} {foo2}"};
      process.once('error', function(err) {
        err.should.eql("Emitter and filename are required for the file backend");
        done();
      });
      var fb = fileBackend.connect(null, options);
    });
  });

  describe("stackDriverBackend", function() {

    afterEach(function (done) {
      nock.cleanAll();
      done();
    });

    it('should respond to multiple flush events', function(done) {
      var spy = sinon.spy();
      var sd = nock('https://custom-gateway.stackdriver.com')
        .post('/v1/custom')
        .times(3)
        .reply(201, spy);

      var options = {apiKey: "somekey", statsMap: {foo: 'fooStat'}};
      var stat = {foo: "bar"};
      var stat2 = {foo: "bar2"};
      var stat3 = {foo: "bar3"};
      var stb = stackDriverBackend.connect(emitter, options);

      emitter.emit('flush', stat);
      emitter.emit('flush', stat2);
      emitter.emit('flush', stat3);

      spy.callCount.should.eql(3);
      JSON.parse(spy.args[0][1]).data[0].value.should.eql("bar");
      JSON.parse(spy.args[0][1]).data[0].name.should.eql("fooStat");
      JSON.parse(spy.args[1][1]).data[0].value.should.eql("bar2");
      JSON.parse(spy.args[2][1]).data[0].value.should.eql("bar3");
      sd.isDone().should.eql(true);

      done();
    });

    it('should only send stats that have values', function(done) {
      var spy = sinon.spy();
      var sd = nock('https://custom-gateway.stackdriver.com')
        .post('/v1/custom')
        .reply(201, spy);

      var options = {apiKey: "somekey", statsMap: {foo: 'fooStat', foo2: 'fooStat2'}};
      var stat = {foo: "bar"};

      var stb = stackDriverBackend.connect(emitter, options);

      emitter.emit('flush', stat);

      sd.isDone().should.eql(true);
      spy.callCount.should.eql(1);
      var args = JSON.parse(spy.args[0][1]);
      args.data.length.should.eql(1);
      args.data[0].name.should.eql('fooStat');
      done();

    });

    it('should ignore stats with no corresponding tags', function(done) {
      var spy = sinon.spy();
      var sd = nock('https://custom-gateway.stackdriver.com')
        .post('/v1/custom')
        .reply(201, spy);

      var options = {apiKey: "somekey", statsMap: {foo: 'fooStat'}};
      var stat = {foo: "bar", foo2: "bar2"};

      var stb = stackDriverBackend.connect(emitter, options);

      emitter.emit('flush', stat);

      sd.isDone().should.eql(true);
      spy.callCount.should.eql(1);
      var args = JSON.parse(spy.args[0][1]);
      args.data.length.should.eql(1);
      args.data[0].name.should.eql('fooStat');
      done();
    });

    it('should respond to multiple stats', function(done) {
      var spy = sinon.spy();
      var sd = nock('https://custom-gateway.stackdriver.com')
        .post('/v1/custom')
        .reply(201, spy);

      var options = {apiKey: "somekey", statsMap: {foo: 'fooStat', foo2: 'fooStat2', foo3: 'fooStat3'}};
      var stat = {foo: "bar", foo2: "bar2", foo3: "bar3"};

      var stb = stackDriverBackend.connect(emitter, options);

      emitter.emit('flush', stat);

      spy.callCount.should.eql(1);
      var args = JSON.parse(spy.args[0][1]);

      args.data.length.should.eql(3);
      args.data[0].name.should.eql('fooStat');
      args.data[0].value.should.eql('bar');
      args.data[1].name.should.eql('fooStat2');
      args.data[1].value.should.eql('bar2');
      args.data[2].name.should.eql('fooStat3');
      args.data[2].value.should.eql('bar3');
      done();
    });

    it('should include flush time in payload', function(done) {
      var spy = sinon.spy();
      var flushTime = Math.floor(new Date('2014-2-15').getTime() / 1000);
      var sd = nock('https://custom-gateway.stackdriver.com')
        .post('/v1/custom')
        .reply(201, spy);

      var options = {apiKey: "somekey", statsMap: {foo: 'fooStat'}};
      var stat = {foo: "bar", lastFlushTimeUnix: flushTime};

      var stb = stackDriverBackend.connect(emitter, options);

      emitter.emit('flush', stat);

      spy.callCount.should.eql(1);
      var args = JSON.parse(spy.args[0][1]);
      args.data.length.should.eql(1);
      args.data[0].name.should.eql('fooStat');
      args.data[0].value.should.eql('bar');
      args.data[0].collected_at.should.eql(parseInt(flushTime));
      done();
    });

    it('should allow optional instance name', function(done) {
      var spy = sinon.spy();
      var flushTime = Math.floor(new Date('2014-2-15').getTime() / 1000);
      var sd = nock('https://custom-gateway.stackdriver.com')
        .post('/v1/custom')
        .reply(201, spy);

      var options = {apiKey: "somekey", statsMap: {foo: 'fooStat'}, source: 'mySource'};
      var stat = {foo: "bar", lastFlushTimeUnix: flushTime};

      var stb = stackDriverBackend.connect(emitter, options);

      emitter.emit('flush', stat);

      spy.callCount.should.eql(1);
      var args = JSON.parse(spy.args[0][1]);
      args.data.length.should.eql(1);
      args.data[0].name.should.eql('fooStat');
      args.data[0].value.should.eql('bar');
      args.data[0].instance.should.eql('mySource');
      args.data[0].collected_at.should.eql(parseInt(flushTime));
      done();
    });

    it('should emit an error if an apiKey is not included', function(done) {
      var options = {statsMap: {foo:'fooStat'}};
      process.once('error', function(err) {
        err.should.eql("Emitter, statsMap, and apiKey are required for the Stack Driver backend");
        done();
      });
      var stb = stackDriverBackend.connect(emitter, options);
    });

    it('should emit an error if a statsMap is not included', function(done) {
      var options = {apiKey: "myKey"};
      process.once('error', function(err) {
        err.should.eql("Emitter, statsMap, and apiKey are required for the Stack Driver backend");
        done();
      });
      var stb = stackDriverBackend.connect(emitter, options);
    });

    it('should emit an error if an emitter is not included', function(done) {
      var options = {apiKey: "myKey", statsMap: {foo: 'fooStat'}};
      process.once('error', function(err) {
        err.should.eql("Emitter, statsMap, and apiKey are required for the Stack Driver backend");
        done();
      });
      var stb = stackDriverBackend.connect(null, options);
    });
  });

  describe ('GoogleStackDriver backend', function() {
    var options;

    beforeEach (function(done) {
      options = {
        apiKey: 'myKey',
        keyFile: __dirname + '/mock-gcp-creds.json',
        emitter: emitter,
        statsMap: {},
      }
      done();
    })

    it ('should extend the StackDriver backend', function(done) {
      var stb = stackDriverBackend.connect(emitter, options);
      var name, stb, gstb;

      gstb = googleStackDriverBackend.connect(emitter, options);
      for (name in stb) {
        if (typeof stb[name] === 'function' && name !== 'sendPayload') {
          // TODO: each stackDriverBackend.connect() returns an instance of a newly created unique class,
          // so prototype methods are not identical.  Check only the proprety types instead.
          should.equal(typeof gstb[name], typeof stb[name]);
        }
      }

      options.stackDriverBackend = stb;
      gstb = googleStackDriverBackend.connect(emitter, options);
      should.equal(gstb, stb);
      for (name in stb) {
        if (typeof stb[name] === 'function' && name !== 'sendPayload') {
          should.equal(gstb[name], stb[name]);
        }
      }

      done();
    })

    it ('should use google-custom-metrics to upload', function(done) {
      // mock google auth token route
      var ga = nock('https://www.googleapis.com')
        .post('/oauth2/v4/token')
        .reply(200, JSON.stringify({ access_token: 'ABC-123-DEF' }));
      // persisted mock google stackdriver upload route (called multiple times)
      var gcm = nock('https://monitoring.googleapis.com')
        .post('/v3/projects/mock-stackdriver-account/timeSeries')
        .reply(200, '')
        .persist();

      var sec = Math.floor(new Date().getTime() / 1000);
      var stackdriverPayload = {
        timestamp: sec,
        proto_version: 1,
        data: [
          { name: 'metric-name', value: 1.5, collected_at: sec - 1, instance: 'hostname' },
          { name: 'metric-name', value: 2.5, collected_at: sec - 2, instance: 'hostname' },
        ]
      };

      var gstb = googleStackDriverBackend.connect(emitter, options);
      gstb.sendPayload(stackdriverPayload);

      done();
    })
  })
});
