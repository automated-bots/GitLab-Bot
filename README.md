# LBRY Bot

Botfather for [LBRY](https://lbry.com/) - Which knows everything you want to know

## What?

A Botfather chat bot for LBRY. The one that rule them all!

## Why?

LBRY Bot can be used in chat applications like IRC, [Telegram](https://telegram.org/apps) or Discord to parse requests from clients and return useful information about LBRY.

This information could be anything like content, meta-data, network stats, address info, and much more!

And thus eventually to serve the LBRY user (yes, you)!

## How?

LBRY Bot is written in javascript (maybe TypeScript in the future) using [Node.js](https://nodejs.org/en/download/) with Express.

LBRY Bot initually will use the [lbry-sdk](https://github.com/lbryio/lbry-sdk) in order to retrieve information from the LBRY (eg. blockchain status).

Later the [lbrycrd](https://github.com/lbryio/lbrycrd) raw API and the more efficient [Chainquery](https://github.com/lbryio/chainquery) will be used to retrieve  more information from the LBRY eco-system.

## Who?

Hi, it's me: Melroy van den Berg.

## When?

Currently busy programming.... Please hold the line.

## Developing

Requirements:

* [Node.js v10](https://nodejs.org/en/download/)
* npm (package manager)

```
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs npm
```

### Starting

Starting the bot server: `npm start` or `node app.js`

### Linting

Run lint: `npm run lint`

Fix lint issues: `npm run fix`
