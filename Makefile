# Makefile for easy testing

test: all

all: test-StatsLogger \
	test-stats \
	test-fileBackend \
	test-integration

test-StatsLogger:
	@./node_modules/.bin/mocha test/test-StatsLogger.js

test-stats:
	@./node_modules/.bin/mocha test/test-stats.js

test-fileBackend:
	@./node_modules/.bin/mocha test/test-fileBackend.js

test-integration:
	@./node_modules/.bin/mocha test/test-integration.js

.PHONY: test

