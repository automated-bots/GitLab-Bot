#!/usr/bin/env bash
export $(cat tokens.env | xargs) && NODE_ENV=production node app.js
