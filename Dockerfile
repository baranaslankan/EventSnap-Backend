FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Install runtime libs for Prisma on Alpine
RUN apk add --no-cache openssl libc6-compat bash

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Make sure entrypoint exists (optional for EB)
RUN chmod +x entrypoint.sh

# Expose the default EB port
EXPOSE 8080

# Start the app
CMD ["npm", "run", "start:prod"]
