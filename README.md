# LBRY Bot

Botfather for [LBRY](https://lbry.com/) - Which knows everything you want to know

## What?

A Botfather chat bot for LBRY. The one that rule them all!

Open [@LBRY_telegram_bot](https://telegram.me/LBRY_telegram_bot) in Telegram.

## Why?

LBRY Bot can be used in chat applications like IRC, [Telegram](https://telegram.org/apps) or Discord to parse requests from clients and return useful information about LBRY.

This information could be anything like content, meta-data, network stats, address info, and much more!

And thus eventually to serve the LBRY user (yes, you)!

## How?

LBRY Bot is written in javascript using [Node.js](https://nodejs.org/en/download/).

LBRY Bot initually will use the [lbry-sdk](https://github.com/lbryio/lbry-sdk) (also known as `lbrynet`) in order to retrieve information from the LBRY (eg.  meta-data, resolve URLs and more).

The Bot also uses the [lbrycrd](https://github.com/lbryio/lbrycrd) API (for eg. blockchaininfo, network info, mining info). Last but not least, a more efficient [Chainquery](https://github.com/lbryio/chainquery) will be used to retrieve even more data like address, transactions, blocks, claims, channel info and more.

## Who?

Hi, it's me: Melroy van den Berg.

## When?

Bot is live and available in Telegram: [@LBRY_telegram_bot](https://telegram.me/LBRY_telegram_bot).

## Develop

Requirements:

* [Node.js v10](https://nodejs.org/en/download/)
* npm (package manager)
* [Lbrynet deamon](https://github.com/lbryio/lbry-sdk/releases)
* [Lbrycrd deamon](https://github.com/lbryio/lbrycrd) with txindex turned on

```sh
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs npm
```

### Running

| Chat Service  | Token env. name    | Obtain by                                    |
| ------------- |:------------------:| --------------------------------------------:|
| Telegram      | TELEGRAM_TOKEN     | [@bothfather](https://telegram.me/BotFather) |
| Discord       | TODO               | -                                            |
| IRC           | TODO               | -                                            |

Create & Fill-in the applicable tokens in `tokens.env` file, by using the template (see [tokens.env.example](tokens.env.example)):

```sh
TELEGRAM_TOKEN=xyz
DISCORD_TOKEN=xyz
COINMARKETCAP_API_TOKEN=xyz
RPC_PASSWORD=xyz
```

Finally, starting the bot server: `npm start` (or `node src/index.js`)

**Note 1:** Reverse proxy (eg. Nginx) is required to put between the bot and the world-wide-web. Expose the webserver on port 443 (with SSL). See [nginx_example.conf](nginx_example.conf).

**Note 2:** Assuming you are running the lbrynet deamon (see requirements).

**Note 3:** Assuming you are running the lbrycrd deamon (see requirements), with JSON RPC enabled and txindex enabled. Example of `~/.lbrycrd/lbrycrd.conf`:

```sh
rpcuser=lbry
rpcpassword=xyz
daemon=1
server=1
txindex=1

# The following options are optional (to reduce memory load)
#blocksonly=1 
#dbcache=20
#maxmempool=200
```

### Linting

Run lint: `npm run lint`

Fix lint issues: `npm run fix`

### Unit Testing

Run test: `npm test`

## Production

Starting the bot, can be done via:

* `./start_bot_prod.sh`

The bot can be started via crontab for example:

```sh
@reboot sh /path/to/start_bot_prod.sh
```

**General setup:**

* Be-sure both `lbrycrdd` and `lbrynet` binaries are installed into `/usr/bin` directory!
* Create an user lbry the unix machine (`adduser -M lbry`)

### LBRYcrd setup

* Create the LBRYcrd file (`lbryd.conf`) in `/etc/lbry` (so: `/etc/lbry/lbryd.conf`) for the LBRY Core Daemon service, example of this file:

```sh
rpcuser=lbry
rpcpassword=my_secure_password
daemon=1
server=1
txindex=1

# The following options are optional (to reduce memory load)
blocksonly=1
dbcache=20
maxmempool=200
```

* See [lbrycrd.service systemd file](lbrycrd.service) for Debian based distributions. Place this file into `/etc/systemd/system` folder.
* Core data will be stored into `/var/lib/lbrycrd`

### LBRYnet setup

* Place the LBRYNet file (`lbrynet.yml`) in `/etc/lbry`, example of this file:

```yml
api: 127.0.0.1:5279
streaming_server: 127.0.0.1:5280
allowed_origin: localhost
data_dir: /var/lib/lbrynet
download_dir: /var/lib/lbrynet
wallet_dir: /var/lib/lbryum
save_files: false
save_blobs: false
max_key_fee:
    currency: LBC
    amount: 0
use_keyring: false
```

* See [lbrynet.service systemd file](lbrynet.service). Place also inside `/etc/systemd/system`.
* LBRYNet (SDK) data will be stored into `/var/lib/lbrynet`

## Handy links 

* [LBRY nomics from Brendon](https://github.com/eggplantbren/LBRYnomics)
* [Brendon API](https://www.brendonbrewer.com/lbrynomics/)
