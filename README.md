# krafttax

Wait list page asking one question: *Would you pay to send a box of Kraft Dinner to Soraya Martinez Ferrada?*

If enough people sign up, the full app gets built.

## What's here

- `index.html`: the whole page (inline CSS and JS, EN/FR toggle).
- `api/waitlist.js`: serverless function that stores emails in a Redis set.
- `dev.js`: local preview server with a fake in-memory store.

## Run locally

```sh
npm run dev   # http://localhost:3000
```

## Deploy (Vercel)

1. Import the repo into Vercel. No build step or framework preset is needed.
2. Add an Upstash Redis store from the Vercel Marketplace and connect it to the project.
   This sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`
   (`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` also work).
3. Deploy.

## Reading the list

In the Upstash console or CLI:

```
SCARD waitlist            # how many
SMEMBERS waitlist         # the emails
HGETALL waitlist:meta     # signup time and language per email
```
