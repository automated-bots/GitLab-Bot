# GitLab-Telegram Bot

This bot will currently on-purpose only handle the following events:

- Issues opened, re-opened & closed;
- Merge requests are opened, re-opened, closed or merged;
- Failing pipelines;
- New releases.

## Production

### Starting

Install the JavaScript dependencies: `npm install`.

You now need to set several environment variables, you can use the `.env` file.

```sh
cp .env.example .env
```

And adapt the `.env` file. Then start the bot, using:

```sh
npm start
```

The bot will listen on `localhost` on port `3013` by default. You can create a reverse proxy to map `localhost:3013` to a public URL via Nginx for example. Which also allows you to add HTTPS (TLS) on top of the connection.

You can also change the port, by setting the `PORT` environment variable.

Again, by default the bot will _ONLY_ listen on `localhost:3013`. It's adviced to run the bot behind a reverse proxy.

### Testing

Some test events will not listen to the triggers (since it will not contain the right trigger information). But the `Releases events` should work from the Test drop-down menu (last option).

For testing purpose you could even disable the whole Telegram bot feature, and first test your GitLab Webhooks, by disabling the Telegram part. Set the `TELEGRAM_ENABLED` environment variable to false:

```bash
export TELEGRAM_ENABLED=false
```

### Running Production

For production you could also copy `.env.example` to `.env` file.

In production we use Docker, see [docker-compose.yml](docker-compose.yml) file to start the Docker container leveraging Docker Compose.

Start the container using: `docker compose up` or start in the background using: `docker compose up -d`.
_Note:_ If you instaled Docker Compose manually, the script name is `docker-compose` instead of `docker compose`.

## Adding Webhook

Add your URL as Webhook in your GitLab project, under: `Settings` -> `Webhooks` in the menu.

Secret token is not required.

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

- [Node.js v16](https://nodejs.org/en/download/) with `npm`

```sh
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Getting started

Assuming you already fulfilled the requirements above.

1. Clone the project: `git clone git@gitlab.melroy.org:melroy/gitlab-bot.git`
2. Install the NodeJS depedencies via: `npm install`
3. Prepare the `.env` (see [.env.example](.env.example) file), like setting the `HOST`, `TELEGRAM_TOKEN` and `TELEGRAM_CHAT_ID` environment variables.
4. To start the bot by executing: `npm start`

Hint: You can also disable the Telegram integration during testing, set: `TELEGRAM_ENABLED=false` in the `.env` file.
