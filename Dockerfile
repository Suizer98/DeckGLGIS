FROM mcr.microsoft.com/playwright:v1.44.0-jammy

RUN apt-get update && apt-get install -y \
    # Required so we can run openapi-generator-cli
    default-jre \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/local

COPY package.json package-lock.json* .

RUN npm install && npm cache clean --force
ENV PATH=/usr/local/node_modules/.bin:$PATH

WORKDIR /usr/local/app