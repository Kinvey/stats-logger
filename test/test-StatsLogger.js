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
  statsLogger = require('../lib/statsLogger'),
  backend = require('./mockBackend'),
  should = require('should');

describe('StatsLogger', function() {
  var generateStub,
    recordStat;

  before(function(done) {

    recordStat = function(value) {
      var that = this;

      var num = 1;
      if (value) {
        num += value;
      }
      that.statInstance.value = num;
    };

    var returnString = function() {
      var that = this;
      return that.statInstance.value;
    };

    generateStub = function(type, options) {
      return {statInstance: {name: type, options: options, value: 1}, setStat: recordStat, toString: returnString};
    };


    done();
  });

  it('should be able to add a stat with options', function(done) {
    var a = statsLogger.createInstance(60, backend, {}, {});
    sinon.stub(a.statGenerator, 'generate', generateStub);
    a.addStat("myStat", "counter", {initialValue: 12});
    a.stats.myStat.statInstance.name.should.eql('counter');
    a.stats.myStat.statInstance.options.initialValue.should.eql(12);
    a.statGenerator.generate.restore();
    done();
  });

  it('should be able to add a stat without options', function(done) {
    var a = statsLogger.createInstance(60, backend, {}, {});
    sinon.stub(a.statGenerator, 'generate', generateStub);
    a.addStat("myStat", "counter");
    a.stats.myStat.statInstance.name.should.eql('counter');
    should.not.exist(a.stats.myStat.statInstance.options.initialValue);
    a.statGenerator.generate.restore();
    done();
  });

  it('should be able to add a stats of different types', function(done) {
    var a = statsLogger.createInstance(60, backend, {}, {});
    sinon.stub(a.statGenerator, 'generate', generateStub);
    a.addStat("myStat", "counter");
    a.addStat("myStat2", "snapshot");
    a.stats.myStat.statInstance.name.should.eql('counter');
    a.stats.myStat2.statInstance.name.should.eql('snapshot');
    a.statGenerator.generate.restore();
    done();
  });

  it('should be able to add stats in bulk on StatLogger initialization', function(done) {
    var stats = {
      myStat: {
        type: "counter",
        options: {initialValue: 12}
      },
      myStat2: {
        type: "snapshot"
      }
    };

    var a = statsLogger.createInstance(60, backend, {}, stats);

    a.stats.myStat.statInstance.name.should.eql('counter');
    a.stats.myStat.statInstance.value.should.eql(12);
    a.stats.myStat2.statInstance.name.should.eql('snapshot');
    should.not.exist(a.stats.myStat2.statInstance.options);

    done();
  });

  it('should be able to overwrite a stat', function(done) {
    var a = statsLogger.createInstance(60, backend, {}, {});
    sinon.stub(a.statGenerator, 'generate', generateStub);
    a.addStat("myStat", "counter");
    a.stats.myStat.statInstance.name.should.eql('counter');
    a.addStat("myStat", "snapshot");
    a.stats.myStat.statInstance.name.should.eql('snapshot');
    a.statGenerator.generate.restore();
    done();
  });

  it('should be able to delete a stat', function(done) {
    var a = statsLogger.createInstance(60, backend, {}, {});
    sinon.stub(a.statGenerator, 'generate', generateStub);
    a.addStat("myStat", "counter", {initialValue: 12});
    a.stats.myStat.statInstance.name.should.eql('counter');
    a.stats.myStat.statInstance.options.initialValue.should.eql(12);
    a.removeStat("myStat");
    should.exist(a.stats);
    should.not.exist(a.stats.myStat);
    a.statGenerator.generate.restore();
    done();
  });

  it('should ignore deleting a stat that doesn not exist', function(done) {
    var a = statsLogger.createInstance(60, backend, {}, {});
    sinon.stub(a.statGenerator, 'generate', generateStub);
    a.addStat("myStat", "counter", {initialValue: 12});
    a.stats.myStat.statInstance.name.should.eql('counter');
    a.stats.myStat.statInstance.options.initialValue.should.eql(12);
    should.not.exist(a.stats.myStat2);
    a.removeStat("myStat2");
    should.exist(a.stats);
    should.exist(a.stats.myStat);
    should.not.exist(a.stats.myStat2);
    a.statGenerator.generate.restore();
    done();
  });

  it('should be able to record a stat', function(done) {
    var a = statsLogger.createInstance(60, backend, {}, {});
    sinon.stub(a.statGenerator, 'generate', generateStub);
    a.addStat("myStat", "counter", {initialValue: 12});

    a.statsEmitter.once('myStat', function(stat) {
      stat.should.eql(4);
      done();
    });
    a.recordStat("myStat", 3);
    a.statGenerator.generate.restore();
  });

  it('should be able to record a stat without passing a value', function(done) {
    var a = statsLogger.createInstance(60, backend, {}, {});
    sinon.stub(a.statGenerator, 'generate', generateStub);
    a.addStat("myStat", "counter", {initialValue: 12});

    a.statsEmitter.once('myStat', function(stat) {
      stat.should.eql(1);
      done();
    });
    a.recordStat("myStat");
    a.statGenerator.generate.restore();
  });

  it('should be able to get the current value of a stat', function(done) {
    var a = statsLogger.createInstance(60, backend, {}, {});
    sinon.stub(a.statGenerator, 'generate', generateStub);
    a.addStat("myStat", "counter", {initialValue: 12});

    a.statsEmitter.once('myStat', function(stat) {
      stat.should.eql(5);
      a.getStatValue("myStat").should.eql(5);
      done();
    });
    a.recordStat("myStat", 4);

    a.statGenerator.generate.restore();
  });

  it('should be able to start the timer and flush', function(done) {
    var counter = 0, timer;

    var a = statsLogger.createInstance(200, backend, {}, {});
    sinon.stub(a.statGenerator, 'generate', generateStub);
    a.addStat("myStat", "counter", {initialValue: 12});
    a.stats.myStat.statInstance.name.should.eql('counter');
    a.stats.myStat.statInstance.options.initialValue.should.eql(12);
    a.start();


    a.statsEmitter.on('flushProcessed', function(stat) {
      stat.should.match(/^5\s/);
      counter++;
    });

    var emitStat = function() {
      a.recordStat("myStat", 4);
      var timer1 = setTimeout(emitStat, 100);
    };

    emitStat();

    setTimeout(function() {
      clearTimeout(timer);
      a.stop();
      counter.should.eql(5);
      a.statGenerator.generate.restore();
      a.statsEmitter.removeAllListeners('flushProcessed');
      done();
    }, 1050);
  });

  it('should be able to restart the timer', function(done) {
    var counter = 0, timer;

    var a = statsLogger.createInstance(200, backend, {}, {});
    sinon.stub(a.statGenerator, 'generate', generateStub);
    a.addStat("myStat", "counter", {initialValue: 12});
    a.stats.myStat.statInstance.name.should.eql('counter');
    a.stats.myStat.statInstance.options.initialValue.should.eql(12);
    a.start();

    a.statsEmitter.on('flushProcessed', function(stat) {
      stat.should.match(/^5\s/);
      counter++;
    });

    var emitStat = function() {
      a.recordStat("myStat", 4);
      var timer1 = setTimeout(emitStat, 100);
    };

    emitStat();

    setTimeout(function() {
      a.start();
    },500);

    setTimeout(function() {
      clearTimeout(timer);
      a.stop();
      counter.should.eql(6);
      a.statGenerator.generate.restore();
      a.statsEmitter.removeAllListeners('flushProcessed');
      done();
    }, 1150);
  });

  it('should be able to stop the timer', function(done) {
    var counter = 0, timer;

    var a = statsLogger.createInstance(200, backend, {}, {});
    sinon.stub(a.statGenerator, 'generate', generateStub);
    a.addStat("myStat", "counter", {initialValue: 12});
    a.stats.myStat.statInstance.name.should.eql('counter');
    a.stats.myStat.statInstance.options.initialValue.should.eql(12);
    a.start();


    a.statsEmitter.on('flushProcessed', function(stat) {
      stat.should.match(/^5\s/);
      counter++;
      if (counter === 3) {
        a.stop();
      }
    });

    var emitStat = function() {
      a.recordStat("myStat", 4);
      var timer1 = setTimeout(emitStat, 500);
    };

    emitStat();

    setTimeout(function() {
      clearTimeout(timer);
      a.stop();
      counter.should.eql(3);
      a.statGenerator.generate.restore();
      a.statsEmitter.removeAllListeners('flushProcessed');
      done();
    }, 1050);
  });

  it('should be able to manually flush', function(done) {
    var counter = 0, timer;

    var a = statsLogger.createInstance(200, backend, {}, {});
    sinon.stub(a.statGenerator, 'generate', generateStub);
    a.addStat("myStat", "counter", {initialValue: 12});
    a.stats.myStat.statInstance.name.should.eql('counter');
    a.stats.myStat.statInstance.options.initialValue.should.eql(12);

    a.statsEmitter.on('flushProcessed', function(stat) {
      stat.should.match(/^5\s/);
      counter++;
    });

    var emitStat = function() {
      a.recordStat("myStat", 4);
      var timer1 = setTimeout(emitStat, 100);
    };

    setTimeout(function() {
      a.flush();
    }, 500);

    emitStat();

    setTimeout(function() {
      clearTimeout(timer);
      a.stop();
      counter.should.eql(1);
      a.statGenerator.generate.restore();
      a.statsEmitter.removeAllListeners('flushProcessed');
      done();
    }, 1050);
  });

  it('should be able to end', function(done) {
    var counter = 0, timer;

    var a = statsLogger.createInstance(200, backend, {}, {});
    sinon.stub(a.statGenerator, 'generate', generateStub);
    var backendSpy = sinon.spy(a.backend, 'end');
    a.addStat("myStat", "counter", {initialValue: 12});
    a.stats.myStat.statInstance.name.should.eql('counter');
    a.stats.myStat.statInstance.options.initialValue.should.eql(12);
    a.start();

    var emitStat = function() {
      a.recordStat("myStat", 4);
      timer = setTimeout(emitStat, 500);
    };

    a.statsEmitter.on('flushProcessed', function(stat) {
      stat.should.match(/^5\s/);
      counter++;
      if (counter === 3) {
        clearTimeout(timer);
        a.end();
      }
    });
    emitStat();

    setTimeout(function() {
      clearTimeout(timer);
      a.stop();
      backendSpy.callCount.should.eql(1);
      a.backend.end.restore();
      should.not.exist(a.flushTimer);
      counter.should.eql(4);
      a.statGenerator.generate.restore();
      a.statsEmitter.removeAllListeners('flushProcessed');
      done();
    }, 1050);
  });

  it('should be able to specify different flush intervals', function(done) {
    var counter = 0,
      counter2 = 0,
      timer;

    var a = statsLogger.createInstance(200, backend, {}, {});
    var b = statsLogger.createInstance(500, backend, {}, {});
    sinon.stub(a.statGenerator, 'generate', generateStub);
    a.addStat("myStat", "counter", {initialValue: 12});
    b.addStat("myStat2", "counter", {initialValue: 14});
    a.stats.myStat.statInstance.name.should.eql('counter');
    a.stats.myStat.statInstance.options.initialValue.should.eql(12);
    b.stats.myStat2.statInstance.name.should.eql('counter');
    b.stats.myStat2.statInstance.options.initialValue.should.eql(14);
    a.start();
    b.start();


    a.statsEmitter.on('flushProcessed', function(stat) {
      stat.should.match(/^5\s/);
      counter++;
    });

    b.statsEmitter.on('flushProcessed', function(stat) {
      stat.should.match(/^6\s/);
      counter2++;
    });

    var emitStat = function() {
      a.recordStat("myStat", 4);
      b.recordStat("myStat2", 5);
      var timer1 = setTimeout(emitStat, 100);
    };

    emitStat();

    setTimeout(function() {
      clearTimeout(timer);
      a.stop();
      b.stop();
      counter.should.eql(5);
      counter2.should.eql(2);
      a.statGenerator.generate.restore();
      a.statsEmitter.removeAllListeners('flushProcessed');
      b.statsEmitter.removeAllListeners('flushProcessed');
      done();
    }, 1050);
  });

  it('should be able to add a captureFunction', function(done) {
    var a = statsLogger.createInstance(60, backend, {}, {});
    a.addStat("myStat", "counter", {initialValue: 0});
    var value = Math.floor(Math.random() * (10000000));
    a.captureStatOnFlush("myStat", function(){return value;});

    a.statsEmitter.once('myStat', function(stat) {
      stat.should.eql(value);
      done();
    });
    a.flush();
  });

  it.only('should not fail if exception is thrown from  captureFunction', function(done) {
    var a = statsLogger.createInstance(60, backend, {}, {});
    a.addStat("myStat", "counter", {initialValue: 0});
    var value = Math.floor(Math.random() * (10000000));
    var count = 0;
    var error = '';
    a.statsEmitter.once('error', function(message) {
      error = message;
    })
    a.captureStatOnFlush("myStat", function(){
      if (count++ === 0) {
        throw new Error("test");
      }
      return value;
    });

    a.statsEmitter.once('myStat', function(stat) {
      stat.should.eql(value);
      error.should.match(/Error collecting stat on flush/);
      done();
    });
    a.flush();
    a.flush();
  });


});
