FROM node:10.23.1-alpine3.11

RUN apk add git make python gcc g++ build-base

# context path should be multisender

COPY ./scripts/docker/start-dapp.sh /
COPY ./blockchain /blockchain
COPY ./multisender /multisender

COPY --from=darcherframework/go-ethereum:latest /usr/local/bin/ethmonitor /usr/local/bin/geth /usr/local/bin/
COPY --from=darcherframework/go-ethereum:latest /entry-*.sh /

RUN chmod +x /start-dapp.sh
RUN cd /multisender && npm i

EXPOSE 8545 8546 8547 30303 30303/udp 8989 3000
