FROM registry.melroy.org/melroy/docker-images/pnpm:22
ENV NODE_ENV production

WORKDIR /app

COPY --chown=node:node package.json package.json
COPY --chown=node:node pnpm-lock.yaml pnpm-lock.yaml

RUN pnpm install --prod && \
  chown -R node:node node_modules

COPY --chown=node:node . .

USER node

EXPOSE 3013

HEALTHCHECK --interval=30s --timeout=12s --start-period=25s \
  CMD node healthcheck.js

CMD ["pnpm", "start"]
