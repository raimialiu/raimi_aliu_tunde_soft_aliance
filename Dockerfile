FROM alpine:latest

RUN apk add --update nodejs npm

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && npm install -g typescript

ADD . /usr/src/app

RUN npm run build

EXPOSE $APP_PORT

# To be used on dev...
CMD ["npm", "run", "start"]
