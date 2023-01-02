FROM node:alpine 

WORKDIR /usr/app

# Update apk terminal
RUN apk update

COPY package*.json ./ 
COPY prisma ./prisma/

# Install node package
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]

# FROM node:14 AS builder

# # Create app directory
# WORKDIR /app

# # A wildcard is used to ensure both package.json AND package-lock.json are copied
# COPY package*.json ./
# COPY prisma ./prisma/

# # Install app dependencies
# RUN npm install

# COPY . .

# RUN npm run build

# FROM node:14

# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package*.json ./
# COPY --from=builder /app/dist ./dist

# EXPOSE 3000
# CMD [ "npm", "run", "start:prod" ]