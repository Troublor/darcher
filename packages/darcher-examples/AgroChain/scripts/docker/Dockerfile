FROM node:10.23.1-alpine3.11

# context path should be AgroChain

COPY ./scripts/docker/start-dapp.sh /
COPY ./blockchain /blockchain
COPY ./AgroChain /AgroChain

COPY --from=darcherframework/go-ethereum:latest /usr/local/bin/ethmonitor /usr/local/bin/geth /usr/local/bin/
COPY --from=darcherframework/go-ethereum:latest /entry-*.sh /

RUN chmod +x /start-dapp.sh
RUN cd /AgroChain && npm i

EXPOSE 8545 8546 8547 30303 30303/udp 8989 3000
