FROM node:21-alpine

RUN mkdir -p /home/sindyoping12/project-ta/node_modules

WORKDIR /home/sindyoping12/project-ta

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD [ "node", "index.js"]
