FROM node:22.12.0-alpine AS deps
WORKDIR /app
COPY package*.json ./
# reproducible installs; omit dev deps for the runtime image
RUN npm ci --omit=dev

# ---- runtime image
FROM node:22.12.0-alpine AS runner
ENV NODE_ENV=production \
    PORT=8080 \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

WORKDIR /app

# bring in node_modules from deps layer (better caching, smaller image)
COPY --from=deps /app/node_modules ./node_modules

# copy app source (adjust if you need other files)
COPY . .

# run as non-root (built-in 'node' user exists in node images)
USER node

EXPOSE 8080
CMD ["npm","start"]
