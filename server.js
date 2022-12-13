import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config();

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET
});
const readOnlyClient = twitterClient.readOnly;

const PORT = 1000;

// Fabrizo
const AUTHOR_ID = 330262748;

// Set up web app, use JSON
const app = express();
app.use(express.json());
// Use middleware that allows for access from other domains
app.use(cors());

// for logging errors
app.use(morgan('dev'));

// handles errors nicely
app.use(errorHandler());

app.get('/tweets', async (req, res) => {
  let searchTerm = req.query.searchTerm;
  const search = searchTerm.split(" ");
  let tweetURLs = [];
  const timeLine = await readOnlyClient.v2.userTimeline(AUTHOR_ID, { exclude: 'replies' });
  await timeLine.fetchLast(500);
  for (const tweet of timeLine.tweets) {
    for (const word of search) {
      if (tweet.text.includes(word)) {
        console.log(tweet.text);
        tweetURLs.push("https://twitter.com/i/web/status/" + tweet.id);
        break;
      }
    }
  }
    res.json(tweetURLs);
  });

// start server
const server = app.listen(
  parseInt(PORT),
  process.env.IP,
  () => {
    console.log(
      `⚡️ Server listening on port ${PORT}`
    );
  }
);

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});