#!/usr/bin/env bash
screen -dmS bot bash -c 'export $(cat tokens.env | xargs) && NODE_ENV=production node app.js'