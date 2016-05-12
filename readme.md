Days Since Board
================

## Add a new board

1. Save an icon as a 325px × 325px PNG in `./public/images/`.
2. Create a new JSON file in `./public/scripts/boards` with the following contents.
	```json
	{
	    "eventName": "xcode",
	    "captionSingular": "day since Xcode crashed",
	    "captionPlural": "days since Xcode crashed",
	    "unit": "days"
	}
	```
    `unit` can be one of `seconds`, `minutes`, `hours`, `days` (default), or `weeks`.
    
3. Go to `?name=:eventName` in a browser, *i.e.* `http://localhost:8086/?name=xcode`.
