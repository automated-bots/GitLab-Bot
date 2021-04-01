#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR
screen -dmS gitlab_bot bash -c 'NODE_ENV=production node .'

