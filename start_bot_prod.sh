#!/usr/bin/env bash
export $(cat tokens.env | xargs) && screen -dmS bot bash -c 'NODE_ENV=production node app.js'