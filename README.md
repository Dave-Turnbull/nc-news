# Northcoders News API

## About

An express server linked to a Postgress SQL database, the server recieves HTTP requests and serves or modifies the data in the PSQL database.

The data includes users, articles, article comments, and topics.

This project uses Express and Node Postgress

## Hosted version
Requests can be made to a hosted version of this app at: [https://nc-news-b2gg.onrender.com/api](https://nc-news-b2gg.onrender.com/api)


## Setup

*Minimum versions required: Node v21.6.0 & Postgress v14.11*

### Download and install

Run `git clone https://github.com/Dave-Turnbull/nc-news` to download this project.

Run `npm i` to install dependencies.

### Adding environmental variables

Add the environmental variables for the database in root folder in individual .env files:

    File name: '.env.test' & '.env.development'
    Content: `PGDATABASE=(database name)`

    File name: '.env.production'
    Content: `DATABASE_URL=(database URL)`

Use `npm run setup-dbs` to create the testing and development databases, database names can be changed by modifying /db/setup.sql

### Seeding data

When testing, the test database should seed data automatically (see testing below)
To seed the development database use `npm run seed`

## Making requests

Once setup is complete send a GET request to the server at `/api` for a full list of endpoints.

## Testing

Test files can be found in /__tests__/database.tests.js.
To run the tests use `npm t`

Testing seed data is independent of development seed data and will automatically reseed when running each test.

