# GitLab-Telegram Bot

This bot will currently on-purpose only handle the following events:

* Issues opened, re-opened & closed;
* Merge requests are opened, re-opened, closed or merged;
* Failing pipelines;
* New releases.

## Production

### Starting

Following environment variables are required, Telegram will require HTTPS conenction:

```bash
export URL=https://bot.mydomain.com
export TELEGRAM_TOKEN=secret
```

Assuming you already install the deps (`npm install`).  
Currently starting the bot is as easy as:

```sh
npm start
```

The bot will listen on `localhost` on port `3013` by default. You can create a reverse proxy to map `localhost:3013` to a public URL via Nginx for example. Which also allows you to add HTTPS (TLS) on top of the connection.

You can also change the port, by setting the `PORT` environment variable.

Again, by default the bot will *ONLY* listen on `localhost:3013` for safety reasons. It's adviced to run the bot behind a reverse proxy or change set the `HOST` environment variable to something else like `0.0.0.0`.

### Testing

Some test events will not listen to the triggers (since it will not contain the right trigger information). But the `Releases events` should work from the Test drop-down menu (last option).

For testing purpose you could even disable the whole Telegram bot feature, and first test your GitLab Webhooks, by disabling the Telegram part. Set the `TELEGRAM_ENABLED` environment variable to false:

```bash
export TELEGRAM_ENABLED=false
```

### Running Production

For production you could also copy `tokens.env.example` to `tokens.env` file. Und use the `start_gitlab_bot.sh` script to start the bot.

## Adding Webhook

Add your URL as Webhook in your GitLab project, under: `Settings` -> `Webhooks` in the menu.

Secret token is not required.

Add the public URL towards this GitLab-Telegram bot, be sure to add `/gitlab` to the end of the URL (eg.`https://bot.mydomain.com/gitlab`, when bot is running behind a reverse proxy).  
Since the route ending with `/gitlab` is mapped to the HTTP GitLab POST Webhook events.

Enable the following triggers or the bot will not work as expected:

* Issues Events
* Merge Requests Events
* Pipeline Events
* Releases Events

Also notice you could *unselect* the Push events (which is enabled by default).

## Development

### Requirements

* [Node.js v14](https://nodejs.org/en/download/) with npm

```sh
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Getting started

Assuming you already fulfilled the requirements above.

1. Clone the project: `git clone git@gitlab.melroy.org:melroy/gitlab-bot.git`
2. Install the NodeJS depedencies via: `npm install`
3. Provide the Telegram secret via environment variable (set `TELEGRAM_TOKEN`), as well as your public URL environment variable (set `URL`, eg. `https://bot.mydomain.com` when behind a reverse proxy)
4. To start the bot, by executing: `npm start`
