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
  sinon = require('sinon'),
  fileBackend = require('../lib/backends/file'),
  moment = require('moment');

describe("backends", function() {
  var emitter;

  before(function(done) {
    emitter = new EventEmitter();
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


    it('should be able to output a moment', function(done) {
      var options = {filename: "./stats.log", outputFormat: "{lastFlushTime} {foo} {foo2}"};
      var flushTime = moment("2014-02-15");
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
      var flushTime = moment("2014-02-15").format('X');
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
});