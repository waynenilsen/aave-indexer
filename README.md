# Aave-Indexer

I decided to build a basic indexer to support Aave's v3 protocol.

I started to run out of time so it is not fully automated. I wrote the ingest endpoint for a given
block. This is really core to the logic of an indexer, so I wanted to focus on that.

I am very interested in developer experience, so I leaned into eslint and tsconfig to ensure that
high quality code was written. I believe a machine should detect many problematic patterns before
they get into code review and perhaps even get through code review. The options that I use here
are fairly strict overall and some of the choices can be debated but at least they were made. I
mostly used out-of-the-box configurations for these tools and leaned on what the community considered
best practice.

The issue of the ABI linked [here](https://docs.aave.com/developers/deployed-contracts/v3-mainnet/ethereum-mainnet)
for pool tripped me up for a little while because that ABI is missing many events from `library`s that are used
in the Pool contract. I finally found the ABI with all the events in the NPM package for aave-v3.

For now, this only looks at the pool contract. I had considered adding a contracts table which I do think
makes sense. It is also restricted to work only with ETH. The unit tests are quite limited and should be
expanded.

The overall idea is that the code activated by the `ingest_block` endpoint could easily be re-used into any
kind of system that requires this indexing.

## Technology decisions

I decided to use a sqlite database because I only wanted to depend on node to be installed on the person's
machine that had to run it. This sets a very low bar for testing making it very straightforward. There
are some downsides to consider here and it is not a decision that I would make in production however I am
comfortable making that decision for this project.

As far as the server goes, I would not use express again. We used Hapi which I was reasonably satisfied with
it is more modern and built on top of express. The lack of async support in express was fairly painful. The
worst part about that was the fact that the express server is really just serving as a way to easily interact
with my code in a comfortable way.

As far as the language, I have been using typescript at RECUR for some time now and I am comfortable with it.
This would be very easily translated to something that can be deployed to AWS lambda and api gateway.

## Prerequisites

1. This was tested with node 18 but newer versions of node should also work
2. This project uses yarn

## Setting up

1. copy the `.env.example` to `.env` use `cp .env.example .env`
2. set your INFURA_PROJECT_ID value in your new `.env` file
3. run `yarn` to install deps
4. run `yarn migrate` to create the empty database

## Run the server

1. Run `yarn serve` to start the server

## Testing

The main functionality that is implemented here is `ingest_block`

To test `ingest_block` use curl for example

```bash
curl -X POST http://localhost:5000/ingest_block/ETH/17914824/0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2
```

Then to verify that the data were ingested correctly open up the `blockchain_events` table in `./database.db`

```sql
SELECT *
FROM blockchain_events;
```