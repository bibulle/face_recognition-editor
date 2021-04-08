# -------------
FROM node:12 AS BUILD

WORKDIR /usr/src

COPY package*.json ./
COPY decorate-angular-cli.js ./
COPY angular.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

RUN npm install

COPY libs libs
RUN mkdir apps

COPY apps/frontend apps/frontend
RUN npm run ng build frontend -- --prod

COPY apps/backend apps/backend
RUN npm run ng build backend -- --prod

#RUN npm install -g nx
#RUN npm ci --only=production

# -------------
FROM node:12

WORKDIR /usr/src

COPY package*.json ./
COPY decorate-angular-cli.js ./
COPY --from=BUILD /usr/src/dist dist/ 

RUN npm install --production

ENV PORT=3000

VOLUME ["/frontend"]
VOLUME ["/train_dir"]
VOLUME ["/test_dir"]
EXPOSE 3000

CMD mv dist/apps/frontend/* /frontend && node dist/apps/backend/main.js