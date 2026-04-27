# 1. Use a lightweight Node image
FROM node:20-slim

# 2. Install FFmpeg and other dependencies
RUN apt-get update && apt-get install -y ffmpeg python3 build-essential && rm -rf /var/lib/apt/lists/*

# 3. Create app directory
WORKDIR /usr/src/app

# 4. Install app dependencies
COPY package*.json ./
RUN npm install --production

# 5. Bundle app source
COPY . .

# 6. Ensure the uploads directory exists
RUN mkdir -p temp_uploads && chmod 777 temp_uploads

# 7. Expose the port and start
EXPOSE 5000
CMD [ "node", "src/index.js" ]