# Logdrain test

Forked from: https://github.com/vinnicc/drain-test

## Disclaimers

On dev, the app is using postgres, since to use a mongodb connection, you need to have a mongo replica set.

## Setup

```bash
npm i
npm run postgres # spins up a postgres container
npm run prisma-setup # configures prisma
npm run dev

# optional
npx prisma studio # opens a visual editor for the database

```
