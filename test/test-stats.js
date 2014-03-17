"use strict";

var stat = require('../lib/stat');
var counter = require('../lib/stats/counter');
var max = require('../lib/stats/max');
var min = require('../lib/stats/min');
var mean = require('../lib/stats/mean');
var snapshot = require('../lib/stats/snapshot');
var calculated = require('../lib/stats/calculated');
var EventEmitter = require('events').EventEmitter;
var should = require('should');
var sinon = require('sinon');

describe('stat generator', function(done) {
  it('should generate a counter', function(done) {
    var a = stat.generate('counter');
    a.statInstance.name.should.eql('counter');
    done();
  });

  it('should generate a counter with options', function(done) {
    var a = stat.generate('counter', {initialValue: 100, resetValue:1});
    a.statInstance.name.should.eql('counter');
    a.statInstance.value.should.eql(100);
    a.statInstance.resetValue.should.eql(1);
    done();
  });

  it('should call the setStat method of a counter', function(done) {
    var a = stat.generate('counter');
    var spy = sinon.spy(a.statInstance, 'setStat');
    a.setStat(1);
    a.setStat(2);
    a.setStat(5);
    spy.callCount.should.eql(3);
    a.statInstance.setStat.restore();
    done();
  });

  it('should call the reset method of a counter', function(done) {
    var a = stat.generate('counter');
    var spy = sinon.spy(a.statInstance, 'reset');
    a.setStat(1);
    a.setStat(2);
    a.setStat(5);
    a.reset();
    spy.callCount.should.eql(1);
    a.statInstance.reset.restore();
    done();
  });

  it('should return the value of the counter when calling toString', function(done) {
    var a = stat.generate('counter');
    a.setStat(5);
    a.setStat(3);
    a.toString().should.eql(8);
    done();
  });

  it('should generate a min', function(done) {
    var a = stat.generate('min');
    a.statInstance.name.should.eql('min');
    done();
  });

  it('should generate a min with options', function(done) {
    var a = stat.generate('min', {initialValue: 100, resetValue: 1});
    a.statInstance.name.should.eql('min');
    a.statInstance.value.should.eql(100);
    a.statInstance.resetValue.should.eql(1);
    done();
  });

  it('should call the setStat method of a min', function(done) {
    var a = stat.generate('min');
    var spy = sinon.spy(a.statInstance, 'setStat');
    a.setStat(1);
    spy.callCount.should.eql(1);
    a.statInstance.setStat.restore();
    done();
  });

  it('should call the reset method of a min', function(done) {
    var a = stat.generate('min');
    var spy = sinon.spy(a.statInstance, 'reset');
    a.setStat(1);
    a.setStat(2);
    a.setStat(5);
    a.reset();
    spy.callCount.should.eql(1);
    a.statInstance.reset.restore();
    done();
  });

  it('should return the value of the min when calling toString', function(done) {
    var a = stat.generate('min');
    a.setStat(5);
    a.setStat(4);
    a.setStat(6);
    a.toString().should.eql(4);
    done();
  });

  it('should generate a max', function(done) {
    var a = stat.generate('max');
    a.statInstance.name.should.eql('max');
    done();
  });

  it('should generate a max with options', function(done) {
    var a = stat.generate('max', {initialValue: 100, resetValue:1});
    a.statInstance.name.should.eql('max');
    a.statInstance.value.should.eql(100);
    a.statInstance.resetValue.should.eql(1);
    done();
  });

  it('should call the setStat method of the max', function(done) {
    var a = stat.generate('max');
    var spy = sinon.spy(a.statInstance, 'setStat');
    a.setStat(1);
    a.setStat(2);
    spy.callCount.should.eql(2);
    a.statInstance.setStat.restore();
    done();
  });

  it('should call the reset method of a max', function(done) {
    var a = stat.generate('max');
    var spy = sinon.spy(a.statInstance, 'reset');
    a.setStat(1);
    a.setStat(2);
    a.setStat(5);
    a.reset();
    spy.callCount.should.eql(1);
    a.statInstance.reset.restore();
    done();
  });

  it('should return the value of the max when calling toString', function(done) {
    var a = stat.generate('max');
    a.setStat(5);
    a.setStat(4);
    a.setStat(7);
    a.toString().should.eql(7);
    done();
  });

  it('should generate a mean', function(done) {
    var a = stat.generate('mean');
    a.statInstance.name.should.eql('mean');
    done();
  });

  it('should generate a mean with options', function(done) {
    var emitter = new EventEmitter();
    var a = stat.generate('mean', {meanType: 'stat', emitter: emitter, divisorStat: 'requests'});
    a.statInstance.name.should.eql('mean');
    a.statInstance.type.should.eql('stat');
    a.statInstance.divisorStat.should.eql('requests');
    done();
  });

  it('should call the setStat method of the mean', function(done) {
    var a = stat.generate('mean');
    var spy = sinon.spy(a.statInstance, 'setStat');
    a.setStat(1);
    a.setStat(2);
    spy.callCount.should.eql(2);
    a.statInstance.setStat.restore();
    done();
  });

  it('should call the reset method of a mean', function(done) {
    var a = stat.generate('mean');
    var spy = sinon.spy(a.statInstance, 'reset');
    a.setStat(1);
    a.setStat(2);
    a.setStat(5);
    a.reset();
    spy.callCount.should.eql(1);
    a.statInstance.reset.restore();
    done();
  });

  it('should return the value of the mean when calling toString', function(done) {
    var a = stat.generate('mean');
    a.setStat(5);
    a.setStat(15)
    a.toString().should.eql(10);
    done();
  });

  it('should generate a calculated stat', function(done) {
    var a = stat.generate('calculated');
    a.statInstance.name.should.eql('calculated');
    done();
  });

  it('should generate a calculated stat with options', function(done) {
    var emitter = new EventEmitter();
    var calcFunction = function() {
      return "calculated";
    };
    var a = stat.generate('calculated', {stats: ['stat1', 'stat2', 'stat3'], emitter: emitter, calcFunction: calcFunction});
    a.statInstance.name.should.eql('calculated');
    a.statInstance.stats.should.eql(['stat1', 'stat2', 'stat3']);
    a.statInstance.calcFunction().should.eql("calculated");
    done();
  });

  it('should call the setStat method of the calculated stat', function(done) {
    var a = stat.generate('calculated', {stats: ['stat1','stat2']});
    var spy = sinon.spy(a.statInstance, 'setStat');
    a.setStat('stat1', 1);
    a.setStat('stat2', 2);
    spy.callCount.should.eql(2);
    a.statInstance.setStat.restore();
    done();
  });

  it('should call the reset method of a calculated stat', function(done) {
    var a = stat.generate('calculated', {stats: ['stat1', 'stat2']});
    var spy = sinon.spy(a.statInstance, 'reset');
    a.setStat('stat1', 1);
    a.setStat('stat2', 2);
    a.setStat('stat1', 5);
    a.reset();
    spy.callCount.should.eql(1);
    a.statInstance.reset.restore();
    done();
  });

  it('should return the value of the calculation when calling toString', function(done) {
    var calcFunction = function(stats, statsMap){
      var total = 1;
      stats.forEach(function(stat) {
        if (statsMap[stat] || statsMap[stat] === 0) {
          total *= statsMap[stat];
        }
      });

      return total;
    };

    var a = stat.generate('calculated', {stats: ['stat1','stat2'], calcFunction: calcFunction });
    a.setStat('stat1', 5);
    a.setStat('stat2', 25);
    a.toString().should.eql(125);
    done();
  });

  it('should generate a snapshot', function(done) {
    var a = stat.generate('snapshot');
    a.statInstance.name.should.eql('snapshot');
    done();
  });

  it('should generate a snapshot with options', function(done) {
    var a = stat.generate('snapshot', {initialValue: 100, resetValue: 10});
    a.statInstance.name.should.eql('snapshot');
    a.statInstance.value.should.eql(100);
    a.statInstance.resetValue.should.eql(10);
    done();
  });

  it('should call the setStat method of the snapshot', function(done) {
    var a = stat.generate('snapshot');
    var spy = sinon.spy(a.statInstance, 'setStat');
    a.setStat(1);
    spy.callCount.should.eql(1);
    a.statInstance.setStat.restore();
    done();
  });

  it('should call the reset method of a snapshot', function(done) {
    var a = stat.generate('snapshot');
    var spy = sinon.spy(a.statInstance, 'reset');
    a.setStat(1);
    a.setStat(2);
    a.setStat(5);
    a.reset();
    spy.callCount.should.eql(1);
    a.statInstance.reset.restore();
    done();
  });

  it('should return the value of the snapshot when calling toString', function(done) {
    var a = stat.generate('snapshot');
    a.setStat(5);
    a.toString().should.eql(5);
    done();
  });
});

describe('counter', function() {
  it('should increment the counter', function(done) {
    var a = counter.generate();
    a.setStat(1);
    a.value.should.eql(1);
    a.setStat(1);
    a.value.should.eql(2);
    done();
  });

  it('should increment the counter by different values', function(done) {
    var a = counter.generate();
    a.setStat(1);
    a.value.should.eql(1);
    a.setStat(3);
    a.value.should.eql(4);
    done();
  });

  it('should decrement the counter', function(done) {
    var a = counter.generate();
    a.value = 5;
    a.setStat(-1);
    a.value.should.eql(4);
    a.setStat(-3);
    a.value.should.eql(1);
    done();
  });

  it('should increment by 1 if no arguments are passed to setStat', function(done) {
    var a = counter.generate();
    a.setStat();
    a.setStat();
    a.setStat();
    a.value.should.eql(3);
    done();
  });

  it('should not increment or decrement if null is passed as argument to setStat', function(done) {
    var a = counter.generate();
    a.setStat(1);
    a.setStat(null);
    a.setStat(null);
    a.value.should.eql(1);
    done();
  });

  it('should not increment or decrement if 0 is passed as argument to setStat', function(done) {
    var a = counter.generate();
    a.setStat();
    a.setStat();
    a.setStat(0);
    a.value.should.eql(2);
    done();
  });

  it('should reset the counter value', function(done) {
    var a = counter.generate();
    a.setStat();
    a.setStat();
    a.setStat();
    a.setStat();
    a.value.should.eql(4);
    a.reset();
    a.value.should.eql(0);
    done();
  });

  it('should not reset the counter value if suppressed', function(done) {
    var a = counter.generate({suppressReset: true});
    a.setStat();
    a.setStat();
    a.setStat();
    a.setStat();
    a.value.should.eql(4);
    a.reset();
    a.value.should.eql(4);
    done();
  });

  it('should be able to set an initial value other than 0', function(done) {
    var a = counter.generate({initialValue: 100});
    a.setStat();
    a.setStat();
    a.setStat();
    a.value.should.eql(103);
    done();
  });

  it('should be able to set a reset value other than 0', function(done) {
    var a = counter.generate({resetValue: 100});
    a.setStat();
    a.setStat();
    a.setStat();
    a.value.should.eql(3);
    a.reset();
    a.value.should.eql(100);
    done();
  });

});

describe('max', function() {
  it('should keep track of the max value', function(done) {
    var a = max.generate();
    a.setStat(3);
    a.setStat(5);
    a.setStat(9);
    a.setStat(12);
    a.setStat(2);
    a.setStat(-5);
    a.setStat(11);
    a.value.should.eql(12);
    done();
  });

  it('should keep track of the max value for negative numbers', function(done) {
    var a = max.generate();
    a.setStat(-12);
    a.setStat(-5);
    a.setStat(-212);
    a.setStat(-53);
    a.value.should.eql(-5);
    done();
  });

  it('should ignore null stats', function(done) {
    var a = max.generate();
    a.setStat(null);
    a.setStat(5);
    a.setStat(-8);
    a.setStat(-6);
    a.setStat(null);
    a.value.should.eql(5);
    done();
  });

  it('should ignore null stats when the max is < 0', function(done) {
    var a = max.generate();
    a.setStat(-5);
    a.setStat(-3);
    a.setStat(-15);
    a.setStat(null);
    a.value.should.eql(-3);
    done();
  });

  it('should take into account a max value of 0', function(done) {
    var a = max.generate();
    a.setStat(-3);
    a.setStat(-5);
    a.setStat(0);
    a.value.should.eql(0);
    done();
  });

  it('should reset the max value', function(done) {
    var a = max.generate();
    a.setStat(5);
    a.setStat(8);
    a.setStat(3);
    a.value.should.eql(8);
    a.reset();
    should.not.exist(a.value);
    done();
  });

  it('should not reset the max value if suppressed', function(done) {
    var a = max.generate({suppressReset: true});
    a.setStat(5);
    a.setStat(8);
    a.setStat(3);
    a.value.should.eql(8);
    a.reset();
    a.value.should.eql(8);
    done();
  });

  it('should be able to set an initial value other than 0', function(done) {
    var a = max.generate({initialValue: 100});
    a.setStat(30);
    a.setStat(25);
    a.setStat(60);
    a.value.should.eql(100);
    a.setStat(215);
    a.value.should.eql(215);
    done();
  });

  it('should be able to set an initial value of 0', function(done) {
    var a = max.generate({initialValue: 0});
    a.value.should.eql(0);
    done();
  });

  it('should be able to set a reset value other than 0', function(done) {
    var a = max.generate({resetValue: 100});
    a.setStat(24);
    a.setStat(50);
    a.setStat(32);
    a.value.should.eql(50);
    a.reset();
    a.value.should.eql(100);
    done();
  });

  it('should be able to set a reset value of 0', function(done) {
    var a = max.generate({resetValue: 0});
    a.setStat(24);
    a.setStat(50);
    a.setStat(32);
    a.value.should.eql(50);
    a.reset();
    a.value.should.eql(0);
    done();
  });
});

describe('min', function() {
  it('should keep track of the min value', function(done) {
    var a = min.generate();
    a.setStat(3);
    a.setStat(5);
    a.setStat(9);
    a.setStat(12);
    a.setStat(2);
    a.setStat(-5);
    a.setStat(11);
    a.value.should.eql(-5);
    done();
  });

  it('should keep track of the max value for negative numbers', function(done) {
    var a = min.generate();
    a.setStat(-12);
    a.setStat(-5);
    a.setStat(-212);
    a.setStat(-53);
    a.value.should.eql(-212);
    done();
  });

  it('should ignore null stats', function(done) {
    var a = min.generate();
    a.setStat(null);
    a.setStat(5);
    a.setStat(-8);
    a.setStat(-6);
    a.setStat(null);
    a.value.should.eql(-8);
    done();
  });

  it('should ignore null stats when the max is < 0', function(done) {
    var a = min.generate();
    a.setStat(-5);
    a.setStat(-3);
    a.setStat(-15);
    a.setStat(null);
    a.value.should.eql(-15);
    done();
  });

  it('should take into account a min value of 0', function(done) {
    var a = min.generate();
    a.setStat(3);
    a.setStat(5);
    a.setStat(0);
    a.value.should.eql(0);
    done();
  });

  it('should reset the min value', function(done) {
    var a = min.generate();
    a.setStat(5);
    a.setStat(8);
    a.setStat(3);
    a.value.should.eql(3);
    a.reset();
    should.not.exist(a.value);
    done();
  });

  it('should not reset the min value if suppressed', function(done) {
    var a = min.generate({suppressReset: true});
    a.setStat(5);
    a.setStat(8);
    a.setStat(3);
    a.value.should.eql(3);
    a.reset();
    a.value.should.eql(3);
    done();
  });

  it('should be able to set an initial value of 0', function(done) {
    var a = min.generate({initialValue: 0});
    a.value.should.eql(0);
    done();
  });

  it('should be able to set an initial value other than 0', function(done) {
    var a = min.generate({initialValue: 100});
    a.value.should.eql(100);
    done();
  });

  it('should be able to set a reset value other than 0', function(done) {
    var a = min.generate({resetValue: 100});
    a.setStat(24);
    a.setStat(50);
    a.setStat(32);
    a.value.should.eql(24);
    a.reset();
    a.value.should.eql(100);
    done();
  });

  it('should be able to set a reset value of 0', function(done) {
    var a = min.generate({resetValue: 0});
    a.setStat(24);
    a.setStat(50);
    a.setStat(32);
    a.value.should.eql(24);
    a.reset();
    a.value.should.eql(0);
    done();
  });
});

describe('mean', function() {
  it('should be able to calculate the mean of several values', function(done) {
    var a = mean.generate();
    a.setStat(10);
    a.setStat(25);
    a.setStat(10);
    a.setStat(3);
    a.value.should.eql(12);
    done();
  });

  it('should be able to calculate decimal means of several values', function(done) {
    var a = mean.generate();
    a.setStat(10);
    a.setStat(5);
    a.setStat(4);
    a.value.should.be.approximately(6.333,0.001);
    done();
  });

  it('should be able to calculate the mean when the sum is zero', function(done) {
    var a = mean.generate();
    a.setStat(10);
    a.setStat(-10);
    a.value.should.eql(0);
    done();
  });

  it('should ignore null values', function(done){
    var a = mean.generate();
    a.setStat(15);
    a.setStat(5);
    a.setStat(null);
    a.value.should.eql(10);
    done();
  });

  it('should ignore undefined values', function(done) {
    var a = mean.generate();
    a.setStat(15);
    a.setStat(5);
    a.setStat();
    a.value.should.eql(10);
    done();
  });

  it('should calculate mean as a count if explicitly declared', function(done) {
    var a = mean.generate({meanType: 'count'});
    a.setStat(15);
    a.setStat(5);
    a.setStat(3);
    a.setStat(5);
    a.setStat(-3);
    a.value.should.eql(5);
    done();
  });

  it('should set an initial value for a mean other than 0', function(done) {
    var emitter = new EventEmitter();
    var a = stat.generate('mean', {meanType: 'stat', emitter: emitter, divisorStat: 'requests', initialValue:  100});
    a.statInstance.value.should.eql(100);
    done();
  });

  it('should set an initial value for a mean of 0', function(done) {
    var emitter = new EventEmitter();
    var a = stat.generate('mean', {meanType: 'stat', emitter: emitter, divisorStat: 'requests', initialValue:  0});
    a.statInstance.value.should.eql(0);
    done();
  });

  it('should set a reset value for a mean other than 0', function(done) {
    var emitter = new EventEmitter();
    var a = stat.generate('mean', {resetValue:  100});
    a.setStat(10);
    a.setStat(20);
    a.setStat(30);
    a.statInstance.value.should.eql(20);
    a.reset();
    a.statInstance.value.should.eql(100);
    done();
  });

  it('should set a reset value for a mean of 0', function(done) {
    var a = stat.generate('mean', {resetValue:  0});
    a.setStat(10);
    a.setStat(20);
    a.setStat(30);
    a.statInstance.value.should.eql(20);
    a.reset();
    a.statInstance.value.should.eql(0);
    done();
  });

  it('should reset a count mean', function(done) {
    var a = mean.generate({meanType: 'count'});
    a.setStat(15);
    a.setStat(5);
    a.value.should.eql(10);
    a.reset();
    should.not.exist(a.value);
    a.setStat(25);
    a.setStat(25);
    a.value.should.eql(25);
    done();
  });

  it('should not reset a count mean if suppressed', function(done) {
    var a = mean.generate({meanType: 'count', suppressReset: true});
    a.setStat(15);
    a.setStat(5);
    a.value.should.eql(10);
    a.reset();
    a.value.should.eql(10);
    a.setStat(25);
    a.setStat(25);
    a.value.should.eql(17.5);
    done();
  });

  it('should calculate mean from another stat with legacy statName', function(done) {
    var emitter = new EventEmitter();
    var a = mean.generate({meanType: 'stat', statName: 'requests', emitter: emitter});
    a.setStat(15);
    a.setStat(10);
    a.setStat(100);
    emitter.emit('requests', 25);
    a.value.should.eql(5);
    done();
  });

  it('should calculate mean from another stat with divisorStat', function(done) {
    var emitter = new EventEmitter();
    var a = mean.generate({meanType: 'stat', divisorStat: 'requests', emitter: emitter});
    a.setStat(15);
    a.setStat(10);
    a.setStat(100);
    emitter.emit('requests', 25);
    a.value.should.eql(5);
    done();
  });

  it('should calculate mean from two other stats', function(done) {
    var emitter = new EventEmitter();
    var a = mean.generate({meanType: 'stat', divisorStat: 'requests', dividendStat: 'time', emitter: emitter});
    emitter.emit('time', 100);
    emitter.emit('requests', 25);
    a.value.should.eql(4);
    emitter.emit('requests', 10);
    a.value.should.eql(10);
    emitter.emit('time', 50);
    a.value.should.eql(5);
    done();
  });

  it('should round a stat to a whole number if fractionDigits is set to 0', function(done) {
    var emitter = new EventEmitter();
    var a = mean.generate({meanType: 'stat', divisorStat: 'requests', emitter: emitter, fractionDigits: 0});
    a.setStat(15);
    a.setStat(10);
    a.setStat(100);
    emitter.emit('requests', 13);
    a.value.should.eql(10);
    done();
  });

  it('should set decimal precision a stat if precisionType is a number other than 0', function(done) {
    var emitter = new EventEmitter();
    var a = mean.generate({meanType: 'stat', divisorStat: 'requests', emitter: emitter, fractionDigits: 2});
    a.setStat(15);
    a.setStat(10);
    a.setStat(100);
    emitter.emit('requests', 13);
    a.value.should.eql(9.62);
    done();
  });

  it('should change value for stat mean if the stat changes', function(done) {
    var emitter = new EventEmitter();
    var a = mean.generate({meanType: 'stat', divisorStat: 'requests', emitter: emitter});
    a.setStat(15);
    a.setStat(10);
    a.setStat(100);
    emitter.emit('requests', 25);
    a.value.should.eql(5);
    emitter.emit('requests', 10);
    a.value.should.eql(12.5);
    done();
  });

  it('should change value for stat mean if the dividend changes', function(done) {
    var emitter = new EventEmitter();
    var a = mean.generate({meanType: 'stat', divisorStat: 'requests', emitter: emitter});
    a.setStat(15);
    a.setStat(10);
    a.setStat(100);
    emitter.emit('requests', 25);
    a.value.should.eql(5);
    a.setStat(25);
    a.value.should.eql(6);
    done();
  });

  it('should emit an error for stat type if options do not include a divisorStat', function(done) {
    var emitter = new EventEmitter();
    process.once('error', function(err) {
      err.message.should.eql("meanType of stat requires an emitter and divisorStat");
      should.not.exist(a);
      done();
    });
    var a = mean.generate({meanType: 'stat', emitter: emitter});

  });

  it('should emit an error for stat type if options do not include an event emitter', function(done) {
    var emitter = new EventEmitter();
    process.once('error', function(err) {
      err.message.should.eql("meanType of stat requires an emitter and divisorStat");
      should.not.exist(a);
      done();
    });
    var a = mean.generate({meanType: 'stat', statName: 'request'});

  });

  it('should reset a stat mean but keep the divisor', function(done) {
    var emitter = new EventEmitter();
    var a = mean.generate({meanType: 'stat', statName: 'requests', emitter: emitter});
    a.setStat(15);
    a.setStat(10);
    a.setStat(100);
    emitter.emit('requests', 25);
    a.value.should.eql(5);
    a.reset();
    should.not.exist(a.value);
    a.setStat(50);
    a.value.should.eql(2);
    done();
  });

  it('should not reset a stat mean if suppressed', function(done) {
    var emitter = new EventEmitter();
    var a = mean.generate({meanType: 'stat', statName: 'requests', emitter: emitter, suppressReset: true});
    a.setStat(15);
    a.setStat(10);
    a.setStat(100);
    emitter.emit('requests', 25);
    a.value.should.eql(5);
    a.reset();
    a.setStat(50);
    a.value.should.eql(7);
    done();
  });

  it('should reset a stat mean and continue to receive stat events', function(done) {
    var emitter = new EventEmitter();
    var a = mean.generate({meanType: 'stat', statName: 'requests', emitter: emitter});
    a.setStat(15);
    a.setStat(10);
    a.setStat(100);
    emitter.emit('requests', 25);
    a.value.should.eql(5);
    a.reset();
    should.not.exist(a.value);
    emitter.emit('requests', 100);
    emitter.emit('requests', 50);
    a.setStat(150);
    a.value.should.eql(3);
    done();
  });
});

describe('calculated', function() {

  it('should ignore null values', function(done){
    var emitter = new EventEmitter();

    var calcFunction = function(stats, statsMap){
      stats.forEach(function(stat){
        if (typeof statsMap[stat] === 'undefined' || statsMap[stat] === null) {
          return null;
        }
      });

      return statsMap.stat1 * statsMap.stat2 / (statsMap.stat3 !== 0 ? statsMap.stat3 : 1);
    };

    var a = calculated.generate({stats: ['stat1', 'stat2', 'stat3', 'stat4'], calcFunction: calcFunction, emitter: emitter});

    emitter.emit('stat1', 10);
    emitter.emit('stat2', 20);
    emitter.emit('stat3', 25);
    a.value.should.eql(8);
    emitter.emit('stat1', null);
    a.value.should.eql(8);
    done();
  });

  it('should ignore undefined values', function(done) {
    var emitter = new EventEmitter();

    var calcFunction = function(stats, statsMap){
      stats.forEach(function(stat){
        if (typeof statsMap[stat] === 'undefined' || statsMap[stat] === null) {
          return null;
        }
      });

      return statsMap.stat1 * statsMap.stat2 / (statsMap.stat3 !== 0 ? statsMap.stat3 : 1);
    };

    var a = calculated.generate({stats: ['stat1', 'stat2', 'stat3', 'stat4'], calcFunction: calcFunction, emitter: emitter});

    emitter.emit('stat1', 10);
    emitter.emit('stat2', 20);
    emitter.emit('stat3', 25);
    a.value.should.eql(8);
    emitter.emit('stat1');
    a.value.should.eql(8);
    done();
  });

  it('should calculate a value from multiple stats', function(done) {
    var emitter = new EventEmitter();

    var calcFunction = function(stats, statsMap){
      stats.forEach(function(stat){
        if (typeof statsMap[stat] === 'undefined' || statsMap[stat] === null) {
          return null;
        }
      });

      return statsMap.stat1 * statsMap.stat2 / (statsMap.stat3 !== 0 ? statsMap.stat3 : 1);
    };

    var a = calculated.generate({stats: ['stat1', 'stat2', 'stat3', 'stat4'], calcFunction: calcFunction, emitter: emitter});
    emitter.emit('stat1', 10);
    emitter.emit('stat2', 20);
    emitter.emit('stat3', 25);
    a.value.should.eql(8);
    done();
  });

  it('should change value for stat calculations if the stat changes', function(done) {
    var emitter = new EventEmitter();

    var calcFunction = function(stats, statsMap){
      stats.forEach(function(stat){
        if (typeof statsMap[stat] === 'undefined' || statsMap[stat] === null) {
          return null;
        }
      });

      return statsMap.stat1 * statsMap.stat2 / (statsMap.stat3 !== 0 ? statsMap.stat3 : 1);
    };

    var a = calculated.generate({stats: ['stat1', 'stat2', 'stat3', 'stat4'], calcFunction: calcFunction, emitter: emitter});

    emitter.emit('stat1',15);
    emitter.emit('stat2',10);
    emitter.emit('stat3',100);
    a.value.should.eql(1.5);
    emitter.emit('stat1', 20);
    a.value.should.eql(2);
    done();
  });

  it('should set an intial value to 0', function(done) {
    var emitter = new EventEmitter();

    var calcFunction = function(stats, statsMap){
      stats.forEach(function(stat){
        if (typeof statsMap[stat] === 'undefined' || statsMap[stat] === null) {
          return null;
        }
      });

      return statsMap.stat1 * statsMap.stat2 / (statsMap.stat3 !== 0 ? statsMap.stat3 : 1);
    };

    var a = calculated.generate({initialValue: 0, stats: ['stat1', 'stat2', 'stat3', 'stat4'], calcFunction: calcFunction, emitter: emitter});

    a.value.should.eql(0);
    done();
  });

  it('should set an intial value other than 0', function(done) {
    var emitter = new EventEmitter();

    var calcFunction = function(stats, statsMap){
      stats.forEach(function(stat){
        if (typeof statsMap[stat] === 'undefined' || statsMap[stat] === null) {
          return null;
        }
      });

      return statsMap.stat1 * statsMap.stat2 / (statsMap.stat3 !== 0 ? statsMap.stat3 : 1);
    };

    var a = calculated.generate({initialValue: 10, stats: ['stat1', 'stat2', 'stat3', 'stat4'], calcFunction: calcFunction, emitter: emitter});

    a.value.should.eql(10);
    done();
  });


  it('should reset a calculation stat', function(done) {
    var emitter = new EventEmitter();

    var calcFunction = function(stats, statsMap){
      stats.forEach(function(stat){
        if (typeof statsMap[stat] === 'undefined' || statsMap[stat] === null) {
          return null;
        }
      });

      return statsMap.stat1 * statsMap.stat2 / (statsMap.stat3 !== 0 ? statsMap.stat3 : 1);
    };

    var a = calculated.generate({stats: ['stat1', 'stat2', 'stat3', 'stat4'], calcFunction: calcFunction, emitter: emitter});

    emitter.emit('stat1',15);
    emitter.emit('stat2',10);
    emitter.emit('stat3',100);
    a.value.should.eql(1.5);
    a.reset();
    should.not.exist(a.value);
    should.not.exist(a.statMap.stat1);
    should.not.exist(a.statMap.stat2);
    should.not.exist(a.statMap.stat3);
    done();
  });

  it('should reset a calculation stat to a resetValue of 0', function(done) {
    var emitter = new EventEmitter();

    var calcFunction = function(stats, statsMap){
      stats.forEach(function(stat){
        if (typeof statsMap[stat] === 'undefined' || statsMap[stat] === null) {
          return null;
        }
      });

      return statsMap.stat1 * statsMap.stat2 / (statsMap.stat3 !== 0 ? statsMap.stat3 : 1);
    };

    var a = calculated.generate({resetValue: 0, stats: ['stat1', 'stat2', 'stat3', 'stat4'], calcFunction: calcFunction, emitter: emitter});

    emitter.emit('stat1',15);
    emitter.emit('stat2',10);
    emitter.emit('stat3',100);
    a.value.should.eql(1.5);
    a.reset();
    a.value.should.eql(0);
    should.not.exist(a.statMap.stat1);
    should.not.exist(a.statMap.stat2);
    should.not.exist(a.statMap.stat3);
    done();
  });

  it('should reset a calculation stat to a resetValue other than 0', function(done) {
    var emitter = new EventEmitter();

    var calcFunction = function(stats, statsMap){
      stats.forEach(function(stat){
        if (typeof statsMap[stat] === 'undefined' || statsMap[stat] === null) {
          return null;
        }
      });

      return statsMap.stat1 * statsMap.stat2 / (statsMap.stat3 !== 0 ? statsMap.stat3 : 1);
    };

    var a = calculated.generate({resetValue: 10, stats: ['stat1', 'stat2', 'stat3', 'stat4'], calcFunction: calcFunction, emitter: emitter});

    emitter.emit('stat1',15);
    emitter.emit('stat2',10);
    emitter.emit('stat3',100);
    a.value.should.eql(1.5);
    a.reset();
    a.value.should.eql(10);
    should.not.exist(a.statMap.stat1);
    should.not.exist(a.statMap.stat2);
    should.not.exist(a.statMap.stat3);
    done();
  });

  it('should not reset a stat calculation if suppressed', function(done) {
    var emitter = new EventEmitter();

    var calcFunction = function(stats, statsMap){
      stats.forEach(function(stat){
        if (typeof statsMap[stat] === 'undefined' || statsMap[stat] === null) {
          return null;
        }
      });

      return statsMap.stat1 * statsMap.stat2 / (statsMap.stat3 !== 0 ? statsMap.stat3 : 1);
    };

    var a = calculated.generate({stats: ['stat1', 'stat2', 'stat3', 'stat4'], suppressReset: true, calcFunction: calcFunction, emitter: emitter});

    emitter.emit('stat1',15);
    emitter.emit('stat2',10);
    emitter.emit('stat3',100);
    a.value.should.eql(1.5);
    a.reset();
    a.value.should.eql(1.5);
    done();
  });

  it('should reset a calculated stat and continue to receive stat events', function(done) {
    var emitter = new EventEmitter();

    var calcFunction = function(stats, statsMap){
      stats.forEach(function(stat){
        if (typeof statsMap[stat] === 'undefined' || statsMap[stat] === null) {
          return null;
        }
      });

      return statsMap.stat1 * statsMap.stat2 / (statsMap.stat3 !== 0 ? statsMap.stat3 : 1);
    };

    var a = calculated.generate({stats: ['stat1', 'stat2', 'stat3', 'stat4'], calcFunction: calcFunction, emitter: emitter});

    emitter.emit('stat1',15);
    emitter.emit('stat2',10);
    emitter.emit('stat3',100);
    a.value.should.eql(1.5);
    a.reset();
    should.not.exist(a.value);
    emitter.emit('stat1', 100);
    emitter.emit('stat2', 5);
    emitter.emit('stat3', 50)
    a.value.should.eql(10);
    done();
  });
});

describe('snapshot', function() {
  it('should keep track of the most recent value', function(done) {
    var a = snapshot.generate();
    a.setStat(10);
    a.setStat(20);
    a.setStat(15);
    a.value.should.eql(15);
    a.setStat(25);
    a.value.should.eql(25);
    a.setStat(10);
    a.value.should.eql(10);
    done()
  });

  it('should allow negative values', function(done) {
    var a = snapshot.generate();
    a.setStat(-15);
    a.setStat(-5);
    a.value.should.eql(-5);
    done();
  });

  it('should allow a zero value', function(done) {
    var a = snapshot.generate();
    a.setStat(5);
    a.setStat(-5);
    a.setStat(0);
    a.value.should.eql(0);
    done();
  });

  it('should allow a null value to be set', function(done) {
    var a = snapshot.generate();
    a.setStat(15);
    a.value.should.eql(15);
    a.setStat(null);
    should.not.exist(a.value);
    done();
  });

  it('should ignore undefined values', function(done) {
    var a = snapshot.generate();
    a.setStat(15);
    a.setStat();
    a.value.should.eql(15);
    done();
  });

  it('should allow string values', function(done) {
    var a = snapshot.generate();
    a.setStat(15);
    a.setStat("Hello");
    a.value.should.eql("Hello");
    done();
  });

  it('should allow an initial value to be set to a value other than 0', function(done) {
    var a = snapshot.generate({initialValue: 100});
    a.value.should.eql(100);
    a.setStat(105);
    a.value.should.eql(105);
    done();
  });

  it('should allow an initial value to be set to a value of 0', function(done) {
    var a = snapshot.generate({initialValue: 0});
    a.value.should.eql(0);
    a.setStat(105);
    a.value.should.eql(105);
    done();
  });

  it('should allow reset value to be set to a value other than 0', function(done) {
    var a = snapshot.generate({resetValue: 1000});
    should.not.exist(a.value);
    a.setStat(105);
    a.value.should.eql(105);
    a.reset();
    a.value.should.eql(1000);
    done();
  });

  it('should allow reset value to be set to a value of 0', function(done) {
    var a = snapshot.generate({resetValue: 0});
    should.not.exist(a.value);
    a.setStat(105);
    a.value.should.eql(105);
    a.reset();
    a.value.should.eql(0);
    done();
  });

  it('should not reset value if suppressed', function(done) {
    var a = snapshot.generate({resetValue: 1000, suppressReset: true});
    should.not.exist(a.value);
    a.setStat(105);
    a.value.should.eql(105);
    a.reset();
    a.value.should.eql(105);
    done();
  });
});
