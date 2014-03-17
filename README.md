# stats-logger

A lightweight node module for capturing application statistics and writing them to a specified backend.  

The goal of this module is to provide a single consistent interface to capture a wide variety of application statistics, and record those statistics to an independent backend (e.g. a text file stats log, a redis instance, StackDriver, etc.).  

## Installation

```
$ npm install stats-logger
```

## Usage

Once configured, stats are easily tracked by calling recordStat. 

```
var stats = require('stats-logger').createInstance(60000, 'file', {filename: './stats.log', outputFormat: "{lastFlushTime} {myStat1} {myStat2}");

stats.addStat("myStat1", "counter");
stats.addStat("myStat2", "max");
stats.addStat("myStat3", "snapshot");

stats.start();

recordStat("myStat1", 1);
recordStat("myStat2", 15);
recordStat("myStat3", 25);
```

## API

### createInstance(flushInterval, backend, backendConfig, [stats])

Creates an instance of stats logger, with the following arguments:

* `flushInterval` time in ms between flushing stats to the backend
* `backend` the type of backend
* `backendConfig` a JSON object containing backend-specific configuration options
* `stats` an optional JSON object containing stats to be initialized

In this example, a statsLogger is initialized with a flushInterval of 60 seconds, and will output to a file stats.log in the current directory.  A stat called __myStat1__ will be initialized.  

```
var backendConfig = {filename: "./stats.log"", outputFormat: "{lastFlushTime} {lastFlushTimeUnix {myStat1}"};
var initialStats = {myStat1: {type: "counter", options: {initialValue: 1}};

var stats = require('stats-logger').createInstance(60000, 'file', backendConfig, initialStats);
```
### addStat(name, type, options)

Adds a stat to be tracked.  Takes the following arguments:

* `name` the unique of the stat to be tracked
* `type` the type of stat to be tracked
* `options` stat-specific options

```
stats.addStat("myStat", "counter", {initialValue: 1, resetValue: 0});
```

### removeStat(name)

Removes the stat with the specified `name`

### recordStat(name, value)

Records a stat called `name` with the value `value`.  

### getStatValue(name)

Gets the current value of the stat `name`

### start()

Starts the flushing of stats at every time interval specified by `flushInterval`

### stop()
Stops the flushing of stats

### end()

Closes the connection to the backend, and removes all stat tracking

### flush()

Manually flushes stats to the configured backend

## Stat Types

### counter

Increment and decrement by the passed value.  If no value is passed, automatically defaults to incrementing by 1, or by the supplied incrementFactor.  

Options: 

* `initialValue` The initial value of the counter.  Defaults to 0.  
* `resetValue` The value to reset the counter by after each flush.  Defaults to 0.
* `incrementFactor` The value to increment by if no value is passed.  Defaults to 1.
* `suppressReset` if true, then does not reset the counter on flush. Defaults to false.

```
addStat("myStat", "counter", {initialValue: 1, resetValue: 1, incrementFactor: 2});


recordStat("myStat");  // value is now 3
recordStat("myStat");  // value is now 5
recordStat("myStat", 1); // value is now 6
recordStat("myStat", -3); // value is now 3
```

### max

Tracks the maximum value of all values passed during the flush interval.   

Options: 

* `initialValue` The initial value of the counter.  Defaults to null.
* `resetValue` The value to reset the counter by after each flush.  Defaults to null.
* `suppressReset` if true, then does not reset the counter on flush. Defaults to false.

```
addStat("myStat", "max", {initialValue: 1, resetValue: 1});


recordStat("myStat", 3);  // value is 3
recordStat("myStat", 5);  // value is 5
recordStat("myStat", 1); // value is 5
recordStat("myStat", -3); // value is 5
```

### min

Tracks the minimum value of all values passed during the flush interval.   

Options: 

* `initialValue` The initial value of the counter (defaults to ). Defaults to null.
* `resetValue` The value to reset the counter by after each flush.  Defaults to null.
* `suppressReset` if true, then does not reset the counter on flush. Defaults to false.

```
addStat("myStat", "min", {initialValue: 1, resetValue: 1});


recordStat("myStat", 3);  // value is 3
recordStat("myStat", 5);  // value is 3
recordStat("myStat", 1); // value is 1
recordStat("myStat", -3); // value is -3
```

### snapshot

A static value snapshot - set to the value passed at every recording of the stat.  

Options: 

* `initialValue` The initial value of the counter (defaults to ). Defaults to null.
* `resetValue` The value to reset the counter by after each flush.  Defaults to null.
* `suppressReset` if true, then does not reset the counter on flush. Defaults to false.

```
addStat("myStat", "min", {initialValue: 1, resetValue: 1});


recordStat("myStat", 3);  // value is 3
recordStat("myStat", 5);  // value is 5
recordStat("myStat", 1); // value is 1
recordStat("myStat", -3); // value is -3
```

### mean

Calculates the mean of values passed. 

There are two types of means - count means, which calculate the mean as the sum of the values passed / number of times recordStat is invoked, and stat means, which calculate the mean as the sum of the values passed / some other stat that is being tracked.  

* `meanType` 'count' or 'stat', the type of mean.  Defaults to 'count'.  
* `divisorStat` If meanType is 'stat', the name of the stat to use as the divsior.
* `dividendStat` If meanType is 'stat', the name of the stat to use as the dividend
* `initialValue` The initial value of the counter (defaults to ). Defaults to null.
* `resetValue` The value to reset the counter by after each flush.  Defaults to null.
* `suppressReset` if true, then does not reset the counter on flush. Defaults to false.
* `fractionDigits` the number of fracitonal digits to the right of the decimal place to round to

Sample count mean type

```
addStat("myStat", "mean");


recordStat("myStat", 3);  // value is 3 / 1 = 3
recordStat("myStat", 5);  // value is 8 / 2 = 4
recordStat("myStat", 1); // value is 9 / 3 = 3
recordStat("myStat", -3); // value is 6 / 4 = 2.5
```

Sample stat mean type, with only a divisor stat

```
addStat("baseStat", "counter");
addStat("myStat", "mean", {meanType: 'stat', divisorStat: 'baseStat');

recordStat('baseStat', 10);


recordStat("myStat", 30);  // value is 30 / 10 = 3
recordStat("myStat", 20);  // value is 40 / 10 = 5

recordStat("baseStat", 15); // value of baseStat is now 25, and value of myStat is now 2

recordStat("myStat", 25); // value is 75 / 25 = 3
```

Sample stat mean type, with both a divisor and dividend stat

```
addStat("baseStat", "counter");
addStat("baseStat2", "snapshot");
addStat("myStat", "mean", {meanType: 'stat', divisorStat: 'baseStat', dividendStat: 'baseStat2');

recordStat('baseStat', 10);
recordStat('baseStat2', 50); // value is 50 / 10 = 25


recordStat("baseStat2", 30);  // value is 30 / 10 = 3
recordStat("baseStat2", 20);  // value is 20 / 10 = 2

recordStat("baseStat", 20); // value of baseStat is now 20, and value of myStat is now 1

recordStat("baseStat2", 40); // value is 40 / 20 = 2
```

### calculated

Monitors multiple stats and calculates a value based on a provided calculation function

Options:

* `stats` An array of stats to monitor.  The calculation function will be invoked whenever any stat in the array is updated
* `calcFunction` The calculation function, which takes two arguments:
  * stats:  An array consisting of the names of the stats that are part of the calculation
  * statsMap:  an object containing the current value of each stat
* `suppressReset` if true, then does not reset the counter on flush. Defaults to false.

Sample calculated function
```

var calcFunction = function(stats, statsMap) {
  return statsMap.stat1 * statsMap.stat2 / (statsMap.stat3 !== 0 ? statsMap.stat3 : 1);
};

addStat("stat1", "counter");
addStat("stat2", "min");
addStat("stat3", "snapshot");
addStat("calcStat, "calculated, {stats: ['stat1','stat2','stat3], calcFunction: calcFunction});

recordStat("stat1", 25); // value is 25 * null / 1 = null
recordStat("stat2", 10); // value is 25 * 10 / 1 = 200
recordStat("stat2", 15); // value is 25 * 10 / 1 = 200
recordStat("stat3": 25); // value is 25 * 10 / 25 = 10
```

## Backends

### File

The file backend flushes the stats to a file according to a specified string template.

Backend Options:
* `filename` The full path to the log file to be written to
* `outputFormat` The format string used to write stats.  

The `outputFormat` template takes the name of the stat enclosed in {}.  There are also special tags that can be used to output the time the stats were flushed:  

* `lastFlushTime` outputs the date and time in human-readable format
* `lastFlushTimeUnix` outputs the unix timestamp

### StackDriver

The StackDriver backend flushes the stats to StackDriver

Backend Options
* `apiKey` The API Key for accessing the StackDriver stats submission API
* `source` (optional) the name of the Amazon Instance ID to map the stats to, in the format i-XXXXXXXX
* `statsMap` A JSON object containing keys indicating the name of the stats in stats-logger, mapped to the values of StackDriver
  custom metrics


