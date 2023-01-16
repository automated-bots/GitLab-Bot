#!/usr/bin/env bash
docker build -t danger89/gitlab-bot .
docker push danger89/gitlab-bot:latest
