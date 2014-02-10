# Makefile for easy testing

test: all

all: test-StatsLogger

test-StatsLogger:
	@./node_modules/.bin/mocha test/test-StatsLogger.js

.PHONY: test

