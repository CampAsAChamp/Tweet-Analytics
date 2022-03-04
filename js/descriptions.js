function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if (runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function (tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	// Filter for just the written tweets
	tweet_array = tweet_array.filter(function (tweet) {
		return tweet.text.includes('-');
	});
}

function addEventHandlerForSearch() {
	$('#textFilter').on('input', function () {
		var typedText = $('#textFilter').val();
		$('#searchText').text(typedText);
		searchForTweets(typedText, tweet_array);
	})
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
}

function searchForTweets(wordToSearch, tweet_array) {
	$("#tweetTable").empty();

	// Display no tweets if nothing is written in the search box
	if (!wordToSearch || wordToSearch.length === 0) {
		$('#searchCount').text("0");
		return;
	}

	var foundTweetsCount = 0;
	for (let i = 0; i < tweet_array.length; i++) {
		if (tweet_array[i].written && tweet_array[i].text.includes(wordToSearch)) {
			var tableRowString = tweet_array[i].getHTMLTableRow(i);
			$('#tweetTable').append(tableRowString);
			foundTweetsCount++;
		}
	}
	$('#searchCount').text(foundTweetsCount);
}

//Wait for the DOM to load
$(document).ready(function () {
	loadSavedRunkeeperTweets().then(parseTweets);
	addEventHandlerForSearch();
});