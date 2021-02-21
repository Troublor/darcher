FROM node:10.23.1-alpine3.11

# context path should be giveth

COPY ./blockchain/foreign_network /blockchain

COPY --from=darcherframework/go-ethereum:latest /usr/local/bin/ethmonitor /usr/local/bin/geth /usr/local/bin/
COPY --from=darcherframework/go-ethereum:latest /entry-*.sh /

EXPOSE 8545 8546 8547 30303 30303/udp 8989
