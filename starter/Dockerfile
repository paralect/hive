FROM --platform=linux/amd64 node:16.13.1-alpine3.13 as base
RUN apk add --no-cache python3 py3-pip

# On staging containers running in development mode
ARG NODE_ENV=development

ARG APP_ENV
ENV NODE_ENV=$NODE_ENV
ENV APP_ENV=$APP_ENV

WORKDIR /project

CMD npm run dev 2>&1 | tee /project/logs/log.txt
