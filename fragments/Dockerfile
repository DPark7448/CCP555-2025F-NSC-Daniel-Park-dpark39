# Fragments microservice — Dockerfile (Cognito)
FROM node:22.12.0

LABEL maintainer="Daniel Park <dpark39@myseneca.com>"
LABEL description="Fragments node.js microservice"

# Reasonable defaults (override at runtime)
ENV PORT=8080 \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

# App directory
WORKDIR /app

# Install deps first for better layer caching
COPY package*.json ./
RUN npm install

# Copy source
COPY ./src ./src

# Document port
EXPOSE 8080

CMD npm start
