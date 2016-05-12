var _            = require('lodash');
var apiServer    = require('./apiServer');
var assert       = require('assert-plus');
var eventManager = require('../services/eventManager');
var logger       = require('../common/logger')(module);

apiServer.post({ path: '/cgi-bin/events/:name', name: 'insertEvent' }, function(req, res, next){
	var crash = { name: req.params.name };
	
	eventManager.insertEvent(crash)
		.then(function(){
			res.send(204);
		})
		.done();
});

apiServer.get({ path: '/cgi-bin/events/:name', name: 'getEventsByName' }, getEvents);
apiServer.get({ path: '/cgi-bin/events', name: 'getEvents' }, getEvents);

function getEvents(req, res, next){
	var filter = {};

	if(req.params.name !== undefined) {
		filter.name = req.params.name;
	}

	eventManager.findEvents({
			filter: filter,
			sort: parseSortString(req.query.sort),
			limit: _.parseInt(req.query.limit)
		})
		.then(function(events){
			res.send(events);
		})
		.done();
}

function parseSortString(sortString){
	if(sortString){
		return sortString.split(/,/g).map(function(rawSortField){
			var isAscending = (rawSortField.charAt(0) != '-');
			return [rawSortField.replace(/^[-+]/, ''), isAscending ? 1 : -1];
		});
	} else {
		return null;
	}
}