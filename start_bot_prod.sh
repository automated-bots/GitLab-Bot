#!/usr/bin/env bash
export $(cat tokens.env | xargs) && screen -dmS bot NODE_ENV=production node app.js
