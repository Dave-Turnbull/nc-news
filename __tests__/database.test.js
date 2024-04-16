const testData = require('../db/data/test-data/index.js');
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection.js");
const request = require("supertest");
const app = require("../app.js");
const endpoints = require("../endpoints.json");

beforeAll(() => {
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
        return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then(({body}) => {
            expect(body).toMatchObject(matchArticleObject)
        })
    })
    test("Request from /api/articles/:id with a valid but missing id responds with 404 article not found", () => {
        return request(app)
        .get('/api/articles/999999')
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe('article not found')
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
        const matchArticleObject = {
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number)
          }
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({body}) => {
            expect(body.length).toBe(13)
            body.forEach(article => {
                expect(article).toMatchObject(matchArticleObject)
                expect(Object.keys(article).includes('body')).toBeFalsy()
            });
            expect(body).toBeSorted({key: 'created_at', descending: true})
        })
    })
})

describe("GET comments", () => {
    test("Request from /api/articles/1/comments returns an array of comments for the specified article", () => {
        const matchCommentObject = {
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 1
          }
        return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({body}) => {
            expect(body.length).toBe(11)
            body.forEach(article => {
                expect(article).toMatchObject(matchCommentObject)
            })
            expect(body).toBeSorted({key: 'created_at', descending: true})
        })
    })
    test("Request for valid but missing article ID returns 404 article not found", () => {
        return request(app)
        .get('/api/articles/99999/comments')
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe('article not found')
        })
    })
    test("Request for existing article with no comments returns 200 and empty array", () => {
        return request(app)
        .get('/api/articles/2/comments')
        .expect(200)
        .then(({body}) => {
            expect(body).toEqual([])
        })
    })
    test("Request for invalid article ID returns 400 Bad request", () => {
        return request(app)
        .get('/api/articles/invalid/comments')
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe('Bad request')
        })
    })
})


describe("POST comments", () => {
    const matchCommentObject = {
        comment_id: expect.any(Number),
        votes: 0,
        created_at: expect.any(String),
        author: 'rogersop',
        body: 'Amazing article',
        article_id: 2
      }
      const validComment = {
        username: 'rogersop',
        body: 'Amazing article'
    }
    test("POST /api/articles/2/comments with existing user and valid body returns a comment", () => {
        return request(app)
        .post('/api/articles/2/comments')
        .send(validComment)
        .expect(201)
        .then(({body}) => {
            expect(body[0]).toMatchObject(matchCommentObject)
        })
    })
    test("After POST, comment is added to the comments table", () => {
        return request(app)
        .get('/api/articles/2/comments')
        .expect(200)
        .then(({body}) => {
            expect(body.length).toBe(1)
            expect(body[0]).toMatchObject(matchCommentObject)
        })
    })
    test("POST /api/articles/2/comments with missing user returns 422", () => {
        const missingUserComment = {
            username: 'missingUser',
            body: 'Hello'
        }
        return request(app)
        .post('/api/articles/2/comments')
        .send(missingUserComment)
        .expect(422)
        .then(({body}) => {
            expect(body.message).toBe("username doesn't exist")
        })
    })
    test("POST to valid but missing article ID returns 422 article doesn't exist", () => {
        return request(app)
        .post('/api/articles/99999/comments')
        .send(validComment)
        .expect(422)
        .then(({body}) => {
            expect(body.message).toBe("article doesn't exist")
        })
    })
    test("POST with valid username and article_id but missing body returns 400 Bad request", () => {
        const missingBody = {
            username: 'rogersop',
        }
        return request(app)
        .post('/api/articles/2/comments')
        .send(missingBody)
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe("Bad request")
        })
    })
    test("POST with valid username and article_id but invalid body returns 400 Bad request", () => {
        const invalidBody = {
            username: 'rogersop',
            body: 1
        }
        return request(app)
        .post('/api/articles/2/comments')
        .send(invalidBody)
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe("Bad request")
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