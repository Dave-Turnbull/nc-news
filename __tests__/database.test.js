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
    test("Request from /api/articles/1 returns an object with required values", () => {
        return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then(({body}) => {
            expect(typeof body.author).toBe("string")
            expect(typeof body.title).toBe("string")
            expect(typeof body.article_id).toBe("number")
            expect(typeof body.body).toBe("string")
            expect(typeof body.topic).toBe("string")
            expect(typeof body.created_at).toBe("string")
            expect(typeof body.votes).toBe("number")
            expect(typeof body.article_img_url).toBe("string")
        })
    })
    test("Request from /api/articles/999999 when 999999 doesn't exist, respond with 404 Nothing found", () => {
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