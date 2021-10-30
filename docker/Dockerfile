FROM node:12-alpine3.10 AS builder

LABEL maintainer="sebastian@raubach.co.uk"

ARG BRANCH=master

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
    apk add --no-cache python build-base gcc wget && \
    npm i && \
    npm run build && \
    mkdir /opt/blog-server/client/ && \
    cp -a /opt/blog-client/dist/. /opt/blog-server/client/

# Download Gradle and build the server code
RUN apk add --no-cache openjdk11 && \
    wget https://services.gradle.org/distributions/gradle-6.0.1-bin.zip -P /tmp/ && \
    unzip /tmp/gradle-6.0.1-bin.zip -d /opt/ && \
    echo "data.directory.external=/data/blog/config" > /opt/blog-server/config.properties && \
    echo "project.name=blog" >> /opt/blog-server/gradle.properties && \
    /opt/gradle-6.0.1/bin/gradle -p /opt/blog-server war


FROM tomcat:8-jdk11

LABEL maintainer="sebastian.raubach@hutton.ac.uk"

RUN mkdir -p /usr/local/tomcat/webapps && \
    rm -rf /usr/local/tomcat/webapps/ROOT

COPY --from=builder /opt/blog-server/build/libs/blog-*.war /usr/local/tomcat/webapps/ROOT.war

WORKDIR /usr/local/tomcat/
