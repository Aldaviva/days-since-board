var assert = require('assert-plus');
var db     = require('../data/db');
var Q      = require('q');
var logger = require('../common/logger')(module);
var _      = require('lodash');

var eventsCollection = db.collection('events');

var DEFAULT_SORT = [["date", -1]];

module.exports.insertEvent = function(event){
	var sanitizedEvent = _.omit(event, "id", "_id", "date");
	assert.string(sanitizedEvent.name, "name is required: try POST /cgi-bin/events/foo");
	sanitizedEvent.date = +new Date();

	logger.debug({ event: sanitizedEvent }, "inserting event");

	return Q.ninvoke(eventsCollection, "insert", sanitizedEvent);
};

module.exports.findEvents = function(opts){
	assert.optionalNumber(opts.limit);
	assert.optionalObject(opts.filter);

	var filter = opts.filter || {};
	var sort = opts.sort || DEFAULT_SORT;
	var limit = opts.limit || 0;

	return Q.ninvoke(eventsCollection, "find", filter, { limit: limit, sort: sort })
		.then(function(cursor){
			return Q.ninvoke(cursor, "toArray");
		});
};