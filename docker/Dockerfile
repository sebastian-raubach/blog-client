FROM node:22.11-alpine3.20 AS builder

LABEL maintainer="sebastian@raubach.co.uk"

ARG BRANCH=main

# Force docker to not cache the next line
ADD https://api.github.com/repos/sebastian-raubach/blog-client/git/refs/heads/main version.json
# Clone the Blog server code and client code
RUN echo "Pulling GitHub branch: $BRANCH"
RUN apk add --no-cache git && \
    git clone -b "$BRANCH" --single-branch --depth 1 https://github.com/sebastian-raubach/blog-server.git /opt/blog-server && \
    git clone -b "$BRANCH" --single-branch --depth 1 https://github.com/sebastian-raubach/blog-client.git /opt/blog-client

# Build the client code
WORKDIR /opt/blog-client
RUN rm -f .env && \
    echo "VUE_APP_BASE_URL=./api/" > .env && \
    apk add --no-cache python3 build-base gcc wget && \
    npm i --legacy-peer-deps && \
    npm run build && \
    mkdir /opt/blog-server/client/ && \
    cp -a /opt/blog-client/dist/. /opt/blog-server/client/

# Download Gradle and build the server code
RUN apk add --no-cache openjdk21 && \
    wget https://services.gradle.org/distributions/gradle-8.8-bin.zip -P /tmp/ && \
    unzip /tmp/gradle-8.8-bin.zip -d /opt/ && \
    echo "data.directory.external=/data/blog/config" > /opt/blog-server/config.properties && \
    echo "project.name=blog" >> /opt/blog-server/gradle.properties && \
    /opt/gradle-8.8/bin/gradle -p /opt/blog-server war


FROM tomcat:10.1-jdk21

LABEL maintainer="sebastian@raubach.co.uk"

RUN mkdir -p /usr/local/tomcat/webapps && \
    rm -rf /usr/local/tomcat/webapps/ROOT

COPY --from=builder /opt/blog-server/build/libs/blog-*.war /usr/local/tomcat/webapps/ROOT.war

WORKDIR /usr/local/tomcat/
