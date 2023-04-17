# GitLab-Telegram Bot

This bot will handle the following events and inform you via Telegram about those events:

- Issues opened, re-opened & closed;
- Merge requests are opened, re-opened, closed or merged;
- Failing pipelines;
- New releases.

## Production

We will first explain how to use this setup in production. See below for running a development setup.

### Setup

You need to set some settings using environment variables, for that we use the `.env` file. You can use the `.env.example` file as template.

```sh
cp .env.example .env
```

Adapt the `.env` file to your settings.

In production we use Docker, see [docker-compose.yml](docker-compose.yml) file to start the Docker container leveraging Docker Compose. It's advised to run the bot behind a reverse proxy (eg. Nginx).

Start the container using: `docker compose up` or start in the background using: `docker compose up -d`.  
_Note:_ If you installed Docker Compose manually, the script name is `docker-compose` instead of `docker compose`.

### Testing

Some test events will not listen to the triggers (since it will not contain the right trigger information). But the `Releases events` should work from the Test drop-down menu (last option).

For testing purpose you could even disable the whole Telegram bot feature, and first test your GitLab Webhooks, by disabling the Telegram part. Set the `TELEGRAM_ENABLED` environment variable to false:

```bash
export TELEGRAM_ENABLED=false
```

## Adding Webhook

Add your URL as Webhook in your GitLab project, in your GitLab repository go to: `Settings` -> `Webhooks` in the menu.

GitLab Secret token is also required!  
You need to store the same GitLab secret token in your `.env` file using the variable name `GITLAB_SECRET_TOKEN`.

Add the public URL towards this GitLab-Telegram bot, be sure to add `/gitlab` to the end of the URL (eg.`https://bot.mydomain.com/gitlab`, when bot is running behind a reverse proxy).  
Since the route ending with `/gitlab` is mapped to the HTTP GitLab POST Webhook events.

Enable the following triggers or the bot will not work as expected:

- Issues Events
- Merge Requests Events
- Pipeline Events
- Releases Events

Also notice you could _unselect_ the Push events (which is enabled by default).

## Development

### Requirements

- [Node.js LTS](https://nodejs.org/en/download/) with `npm`

```sh
curl -sL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Getting started

Assuming you already fulfilled the requirements above.

1. Clone the project: `git clone git@gitlab.melroy.org:melroy/gitlab-bot.git`
2. Install the NodeJS dependencies via: `npm install`
3. Prepare the `.env` (see [.env.example](.env.example) file), like setting the `URL`, `TELEGRAM_TOKEN`, `GITLAB_SECRET_TOKEN` and `GITLAB_TELEGRAM_CHAT_MAPPING` environment variables.
4. To start the bot by executing: `npm start`

The `GITLAB_TELEGRAM_CHAT_MAPPING` environment variable is a JSON object (with key/value pairs). The key is the GitLab project ID (eg. `42`) and the value is the corresponding Telegram chat ID (`@telegramgroup`). You can have multiple key/value pairs in a single object to serve multiple projects and telegram channels/groups.

_Hint:_ You can also disable the Telegram integration during testing, set: `TELEGRAM_ENABLED=false` in the `.env` file.
