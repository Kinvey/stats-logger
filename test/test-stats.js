"use strict";

var counter = require('../lib/stats/counter');
var should = require('should');

describe('counter', function() {
  it('should increment the counter', function(done) {
    var a = counter.generate({incrementFactor:1});
    a.setStat(1);
    a.value.should.eql(1);
    a.setStat(1);
    a.value.should.eql(2);
    done();
  });

  it('should increment the counter by the incrementFactor when incrementFactor > 1', function(done) {
    var a = counter.generate({incrementFactor:3});
    a.setStat(1);
    a.value.should.eql(3);
    a.setStat(1);
    a.value.should.eql(6);
    done();
  });

  it('should decrement the counter', function(done) {
    var a = counter.generate({incrementFactor:1});
    a.value = 5;
    a.setStat(0);
    a.value.should.eql(4);
    a.setStat(0);
    a.value.should.eql(3);
    done();
  });

  it('should decrement the counter by the incrementFactor when incrementFactor > 1', function(done) {
    var a = counter.generate({incrementFactor:3});
    a.value = 9;
    a.setStat(0);
    a.value.should.eql(6);
    a.setStat(0);
    a.value.should.eql(3);
    done();
  });

  it('should default to an incrementFactor of 1', function(done) {
    var a = counter.generate();
    a.setStat(1);
    a.setStat(1);
    a.value.should.eql(2);
    done();
  });

  it('should increment if no arguments are passed to setStat', function(done) {
    var a = counter.generate({incrementFactor:1});
    a.setStat();
    a.setStat();
    a.setStat();
    a.value.should.eql(3);
    done();
  });

  it('should increment if a boolean true is passed to setStat', function(done) {
    var a = counter.generate({incrementFactor:1});
    a.setStat(true);
    a.setStat(true);
    a.value.should.eql(2);
    done();
  });

  it('should increment by the incrementFactor if any number other than zero is passed as the argument to setStat', function(done) {
    var a = counter.generate({incrementFactor:1});
    a.setStat(2);
    a.setStat(4);
    a.setStat(6);
    a.setStat(-1);
    a.value.should.eql(4);
    done();
  });

  it('should decrement if a boolean false is passed to setStat', function(done) {
    var a = counter.generate({incrementFactor:1});
    a.setStat(false);
    a.setStat(false);
    a.value.should.eql(-2);
    done();
  });

  it('should decrement if null is passed as argument to setStat', function(done) {
    var a = counter.generate({incrementFactor:1});
    a.setStat(null);
    a.setStat(null);
    a.setStat(null);
    a.value.should.eql(-3);
    done();
  });

  it('should reset the counter value', function(done) {
    var a = counter.generate({incrementFactor:2});
    a.setStat();
    a.setStat();
    a.setStat();
    a.setStat();
    a.value.should.eql(8);
    a.reset();
    a.value.should.eql(0);
    a.increment.should.eql(2);
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

});
