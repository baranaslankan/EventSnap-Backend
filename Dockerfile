FROM node:18-alpine
WORKDIR /usr/src/app

# install runtime libs needed by Prisma engines on Alpine
RUN apk add --no-cache openssl libc6-compat

# install full dependencies (include dev for build and prisma CLI)
COPY package*.json ./
RUN npm ci
RUN npx prisma generate

# copy source
COPY . .

# ensure clean build output then build TypeScript
RUN rm -rf dist && npm run build \
 && echo '--- DEBUG: head of compiled dist/photos/s3.service.js ---' \
 && (head -n 40 dist/photos/s3.service.js || true) \
 && echo '--- DEBUG END ---'

# entrypoint will run migrations (if DATABASE_URL present) then start app
RUN install -m 755 entrypoint.sh /usr/local/bin/entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
