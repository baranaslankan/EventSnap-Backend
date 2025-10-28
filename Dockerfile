FROM node:18-alpine
WORKDIR /usr/src/app

# install full dependencies (include dev for build and prisma CLI)
COPY package*.json ./
RUN npm ci

# copy source
COPY . .

# build TypeScript
RUN npm run build

# entrypoint will run migrations (if DATABASE_URL present) then start app
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
