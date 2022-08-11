FROM node:16

ARG npm_token

RUN npm config set @sicpa-dlab:registry https://npm.pkg.github.com/
RUN npm config set '//npm.pkg.github.com/:_authToken' ${npm_token}

RUN mkdir -p /usr/src/cloud-agent
WORKDIR /usr/src/cloud-agent
COPY . /usr/src/cloud-agent

RUN yarn install --no-lockfile

EXPOSE 3000

HEALTHCHECK CMD curl --fail http://localhost:3000/api/health || exit 1
CMD ["yarn", "migrate:start"]
