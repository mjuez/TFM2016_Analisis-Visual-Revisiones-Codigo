FROM node:carbon
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
ENV PORT 3030
EXPOSE 3030
CMD [ "npm", "start" ]