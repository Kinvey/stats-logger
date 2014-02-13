# Makefile for easy testing

test: all

all: test-StatsLogger \
	test-stats \
	test-backends

test-StatsLogger:
	@./node_modules/.bin/mocha test/test-StatsLogger.js

test-stats:
	@./node_modules/.bin/mocha test/test-stats.js

test-backends:
	@./node_modules/.bin/mocha test/test-backends.js

.PHONY: test

