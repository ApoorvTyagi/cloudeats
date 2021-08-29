FROM node:14-alpine

WORKDIR /src

COPY . .

RUN npm install

EXPOSE 8000

CMD ["node","./app.js"]