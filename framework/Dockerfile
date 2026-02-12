FROM --platform=linux/amd64 node:16.13.1-alpine3.13 as base
RUN apk add --no-cache python3 py3-pip

ENV NODE_ENV=production
ENV APP_ENV=production

WORKDIR /app
EXPOSE 3001
COPY ["./package*.json", "/app/"]

RUN npm set progress=false && npm config set depth 0

RUN npm set-script prepare ""

RUN npm ci --only=production --quiet

COPY ./ ./

RUN mkdir -p /project/logs
RUN touch /project/logs/log.txt

CMD npm start 2>&1 | tee /project/logs/log.txt