FROM node:20-slim

# Install FFmpeg and build tools
RUN apt-get update && apt-get install -y ffmpeg python3 build-essential && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Install dependencies (copy from server/)
COPY server/package*.json ./
RUN npm install --production

# Copy server source
COPY server/ .

# Ensure upload directory exists
RUN mkdir -p temp_uploads && chmod 777 temp_uploads

EXPOSE 5000
CMD ["node", "src/index.js"]
