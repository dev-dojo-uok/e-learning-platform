# Build Stage
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copy package configurations to build dependencies layer
COPY package*.json ./

RUN npm install

# Copy source code and build assets
COPY . .

# Set up build time arguments for Vite environment
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Nginx Production Stage
FROM nginx:alpine

# Copy built frontend client assets
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copy server routing config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose internal port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
