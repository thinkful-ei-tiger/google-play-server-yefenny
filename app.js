const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(morgan('dev'));

const apps = require('./playstore');

app.get('/apps', (req, res) => {
  let { sort, genres } = req.query;
  let results = [...apps];

  if (sort && !['rating', 'app'].includes(sort.toLowerCase())) {
    return res.status(400).send("Sort should be 'rating' or 'app'");
  }

  if (sort) {
    sort = sort.toLowerCase();
    sort = sort[0].toUpperCase() + sort.slice(1, sort.length);
    results.sort((currVal, nextVal) => {
      let a = currVal[sort];
      let b = nextVal[sort];
      if (typeof currVal[sort] === 'string') {
        a = a.toLowerCase();
        b = b.toLowerCase();
      }
      return a < b ? -1 : a > b ? 1 : 0;
    });
  }

  if (genres) {
    if (
      !['action', 'puzzle', 'strategy', 'casual', 'arcade', 'card'].includes(
        genres.toLowerCase()
      )
    )
      return res
        .status(400)
        .send(
          'You should choose one of these genres: Action, Puzzle, Strategy, Casual, Arcade or Card'
        );

    genres = genres.toLowerCase();
    genres = genres[0].toUpperCase() + genres.slice(1, genres.length);
    results = results.filter((result) => result.Genres.includes(genres));
  }
  res.json(results);
});

module.exports = app;
