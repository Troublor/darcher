FROM ubuntu:latest

RUN apt-get update && \
    apt-get install -qqy \
    apt-transport-https \
    build-essential \
    python \
    curl \
    git

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -

RUN apt-get update && apt-get install -qqy nodejs

RUN npm i -g yarn

# context path should be giveth

COPY ./feathers-giveth /feathers-giveth
COPY ./giveth-dapp /giveth-dapp
COPY ./scripts/docker/start-*.sh /

COPY --from=darcherframework/go-ethereum:latest /usr/local/bin/ethmonitor /usr/local/bin/geth /usr/local/bin/
COPY --from=darcherframework/go-ethereum:latest /entry-*.sh /

RUN chmod +x /start-*.sh
RUN cd /feathers-giveth && npm i
RUN cd /giveth-dapp && npm i

EXPOSE 3030 3010
