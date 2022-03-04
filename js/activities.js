function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if (runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function (tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	let activityCategories = getSortedActivites(tweet_array);

	let mostPopularActivities = findAvgActivityDistance(activityCategories, tweet_array);

	let minActivityIndex = findMinDistance(mostPopularActivities);
	let maxActivityIndex = findMaxDistance(mostPopularActivities);

	let popularTweets = getPopularTweets(activityCategories, tweet_array);

	// Hard coded after looking at graph as distance on the weekend went up
	let dayPreference = "the weekend";


	// printAllTweets(tweet_array, 30);


	activity_vis_spec = {
		'$schema': 'https://vega.github.io/schema/vega-lite/v4.0.0-beta.8.json',
		'description': 'A graph of the number of Tweets containing each type of activity.',
		'data': {
			'values': activityCategories
		},
		'layer': [{
			'mark': 'bar',
		},
		{
			'mark': {
				'type': 'text',
				'align': 'center',
				'baseline': 'middle',
				'dy': -10
			},
			'encoding': {
				'text': {
					'field': 'count',
					'type': 'quantitative'
				}
			}
		}
		],

		'encoding': {
			'x': {
				'field': 'name',
				'type': 'ordinal'
			},
			'y': {
				'field': 'count',
				'type': 'quantitative'
			}
		}
	};
	vegaEmbed('#activityVis', activity_vis_spec, {
		actions: false
	});

	popular_activity_distances = {
		'$schema': 'https://vega.github.io/schema/vega-lite/v4.0.0-beta.8.json',
		'description': 'A graph of the distances of the three most popular activities and their distances, sorted by day of the week',
		'data': {
			'values': popularTweets
		},
		'mark': {
			'type': 'point',
			"tooltip": true
		},
		"transform": [{
			"flatten": ["distances", "dates"],
		}],
		'encoding': {
			'x': {
				'timeUnit': 'day',
				'field': 'dates',
				'type': 'temporal',
				"axis": {
					'title': 'Days of the week',
					"labelAngle": -90
				}
			},
			'y': {
				'field': 'distances',
				'type': 'quantitative',
				'title': 'Distances (Miles)'
			},
			"color": {
				"field": "activity_name",
				"type": "nominal",
				'title': 'Activity Type'
			},
			"shape": {
				"field": "activity_name",
				"type": "nominal"
			}



		}
	};
	vegaEmbed('#distanceVis', popular_activity_distances, {
		actions: false
	});


	popular_activity_distances_mean = {
		'$schema': 'https://vega.github.io/schema/vega-lite/v4.0.0-beta.8.json',
		'description': 'A graph of the distances of the three most popular activities and their distances, sorted by day of the week',
		'data': {
			'values': popularTweets
		},
		'mark': {
			'type': 'point',
			"tooltip": true
		},
		"transform": [{
			"flatten": ["distances", "dates"],
		}],
		'encoding': {
			'x': {
				'timeUnit': 'day',
				'field': 'dates',
				'type': 'temporal',
				"axis": {
					'title': 'Days of the week',
					"labelAngle": -90
				}
			},
			'y': {
				"aggregate": "mean",
				'field': 'distances',
				'type': 'quantitative',
				'title': 'Mean Distances (Miles)'
			},
			"color": {
				"field": "activity_name",
				"type": "nominal",
				'title': 'Activity Type'
			},
			"shape": {
				"field": "activity_name",
				"type": "nominal"
			},


		}
	};
	vegaEmbed('#distanceVisAggregated', popular_activity_distances_mean, {
		actions: false
	});



	$('#numberActivities').text(activityCategories.length);
	$('#firstMost').text(activityCategories[0].name);
	$('#secondMost').text(activityCategories[1].name);
	$('#thirdMost').text(activityCategories[2].name);

	$('#longestActivityType').text(mostPopularActivities[maxActivityIndex].activity_name + " (avg: " + mostPopularActivities[maxActivityIndex].avgDistance.toFixed(2) + " mi)");
	$('#shortestActivityType').text(mostPopularActivities[minActivityIndex].activity_name + " (avg: " + mostPopularActivities[minActivityIndex].avgDistance.toFixed(2) + " mi)");
	$('#weekdayOrWeekendLonger').text(dayPreference);

	// By default the aggregated graph should be hidden and only appear once the button is pressed
	$('#distanceVisAggregated').hide();

	// Making the button toggle between the two graphs using switch statements
	let iteration = 1;
	$('#aggregate').click(function () {
		switch (iteration) {
			case 1:
				$('#aggregate').text("Show activities");
				$('#distanceVis').hide();
				$('#distanceVisAggregated').show();
				break
			case 2:
				$('#aggregate').text("Show means");
				$('#distanceVis').show();
				$('#distanceVisAggregated').hide();
				break;
		}
		iteration++;
		if (iteration > 2) iteration = 1;
	});

}

function getSortedActivites(tweet_array) {
	return sortByCount(countActivities(tweet_array));
}

function countActivities(tweet_array) {
	let activityTypeMap = {};
	for (let i = 0; i < tweet_array.length; i++) {
		if (activityTypeMap.hasOwnProperty(tweet_array[i].activityType)) {
			activityTypeMap[tweet_array[i].activityType]++; // If the word has already been seen before increment its counter
		} else {
			activityTypeMap[tweet_array[i].activityType] = 1; // If the word hasn't been seen before create an entry for it
		}
	}
	return activityTypeMap;
}

function sortByCount(activityTypeMap) {
	let sortedWords = [];

	sortedWords = Object.keys(activityTypeMap).map(function (key) {
		return {
			name: key,
			count: activityTypeMap[key]
		};
	});

	sortedWords.sort(function (a, b) {
		return b.count - a.count;
	});

	return sortedWords;
}


function findAvgActivityDistance(activityCategories, tweet_array) {
	let mostPopularActivities = [];

	for (let i = 0; i < 3; i++) {
		mostPopularActivities[i] = {
			activity_name: activityCategories[i].name,
			totalDistance: 0,
			count: activityCategories[i].count,
			avgDistance: 0
		};
	}

	// Create an distance accumulator for each activity type so we can avg it later
	for (let i = 0; i < tweet_array.length; i++) {
		switch (tweet_array[i].activityType) {
			case mostPopularActivities[0].activity_name:
				mostPopularActivities[0].totalDistance += tweet_array[i].distance;
				break;
			case mostPopularActivities[1].activity_name:
				mostPopularActivities[1].totalDistance += tweet_array[i].distance;
				break;
			case mostPopularActivities[2].activity_name:
				mostPopularActivities[2].totalDistance += tweet_array[i].distance;
				break;
		}
	}

	for (let i = 0; i < 3; i++) {
		mostPopularActivities[i].avgDistance = mostPopularActivities[i].totalDistance / mostPopularActivities[i].count;
	}

	return mostPopularActivities;
}

function getPopularTweets(activityCategories, tweet_array) {
	let popularTweets = [];

	for (let i = 0; i < 3; i++) {
		popularTweets[i] = {
			activity_name: activityCategories[i].name,
			tweets: [],
			distances: [],
			dates: [],
			count: activityCategories[i].count
		};
	}

	for (let i = 0; i < tweet_array.length; i++) {
		switch (tweet_array[i].activityType) {
			case popularTweets[0].activity_name:
				popularTweets[0].tweets.push(tweet_array[i]);
				popularTweets[0].distances.push(tweet_array[i].distance);
				popularTweets[0].dates.push(tweet_array[i].time);
				break;
			case popularTweets[1].activity_name:
				popularTweets[1].tweets.push(tweet_array[i]);
				popularTweets[1].distances.push(tweet_array[i].distance);
				popularTweets[1].dates.push(tweet_array[i].time);
				break;
			case popularTweets[2].activity_name:
				popularTweets[2].tweets.push(tweet_array[i]);
				popularTweets[2].distances.push(tweet_array[i].distance);
				popularTweets[2].dates.push(tweet_array[i].time);
				break;
		}
	}

	return popularTweets;
}

function findMinDistance(avgActivityArray) {
	let minIndex;
	let min;
	let maxValue = 99999999;
	min = maxValue;

	for (let i = 0; i < avgActivityArray.length; i++) {
		if (avgActivityArray[i].avgDistance < min) {
			min = avgActivityArray[i].avgDistance;
			minIndex = i;
		}
	}

	return minIndex;
}

function findMaxDistance(avgActivityArray) {
	let maxIndex;
	let max;
	let minValue = -99999999;
	max = minValue;

	for (let i = 0; i < avgActivityArray.length; i++) {
		if (avgActivityArray[i].avgDistance > max) {
			max = avgActivityArray[i].avgDistance;
			maxIndex = i;
		}
	}

	return maxIndex;
}

function printAllTweets(arr, n) {
	// -1 is for shorthand instead of having to type arr.length as a parameter
	if (n == -1) {
		n = arr.length;
	}

	for (let i = 0; i < n; i++) {
		if (arr[i].source == "completed_event") {
			// console.log("Tweet [" + i + "] - Activity: " + arr[i].activityType + "\tDistance: " + arr[i].distance.toFixed(2) + " mi");
			console.log(arr[i]);
			// arr[i].activityType;
		}
	}
}

//Wait for the DOM to load
$(document).ready(function () {
	loadSavedRunkeeperTweets().then(parseTweets);
});