var API_ROOT = "/";
var mostRecentEventDate;
var config = {};

main();


function main(){
	var eventName = getQueryParam("name");
	if(eventName){
		$('.icon').attr('src', 'images/'+eventName+'.png');

		$.getJSON(API_ROOT+'scripts/boards/'+eventName+'.json')
			.done(function(eventConfig){
				config = eventConfig;

				setInterval(updateEvents, 15*60*1000);
				updateEvents()
					.done(function(){
						setInterval(render, 60*1000);
					});

				document.title = uppercaseFirstLetter(config.captionPlural);

				addListeners();
			});
	} else {
		window.alert("Try going to ?name=foo, where foo is the name of the event you want to track.");
	}
}

function addListeners(){
	window.addEventListener("message", function(event){
		var data = event.data;

		if(data.powermate && data.powermate.buttonPressed){
			submitNewEvent();
		}
	}, false);

	$('.interactions .reset').click(submitNewEvent);
}

function submitNewEvent(domEvent){
	domEvent && domEvent.preventDefault();

	mostRecentEventDate = new Date();
	render();
	$.post(API_ROOT+'cgi-bin/events/'+config.eventName);
}

function updateEvents(){
	return $.getJSON(API_ROOT+'cgi-bin/events/'+config.eventName+'?limit=1')
		.done(function(events){
			if(events.length){
				mostRecentEventDate = new Date(events[0].date);
			}
			render();
		});
}

function render(){
	var timeSinceLastEvent;
	var counterEl = $('.counter');
	var captionEl = $('.caption');

	if(mostRecentEventDate){
		timeSinceLastEvent = Math.floor(getTimeSinceLastEvent());
	} else {
		timeSinceLastEvent = '?';
	}

	counterEl.text(timeSinceLastEvent);
	captionEl.text((timeSinceLastEvent === 1) ? config.captionSingular : config.captionPlural);
}

function getTimeSinceLastEvent(){
	var secondsSinceLastEvent = moment().diff(mostRecentEventDate, 'seconds');
	switch(config.unit){
		case "seconds":
			return secondsSinceLastEvent;
		case "minutes":
			return secondsSinceLastEvent / 60;
		case "hours":
			return secondsSinceLastEvent / 60 / 60;
		case "weeks":
			return secondsSinceLastEvent / 60 / 60 / 24 / 7;

		case "days":
		default:
			return secondsSinceLastEvent / 60 / 60 / 24;
	}
}

function getQueryParam(a,b,c){
	if(getQueryParam.a==[]._)for(b=/\??([^=\[\]]+)(?:\[\])?=([^&]+)&?/g,getQueryParam.a={};c=b.exec(window.location.search);getQueryParam.a[c[1]]=(getQueryParam.a[c[1]]||[]).concat(window.decodeURIComponent(c[2])));c=getQueryParam.a[a];c=c instanceof Array&&c.length<2?c[0]:c;return c;
}

function uppercaseFirstLetter(str){
	return str.replace(/^(\w)/, function(x){ return x.toUpperCase(); })
}