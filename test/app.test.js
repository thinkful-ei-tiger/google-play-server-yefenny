const { expect } = require('chai');
const e = require('express');
const supertest = require('supertest');
const app = require('../app');

describe(' GET /apps midpoint ', () => {
  it('get all apps in the right format', () => {
    return supertest(app)
      .get('/apps')
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => {
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf.at.least(1);
        const app = res.body[0];
        expect(app).to.include.all.keys(
          'App',
          'Category',
          'Rating',
          'Size',
          'Installs',
          'Type',
          'Price',
          'Content Rating',
          'Genres'
        );
      });
  });

  describe('Check if apps are sorted ', () => {
    const sorted = ['app', 'rating'];
    sorted.forEach((sort) => {
      it(`should return apps sorted by '${sort}'`, () => {
        return supertest(app)
          .get('/apps')
          .query({ sort: sort })
          .expect(200)
          .expect('Content-Type', /json/)
          .then((res) => {
            expect(res.body).to.be.an('array');
            sort = sort.toLowerCase();
            sort = sort[0].toUpperCase() + sort.slice(1, sort.length);
            let isSorted = true;
            let i = 0;
            while (i < res.body.length - 1) {
              let appI = res.body[i][sort];
              let appIPlus1 = res.body[i + 1][sort];
              if (typeof appI === 'string') {
                appI = appI.toLowerCase();
                appIPlus1 = appIPlus1.toLowerCase();
              }
              if (appI > appIPlus1) {
                isSorted = false;
                break;
              }
              i++;
            }
            expect(isSorted).to.be.true;
          });

        // });
      });
    });
  });
  describe('should returns apps filtered by valid genres', () => {
    const genres = ['action', 'puzzle', 'strategy', 'casual', 'arcade', 'card'];
    genres.forEach((genre) => {
      it(`return apps filtered by '${genre}'`, () => {
        return supertest(app)
          .get('/apps')
          .query({ genres: genre })
          .expect(200)
          .expect('Content-Type', /json/)
          .then((res) => {
            expect(res.body).to.be.an('array');
            if (res.body.length > 0) {
              let filtered = true;
              let i = 0;
              while (i < res.body.length) {
                const appAtI = res.body[i]['Genres'].toLowerCase();
                if (!appAtI.includes(genre.toLowerCase())) {
                  filtered = false;
                }
                i++;
              }
              expect(filtered).to.be.true;
            }
          });
      });
    });
  });
  it('returns an error 400 if sort is not "App" or "Rating"', () => {
    return supertest(app)
      .get('/apps')
      .query({ sort: 'price' })
      .expect(400, "Sort should be 'rating' or 'app'");
  });
  it('returns an 400 error if genre is an invalid value ', () => {
    return supertest(app)
      .get('/apps')
      .query({ genres: 'comedy' })
      .expect(
        400,
        'You should choose one of these genres: Action, Puzzle, Strategy, Casual, Arcade or Card'
      );
  });
});
