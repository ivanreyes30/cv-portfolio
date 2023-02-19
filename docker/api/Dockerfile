# Common build stage
FROM node:16-alpine as common-build-stage

WORKDIR /app

COPY ./api/package*.json .

RUN npm install

COPY ./api .

# Development build stage
FROM common-build-stage as development-build-stage

ENV NODE_ENV development

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Production build stage
FROM common-build-stage as production-build-stage

ENV NODE_ENV production

EXPOSE 3000

CMD ["npm", "run", "start"]