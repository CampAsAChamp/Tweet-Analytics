class Tweet {
    private text: string;
    time: Date;


    constructor(tweet_text: string, tweet_time: string) {
        this.text = tweet_text;
        this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
    }

    /* Types of Tweets
        Completed Event - Just completed a xx.yy run/walk
        Live Event - Watch my run right now
        Achievment - Achieve a new personal record 
        Miscellanous - Just posted xyz (yoga practice)
    */

    //returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source(): string {
        if (this.text.startsWith("Just")) {
            return "completed_event";
        }
        else if (this.text.startsWith("Watch")) {
            return "live_event";
        }
        else if (this.text.startsWith("Achieve")) {
            return "achievment"
        }
        else {
            return "miscellanous";
        }
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written(): boolean {
        // If it includes a dash in the middle then its a written tweet
        if (this.text.includes("-")) {
            return true;
        }
        else {
            return false;
        }
    }

    get writtenText(): string {
        if (!this.written) {
            return "";
        }
        else {
            // Get all the text after the dash but before the tweet link
            var dashIndex = this.text.indexOf("-");
            var linkIndex = this.text.indexOf("https:");
            var slicedString = this.text.slice(dashIndex, linkIndex);
            return slicedString;
        }
    }


    get activityType(): string {
        if (this.source != 'completed_event') {
            return "unknown";
        }

        // Split the text from tweet into an array of substrings of the words
        var res = this.text.split(" ");

        // Looking at the tweets found a pattern where activity type was always the 6th word
        var activity = res[5];

        // Simple regex check to see if a string starts with a number or has the word in/the as these are incorrect activity types
        if (activity.match(/^\d/) || activity.includes('the') || activity.includes('in')) {
            activity = 'unknown';
        }

        return activity;
    }

    get distance(): number {
        if (this.source != 'completed_event') {
            return 0;
        }

        // Split the text from tweet into an array of substrings of the words
        var res = this.text.split(" ");

        // Looking at the tweets found a pattern where distance was always the 4th word
        var distanceStr = res[3];
        var distanceNum = parseFloat(distanceStr);
        var unit = res[4];

        if (unit == "km") {
            let KM_TO_MILES_VAL = 1.609;
            distanceNum = distanceNum / KM_TO_MILES_VAL;
            unit = "mi";    // Update the unit to be miles now that we have converted fromkm
        }

        return distanceNum;
    }

    getHTMLTableRow(rowNumber: number): string {
        // <tr><td>rowNumber.toString() < /td><td>this.activityType</td><td>this.text</td ></tr>

        var firstPart = "<tr><td>".concat(rowNumber.toString(), "</td >");  // <tr><td>tweet_num</td>
        var secondPart = "<td>".concat(this.activityType, "</td>");         // <td>activity_type</td>

        // Finding the link in the text of the tweet so we can replace with a hyperlink so the user can click it
        var linkIndex = this.text.indexOf("https:");
        var hashtagIndex = this.text.indexOf("#");
        var slicedLink = this.text.slice(linkIndex, hashtagIndex - 1);

        // https://t.co/82ae4C -> <a href="https://t.co/82ae4C">https://t.co/82ae4C</a>
        var hyperlink = "<a href=\"".concat(slicedLink, "\">", slicedLink, "</a>");

        var thirdPart = "<td>".concat(this.text, "</tr>");                  // <td>tweet_text</td>
        var thirdPart = thirdPart.replace(slicedLink, hyperlink);           // Replace the link with the hyperlinked
        var combined = firstPart.concat(secondPart, thirdPart);
        return combined;

    }
}