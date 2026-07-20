FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package descriptors first to cache npm dependency layers
COPY package*.json ./

RUN npm install

# Copy database schema file and generate the Prisma Client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the backend source files
COPY . .

# Expose application port
EXPOSE 5001

# Run backend application
CMD ["npm", "start"]
