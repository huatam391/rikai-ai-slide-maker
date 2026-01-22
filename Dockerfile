# Use Node.js 20 Alpine as base image
FROM node:20-alpine

# Install LibreOffice, poppler-utils (for pdftoppm), and required dependencies
RUN apk add --no-cache \
    libreoffice \
    poppler-utils \
    ttf-dejavu \
    ttf-liberation \
    font-noto \
    font-noto-cjk \
    msttcorefonts-installer \
    fontconfig \
    && update-ms-fonts \
    && fc-cache -f

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Create output and data directories
RUN mkdir -p output

# Build Nuxt application
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment variable for LibreOffice
ENV LIBRE_OFFICE_PATH=/usr/bin/libreoffice

# Start the application
CMD ["node", ".output/server/index.mjs"]