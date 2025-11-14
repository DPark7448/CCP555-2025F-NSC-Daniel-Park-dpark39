# ---------- Build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the production bundle (Parcel -> dist/)
RUN npm run build

# ---------- Runtime stage (nginx) ----------
FROM nginx:alpine

# Copy built static files into nginx's web root
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
