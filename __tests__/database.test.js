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
        expect(body.topics.length).toBe(3)
        body.topics.forEach(topic => {
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
                if (!(key.match(/^GET/) || key.match(/^DELETE/))) {
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
            article_img_url: expect.any(String),
            comment_count: expect.any(Number)
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
            body.articles.forEach(article => {
                expect(article).toMatchObject(matchArticleObject)
                expect(Object.keys(article).includes('body')).toBeFalsy()
            });
            expect(body.articles).toBeSorted({key: 'created_at', descending: true})
        })
    })
    test("Request from /api/articles with ?topic query filters articles by topic", () => {
        const matchArticleObject = {
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: 'cats',
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number)
          }
        return request(app)
        .get('/api/articles?topic=cats')
        .expect(200)
        .then(({body}) => {
            expect(body.articles.length).toBe(1)
            body.articles.forEach(article => {
                expect(article).toMatchObject(matchArticleObject)
                expect(Object.keys(article).includes('body')).toBeFalsy()
            });
            expect(body.articles).toBeSorted({key: 'created_at', descending: true})
        })
    })
    test("Request from /api/articles with non existent ?topic query returns 404", () => {
        return request(app)
        .get('/api/articles?topic=invalid')
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe("article not found")
        })
    })
    test("Request from /api/articles with ?author and ?topic query filters articles by author and topic", () => {
        const matchArticleObject = {
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: 'mitch',
            author: 'rogersop',
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number)
          }
        return request(app)
        .get('/api/articles?topic=mitch&&author=rogersop')
        .expect(200)
        .then(({body}) => {
            expect(body.articles.length).toBe(2)
            body.articles.forEach(article => {
                expect(article).toMatchObject(matchArticleObject)
                expect(Object.keys(article).includes('body')).toBeFalsy()
            });
            expect(body.articles).toBeSorted({key: 'created_at', descending: true})
        })
    })
    test("Request with sort_by query sorts by given value", () => {
        return request(app)
        .get('/api/articles?topic=mitch&&sort_by=article_id')
        .expect(200)
        .then(({body}) => {
            expect(body.articles).toBeSorted({key: 'article_id', descending: true})
        })
    })
    test("Request with invalid sort_by query returns 400 Bad request", () => {
        return request(app)
        .get('/api/articles?topic=mitch&&sort_by=invalid')
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe("Bad request")
        })
    })
    test("Request with order=asc query sorts in ascending order", () => {
        return request(app)
        .get('/api/articles?topic=mitch&&sort_by=article_id&&order=asc')
        .expect(200)
        .then(({body}) => {
            expect(body.articles).toBeSorted({key: 'article_id', ascending: true})
        })
    })
    test("Request with invalid order query returns 400 Bad request", () => {
        return request(app)
        .get('/api/articles?order=ascending')
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe("Invalid query")
        })
    })
    test("Request with invalid query returns 400 Invalid query", () => {
        return request(app)
        .get('/api/articles?invalid=mitch&&author=rogersop')
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe("Invalid query")
        })
    })
    test("Attempting SQL injection in order query returns 400 Invalid query", () => {
        return request(app)
        .get('/api/articles?order=desc; DROP TABLE comments;')
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe("Invalid query")
        })
    })
    test("Request from /api/articles with limit query responds with the limited rows and a total count", () => {
        return request(app)
        .get('/api/articles?limit=10')
        .expect(200)
        .then(({body}) => {
            expect(body.articles.length).toBe(10)
            expect(body.total_count).toBe(13)
        })
    })
    test("Request with limit=10 and p=2 responds with the 2nd page of rows", () => {
        return request(app)
        .get('/api/articles?limit=10&&p=2')
        .expect(200)
        .then(({body}) => {
            expect(body.articles.length).toBe(3)
            expect(body.total_count).toBe(13)
        })
    })
    test("Invalid limit responds with 400 Invalid query", () => {
        return request(app)
        .get('/api/articles?limit=invalid')
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe("Invalid query")
        })
    })
    test("Invalid page responds with 400 Invalid query", () => {
        return request(app)
        .get('/api/articles?limit=10&&p=invalid')
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe("Invalid query")
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
            expect(body.comments.length > 0).toBeTruthy()
            body.comments.forEach(article => {
                expect(article).toMatchObject(matchCommentObject)
            })
            expect(body.comments).toBeSorted({key: 'created_at', descending: true})
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
            expect(body.comments).toEqual([])
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
    test("Adding limit query responds with the limited number of comments and total_count", () => {
        return request(app)
        .get('/api/articles/1/comments?limit=10')
        .expect(200)
        .then(({body}) => {
            expect(body.comments.length).toBe(10)
            expect(body.total_count).toBe(11)
        })
    })
    test("Adding limit and page queries responds with the specified page of comments and total_count", () => {
        return request(app)
        .get('/api/articles/1/comments?limit=10&&p=2')
        .expect(200)
        .then(({body}) => {
            expect(body.comments.length).toBe(1)
            expect(body.total_count).toBe(11)
        })
    })
})


describe("POST comments", () => {
    const matchCommentObject = {
        comment_id: 19,
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
            expect(body).toMatchObject(matchCommentObject)
        })
    })
    test("POST /api/articles/2/comments with missing user returns 404", () => {
        const missingUserComment = {
            username: 'missingUser',
            body: 'Hello'
        }
        return request(app)
        .post('/api/articles/2/comments')
        .send(missingUserComment)
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe("author not found")
        })
    })
    test("POST to valid but missing article ID returns 404 article not found", () => {
        return request(app)
        .post('/api/articles/99999/comments')
        .send(validComment)
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe("article not found")
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
    test("POST to invalid article ID returns 400 Bad request", () => {
        return request(app)
        .post('/api/articles/invalid/comments')
        .send(validComment)
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe("Bad request")
        })
    })
})

describe("POST articles", () => {
    test("POST /api/articles returns a new article", () => {
        const matchArticleObject = {
            title: 'An article title',
            topic: 'mitch',
            author: 'rogersop',
            body: 'Hello this is an article',
            created_at: expect.any(String),
            article_img_url: 'http://animage.com/1.png',
            votes: 0,
          }
          const validArticle = {
            title: 'An article title',
            body: 'Hello this is an article',
            topic: 'mitch',
            author: 'rogersop',
            article_img_url: 'http://animage.com/1.png'
        }
        return request(app)
        .post('/api/articles')
        .send(validArticle)
        .expect(201)
        .then(({body}) => {
            expect(body).toMatchObject(matchArticleObject)
        })
    })
    test("POST /api/articles with missing article_image_url returns a default URL", () => {
        const matchArticleObject = {
            title: 'An article title',
            topic: 'mitch',
            author: 'rogersop',
            body: 'Hello this is an article',
            created_at: expect.any(String),
            article_img_url: 'http://defaultURL.com/1.png',
            votes: 0,
            comment_count: 0,
          }
          const validArticle = {
            title: 'An article title',
            body: 'Hello this is an article',
            topic: 'mitch',
            author: 'rogersop',
        }
        return request(app)
        .post('/api/articles')
        .send(validArticle)
        .expect(201)
        .then(({body}) => {
            expect(body).toMatchObject(matchArticleObject)
        })
    })
    test("POST /api/articles with missing user returns 404 author not found", () => {
        const missingUserArticle = {
            title: 'An article title',
            body: 'Hello this is an article',
            topic: 'mitch',
            author: 'invalid',
            article_img_url: 'http://animage.com/1.png'
        }
        return request(app)
        .post('/api/articles')
        .send(missingUserArticle)
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe("author not found")
        })
    })
    test("POST with missing body returns 400 Bad request", () => {
        const missingBody = {
        }
        return request(app)
        .post('/api/articles')
        .send(missingBody)
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe("Bad request")
        })
    })
})

describe("PATCH articles", () => {
    const matchArticleObject = {
        title: expect.any(String),
        topic: expect.any(String),
        author: expect.any(String),
        body: expect.any(String),
        created_at: expect.any(String),
        article_img_url: expect.any(String)
      }
    test("Update article votes when patching with valid body", () => {
        const patchRequest = {
            inc_votes: 3
        }
        matchArticleObject.article_id = 2
        matchArticleObject.votes = 3
        return request(app)
        .patch('/api/articles/2')
        .send(patchRequest)
        .expect(200)
        .then(({body}) => {
            expect(body).toMatchObject(matchArticleObject)
        })
    })
    test("Can remove votes", () => {
        const patchRequest = {
            inc_votes: -101
        }
        matchArticleObject.article_id = 1
        matchArticleObject.votes = -1
        return request(app)
        .patch('/api/articles/1')
        .send(patchRequest)
        .expect(200)
        .then(({body}) => {
            expect(body).toMatchObject(matchArticleObject)
        })
    })
    test("PATCH to invalid article ID returns 400 Bad request", () => {
        const patchRequest = {
            inc_votes: 1
        }
        return request(app)
        .patch('/api/articles/invalid')
        .send(patchRequest)
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe("Bad request")
        })
    })
    test("PATCH to valid but missing article ID returns 404 article not found", () => {
        const patchRequest = {
            inc_votes: 1
        }
        return request(app)
        .patch('/api/articles/99999')
        .send(patchRequest)
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe("article not found")
        })
    })
    test("PATCH using invalid body returns 400 Bad request", () => {
        const patchRequest = {
            inc_votes: 'all the votes'
        }
        return request(app)
        .patch('/api/articles/1')
        .send(patchRequest)
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe("Bad request")
        })
    })
})

describe("PATCH comments", () => {
    const matchCommentObject = {
        comment_id: 6,
        created_at: expect.any(String),
        author: expect.any(String),
        body:  expect.any(String),
        article_id:  expect.any(Number)
      }
    test("Update comment votes when patching with valid body", () => {
        const patchRequest = {
            inc_votes: 3
        }
        matchCommentObject.votes = 3
        return request(app)
        .patch('/api/comments/6')
        .send(patchRequest)
        .expect(200)
        .then(({body}) => {
            expect(body).toMatchObject(matchCommentObject)
        })
    })
    test("Can remove votes", () => {
        const patchRequest = {
            inc_votes: -1
        }
        matchCommentObject.votes = -1
        return request(app)
        .patch('/api/comments/6')
        .send(patchRequest)
        .expect(200)
        .then(({body}) => {
            expect(body).toMatchObject(matchCommentObject)
        })
    })
    test("PATCH to invalid comment ID returns 400 Bad request", () => {
        const patchRequest = {
            inc_votes: 1
        }
        return request(app)
        .patch('/api/comments/invalid')
        .send(patchRequest)
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe("Bad request")
        })
    })
    test("PATCH to valid but missing comment ID returns 404 comment not found", () => {
        const patchRequest = {
            inc_votes: 1
        }
        return request(app)
        .patch('/api/comments/99999')
        .send(patchRequest)
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe("comment not found")
        })
    })
    test("PATCH using invalid body returns 400 Bad request", () => {
        const patchRequest = {
            inc_votes: 'all the votes'
        }
        return request(app)
        .patch('/api/comments/19')
        .send(patchRequest)
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe("Bad request")
        })
    })
})


describe("DELETE comments", () => {
    test("DELETE /api/comments/1 deletes the comment and returns 204 with no content", () => {
        return request(app)
        .delete('/api/comments/1')
        .expect(204)
    })
    test("DELETE to valid but missing comment id returns 404 comment not found", () => {
        return request(app)
        .delete('/api/comments/9999')
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe("comment not found")
        })
    })
    test("DELETE to invalid comment id returns 400 bad request", () => {
        return request(app)
        .delete('/api/comments/invalid')
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe("Bad request")
        })
    })
})

describe("GET users", () => {
    test("Request from /api/users returns an array of all users", () => {
        const matchUserObject = {
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          }
        return request(app)
        .get('/api/users')
        .expect(200)
        .then(({body}) => {
            expect(body.users.length).toBe(4)
            body.users.forEach(user => {
                expect(user).toMatchObject(matchUserObject)
            });
        })
    })
    test("Request from /api/users/:id returns a user", () => {
        const matchUserObject = {
            username: 'lurker',
            name: 'do_nothing',
            avatar_url: 'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png'
          }
        return request(app)
        .get('/api/users/lurker')
        .expect(200)
        .then(({body}) => {
            expect(body).toMatchObject(matchUserObject)
        })
    })
    test("GET /api/users/:id with missing username returns 404 username not found", () => {
        return request(app)
        .get('/api/users/invalid')
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe("username not found")
        })
    })
})

describe("POST topics", () => {
    test("POST /api/topics returns a new article", () => {
        const matchTopicObject = {
            slug: 'A new topic',
            description: 'A description',
          }
        const validTopic = {
            slug: 'A new topic',
            description: 'A description',
          }
        return request(app)
        .post('/api/topics')
        .send(validTopic)
        .expect(201)
        .then(({body}) => {
            expect(body).toMatchObject(matchTopicObject)
        })
    })
    test("POST /api/topics with no description returns a new article", () => {
        const matchTopicObject = {
            slug: 'A new topic',
            description: null,
          }
        const validTopic = {
            slug: 'A new topic',
          }
        return request(app)
        .post('/api/topics')
        .send(validTopic)
        .expect(201)
        .then(({body}) => {
            expect(body).toMatchObject(matchTopicObject)
        })
    })
    test("POST /api/topics with no slug returns 400", () => {
        const invalidTopic = {
            description: 'A description',
          }
        return request(app)
        .post('/api/topics')
        .send(invalidTopic)
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