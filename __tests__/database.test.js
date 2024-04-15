const testData = require('../db/data/test-data/index.js');
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection.js");
const request = require("supertest");
const app = require("../app.js");
const endpoints = require("../endpoints.json");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  db.end();
});

describe("GET topics", () => {
  test("Request from /api/topics returns array of topics from the database", () => {
    return request(app)
    .get('/api/topics')
    .expect(200)
    .then(({body}) => {
        expect(body.length).toBe(3)
        body.forEach(topic => {
            expect(typeof topic.description).toBe('string')
            expect(typeof topic.slug).toBe('string')
        });
    })
  });
});

describe("GET endpoints", () => {
    test("Request from /api/ returns the number of endpoints stored in endpoints.json", () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then(({body}) => {
            expect(Object.keys(body).length).toBe(Object.keys(endpoints).length)
        })
    });
    test("Request from /api/ returns required information for all endpoints", () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then(({body}) => {
            for(key in body) {
                expect(typeof body[key].description).toBe('string')
                expect(Array.isArray(body[key].queries)).toBe(true)
                if (key !== "GET /api") {
                    expect(typeof body[key].exampleResponse).toBe('object')
                } else {
                    expect(typeof body[key].exampleResponse).toBe('string')
                }
                if (!key.match(/^GET/)) {
                    expect(typeof body[key].bodyFormat).toBe('object')
                }
            }
        })
    });
});


describe("GET articles", () => {
    const matchArticleObject = {
        article_id: expect.any(Number),
        title: expect.any(String),
        topic: expect.any(String),
        author: expect.any(String),
        body: expect.any(String),
        created_at: expect.any(String),
        votes: expect.any(Number),
        article_img_url: expect.any(String)
      }
    test("Request from /api/articles/1 returns an object with required values", () => {
        return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then(({body}) => {
            expect(body).toMatchObject(matchArticleObject)
        })
    })
    test("Request from /api/articles/:id with a valid but missing id responds with 404 Nothing found", () => {
        return request(app)
        .get('/api/articles/999999')
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe('Nothing found')
        })
    })
    test("Request from /api/articles/invalid responds with 400 Bad request", () => {
        return request(app)
        .get('/api/articles/invalid')
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe('Bad request')
        })
    })
    test("Request from /api/articles returns an array of all articles in descending date order", () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({body}) => {
            expect(body.length).toBe(13)
            body.forEach(article => {
                expect(article).toMatchObject(matchArticleObject)  
            });
            expect(body).toBeSorted({key: 'created_at', descending: true})
        })
    })
})

describe("Invalid URLs", () => {
  test("Request from /api/topics! returns 404 not found", () => {
    return request(app)
    .get('/api/topics!')
    .expect(404)
    .then(({body}) => {
        expect(body.message).toBe('URL not found')
    })
  });
})