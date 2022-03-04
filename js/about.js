/* 	Main TODO: 
	1) Summarizing tweets on the about page
	2) Identifying the most popular activities to the activities page
	3) Adding a text search interface to the description page
		i) Add features to the Tweet TS class

	-- About Page -- 
	Identify the dates of the earliest and latest Tweets in the set
	How many of the completed tweets contain written text

	Time attirbute of the Tweet class has the date of each Tweet
	TODO: Write out the M/D/Y of the earliest and latest tweet (Oct 14, 2019)
		- Use toLocaleDateString() to format the date
	Edit this file to find the earliest and latest tweet and update the spans
*/

const MAX_DATE_VAL = 8640000000000000;
const MIN_DATE_VAL = -8640000000000000;

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if (runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}


	// Creates a tweet array with all the tweets with their creation date  
	tweet_array = runkeeper_tweets.map(function (tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});


	// printAllTweets(tweet_array, -1);

	let firstDateIndex = findEarliestTweet(tweet_array);
	let lastDateIndex = findLatestTweet(tweet_array);
	let tweetCategories = countTweetCategories(tweet_array);
	let liveCount = tweetCategories[0];
	let achieveCount = tweetCategories[1];
	let completeCount = tweetCategories[2];
	let miscCount = tweetCategories[3];
	let totalCount = tweetCategories[4];
	let writtenCount = countWrittenTweets(tweet_array);


	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	$('#numberTweets').text(tweet_array.length);

	let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
	let firstDateDay = tweet_array[firstDateIndex].time.getDay()
	let lastDateDay = tweet_array[lastDateIndex].time.getDay()


	$('#firstDate').text(days[firstDateDay] + " " + tweet_array[firstDateIndex].time.toLocaleDateString());
	$('#lastDate').text(days[lastDateDay] + " " + tweet_array[lastDateIndex].time.toLocaleDateString());

	$('.completedEvents').text(completeCount[1]);
	$('.completedEventsPct').text((completeCount[1] / totalCount[1] * 100).toFixed(2) + "%");

	$('.liveEvents').text(liveCount[1]);
	$('.liveEventsPct').text((liveCount[1] / totalCount[1] * 100).toFixed(2) + "%");

	$('.achievements').text(achieveCount[1]);
	$('.achievementsPct').text((achieveCount[1] / totalCount[1] * 100).toFixed(2) + "%");

	$('.miscellaneous').text(miscCount[1]);
	$('.miscellaneousPct').text((miscCount[1] / totalCount[1] * 100).toFixed(2) + "%");

	$('.written').text(writtenCount);
	$('.writtenPct').text((writtenCount / completeCount[1] * 100).toFixed(2) + "%");
}

function countTweetCategories(arr) {

	// Create an object to store all the counts
	let tweetCategoriesCount = {
		liveCount: 0,
		achievmentCount: 0,
		completedCount: 0,
		miscCount: 0,
		totalCount: 0
	};

	for (let i = 0; i < arr.length; i++) {
		switch (arr[i].source) {
			case "live_event":
				tweetCategoriesCount.liveCount++;
				tweetCategoriesCount.totalCount++;
				break;
			case "achievment":
				tweetCategoriesCount.achievmentCount++;
				tweetCategoriesCount.totalCount++;
				break;
			case "completed_event":
				tweetCategoriesCount.completedCount++;
				tweetCategoriesCount.totalCount++;
				break;
			case "miscellanous":
				tweetCategoriesCount.miscCount++;
				tweetCategoriesCount.totalCount++;
				break;
		}
	}

	// Gets an array of (key, value) pairs which are (tweet_type, count)
	let myEntries = Object.entries(tweetCategoriesCount);
	return myEntries;
}

function countWrittenTweets(arr) {
	let writtenCount = 0;
	for (let i = 0; i < arr.length; i++) {
		if (arr[i].written == true) writtenCount++;
	}

	return writtenCount;
}

function findEarliestTweet(arr) {
	let earliestIndex;
	let earliest = new Date();
	let maxDate = new Date(MAX_DATE_VAL);
	earliest = maxDate;

	for (let i = 0; i < arr.length; i++) {
		if (arr[i].time < earliest) {
			earliest = arr[i].time;
			earliestIndex = i;
		}
	}

	return earliestIndex;
}

function findLatestTweet(arr) {
	let latestIndex;
	let latest = new Date();
	let minDate = new Date(MIN_DATE_VAL);
	latest = minDate;

	for (let i = 0; i < arr.length; i++) {
		if (arr[i].time > latest) {
			latest = arr[i].time;
			latestIndex = i;
		}
	}

	return latestIndex;
}

function printAllTweets(arr, n) {
	// -1 is for shorthand instead of having to type arr.length as a parameter
	if (n == -1) {
		n = arr.length;
	}

	for (let i = 0; i < n; i++) {
		if (arr[i].source == "completed_event") {
			console.log("Tweet [" + i + "] - Activity: " + arr[i].activityType + "\tDistance: " + arr[i].distance.toFixed(2) + " mi");
		}
	}
}

//Wait for the DOM to load
$(document).ready(function () {
	loadSavedRunkeeperTweets().then(parseTweets);
});