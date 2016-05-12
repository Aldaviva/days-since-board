var mongo       = require('mongodb');
var testConfig  = require('../config');
var testCommons = require('../testCommons');

require('../../lib/common/logger')().level("warn");

var config      = require('../../lib/common/config').init(testConfig);
var app         = require('../..');
var request     = require('request');
var chai        = require('chai');

var expect      = chai.expect;

var db;
var crashesCollection;

describe('Crash API:', function(){

	before(function(done){
		app.startedPromise
			.then(function(){
				db = new mongo.Db(config.db.name, new mongo.Server(config.db.host, config.db.port), {
					journal: true
				});
				db.open(function(){
					db.collection('crashes', function(err, coll){
						crashesCollection = coll;
						crashesCollection.remove({}, function(err){
							done(err);
						});
					});
				});
			});
	});

	describe("createCrash", function(){
		var myCrashName = "xcode";

		it('returns successfully', function(done){
			request.post({
				url: testCommons.baseUrl + '/crashes/'+myCrashName,
				json: true
			}, function(err, res, body){
				expect(err).to.be.null;
				expect(res.statusCode).to.equal(204);
				done(err);
			});
		});

		it("updates the database", function(done){
			crashesCollection.find().toArray(function(err, docs){
				expect(docs).to.have.length(1);
				var doc = docs[0];
				expect(doc).to.have.property("name", myCrashName);
				expect(doc).to.have.property("date").that.is.closeTo(+new Date(), 2000);
				done(err);
			});
		});

		after(function(done){
			crashesCollection.remove({}, function(err){
				done(err);
			});
		});
	});

	describe("getCrashes", function(){
		var myCrashes;
		before(function(done){
			var now = new Date();
			myCrashes = [
				{ name: "xcode",     date: +new Date(now - 5000) },
				{ name: "photoshop", date: +new Date(now - 4000) },
				{ name: "xcode",     date: +new Date(now - 3000) },
				{ name: "ie",        date: +new Date(now - 2000) }
			];
			crashesCollection.insert(myCrashes, function(err){
				done(err);
			});
		});

		it("returns all crashes when no name filter is provided", function(done){
			request({
				url: testCommons.baseUrl + '/crashes',
				json: true
			}, function(err, res, body){
				expect(err).to.be.null;
				expect(res).to.have.property('statusCode', 200);
				expect(res).to.have.deep.property('headers.content-type', 'application/json');
				expect(body).to.be.instanceOf(Array);
				expect(body).to.have.length(myCrashes.length);
				done(err);
			});
		});

		it("gets the most recent filtered crash", function(done){
			request({
				url: testCommons.baseUrl + '/crashes/xcode?limit=1',
				json: true
			}, function(err, res, body){
				expect(body).to.have.length(1);

				var actual = body[0];
				var expected = myCrashes[2];
				expect(actual).to.have.property('name', expected.name);
				expect(actual).to.have.property('date', expected.date);
				done(err);
			});
		});

		after(function(done){
			crashesCollection.remove({}, function(err){
				done(err);
			});
		});
	});

	describe("CORS", function(){
		it("headers appear in response", function(done){
			request({
				url: testCommons.baseUrl + '/crashes'
			}, function(err, res, body){
				expect(res).to.have.deep.property('headers.access-control-allow-origin', '*');
				done(err);
			});
		});
	});

	after(function(done){
		db.dropDatabase(function(err){
			done(err);
		});
	});
});