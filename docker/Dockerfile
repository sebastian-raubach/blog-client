FROM node:22.11-bullseye-slim AS builder

ARG BRANCH=main

# Force docker to not cache the next line
ADD https://api.github.com/repos/sebastian-raubach/blog-client/git/refs/heads/main version.json
# Clone the Blog server code and client code
RUN echo "Pulling GitHub branch: $BRANCH"
RUN apt-get install -y --no-install-recommends git && \
    git clone -b "$BRANCH" --single-branch --depth 1 https://github.com/sebastian-raubach/blog-server.git /opt/blog-server && \
    git clone -b "$BRANCH" --single-branch --depth 1 https://github.com/sebastian-raubach/blog-client.git /opt/blog-client

# Build the client code
WORKDIR /opt/blog-client
RUN rm -f .env && \
    echo "VITE_BASE_URL=./api/" > .env && \
    apt-get update && \
    apt-get install -y --no-install-recommends python3 build-base gcc wget unzip && \
    rm -rf /var/lib/apt/lists/* && \
    npm ci && \
    npm run build && \
    mkdir /opt/blog-server/client/ && \
    cp -a /opt/blog-client/dist/. /opt/blog-server/client/

# Download Gradle and build the server code
RUN apt-get install -y --no-install-recommends openjdk21 && \
    wget https://services.gradle.org/distributions/gradle-8.8-bin.zip -P /tmp/ && \
    unzip /tmp/gradle-8.8-bin.zip -d /opt/ && \
    echo "data.directory.external=/data/blog/config" > /opt/blog-server/config.properties && \
    echo "project.name=blog" >> /opt/blog-server/gradle.properties && \
    /opt/gradle-8.8/bin/gradle -p /opt/blog-server war


FROM tomcat:10.1-jdk21

RUN apt-get update && \
    apt-get --yes --force-yes install unzip zip && \
    # Obscuring server info
    cd ${CATALINA_HOME}/lib && \
    mkdir -p org/apache/catalina/util/ && \
    unzip -j catalina.jar org/apache/catalina/util/ServerInfo.properties -d org/apache/catalina/util/ && \
    sed -i 's/server.info=.*/server.info=Apache Tomcat/g' org/apache/catalina/util/ServerInfo.properties && \
    zip -ur catalina.jar org/apache/catalina/util/ServerInfo.properties && \
    rm -rf org && cd ${CATALINA_HOME} && \
    # Add a default error page mapping to hide the exception message
    sed -i 's/<\/web-app>/    <error-page>\n        <exception-type>java.lang.Throwable<\/exception-type>\n        <location>\/dev\/null<\/location>\n    <\/error-page>\n<\/web-app>/g' conf/web.xml && \
    sed -i 's/<\/Host>/  <Valve className="org.apache.catalina.valves.ErrorReportValve" showReport="false" showServerInfo="false" \/>\n      <\/Host>/g' conf/server.xml

RUN mkdir -p /usr/local/tomcat/webapps && \
    rm -rf /usr/local/tomcat/webapps/ROOT

COPY --from=builder /opt/blog-server/build/libs/blog-*.war /usr/local/tomcat/webapps/ROOT.war

WORKDIR /usr/local/tomcat/
