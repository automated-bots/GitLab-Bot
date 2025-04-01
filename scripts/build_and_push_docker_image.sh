#!/usr/bin/env bash
docker build -t danger89/gitlab-bot:latest -t registry.melroy.org/melroy/gitlab-bot/gitlab-bot:latest .

# Push the images to the DockerHub and the GitLab registry
docker push danger89/gitlab-bot:latest
docker push registry.melroy.org/melroy/gitlab-bot/gitlab-bot:latest
