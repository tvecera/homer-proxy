ARG BUILD_IMAGE=node:20.10.0
ARG RUN_IMAGE=node:20-alpine3.19

# Build stage
FROM $BUILD_IMAGE AS build-env
COPY . /app
WORKDIR /app

RUN npm ci && npm run build

# Prepare production dependencies
FROM $BUILD_IMAGE AS deps-env
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Create final production stage
FROM $RUN_IMAGE AS run-env

ENV NODE_ENV="production"

# Install curl
RUN apk --no-cache add curl

WORKDIR /usr/app

USER node
COPY --chown=node:node --from=deps-env /node_modules ./node_modules
COPY --chown=node:node --from=build-env /app/.build ./
COPY package.json ./

# Run health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/healthz || exit 1

EXPOSE 3000

CMD ["node", "--dns-result-order=ipv4first", "src/homer-proxy.js"]
