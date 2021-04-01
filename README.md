# GitLab-Telegram Bot

This bot will currently on-purpose only handle the following events:

* Issues opened, re-opened & closed;
* Merge requests are opened, re-opened, closed or merged;
* Failing pipelines;
* New releases.

## Running

Assuming you already install the deps (`npm install`). Currently the bot is as easy as:

```sh
npm start
```

## Adding Webhook

Add your URL as Webhook in your GitLab project, under: `Settings` -> `Webhooks` in the menu.

Secret token is not required.

Add the public URL towards this GitLab-Telegram bot, be sure to add `/gitlab` to the end of the URL (eg.`https://bot.mydomain.com/gitlab`, when node is installed behind a reverse proxy.  
Since the route ending with `/gitlab`; is the URL route that nodejs will listen to for GitLab Webhook events.

Enable the following triggers or it will not work as expected:

* Issues Events
* Merge Requests Events
* Pipeline Events
* Releases Events

Also notice you could *unselect* the Push events (which is enabled by default).

## Development

Requirements:

* [Node.js v14](https://nodejs.org/en/download/) with npm

```sh
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs npm
```

Clone this project. And install the depedencies via: `npm install`.

Provide the telegram secret via environment variable `TELEGRAM_TOKEN` and finally you can start the bot via:

```sh
npm start
```
