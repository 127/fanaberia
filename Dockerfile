# base node image
FROM node:21.7.3-alpine3.18 as base

ENV NODE_ENV production
RUN apk update && apk --no-cache add tzdata icu-data-full build-base postgresql-dev
RUN npm install -g npm@10.7.0

# Install all node_modules, including dev dependencies
FROM base as deps
WORKDIR /myapp
ADD package.json ./
RUN npm install --include=dev

# Setup production node_modules
FROM base as production-deps
WORKDIR /myapp
COPY --from=deps /myapp/node_modules /myapp/node_modules
ADD package.json ./
RUN npm prune --omit=dev

# Build the app
FROM base as build
WORKDIR /myapp
COPY --from=deps /myapp/node_modules /myapp/node_modules
COPY .env_production /myapp/.env
ADD prisma .
RUN npx prisma generate

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

# If you want to use local sqlite database
#
# ENV DATABASE_URL=file:/data/sqlite.db
# ENV PORT="8080"
# ENV NODE_ENV="production"
#
# # add shortcut for connecting to database CLI
# RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules
COPY --from=build /myapp/node_modules/.prisma /myapp/node_modules/.prisma

COPY --from=build /myapp/build /myapp/build
COPY --from=build /myapp/public /myapp/public
COPY --from=build /myapp/package.json /myapp/package.json
COPY --from=build /myapp/start.sh /myapp/start.sh
COPY --from=build /myapp/prisma /myapp/prisma
COPY --from=build /myapp/.env /myapp/.env

EXPOSE 3000
ENTRYPOINT [ "./start.sh" ]
