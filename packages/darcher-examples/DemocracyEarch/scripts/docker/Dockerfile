FROM node:10.23.1-alpine3.11

# context path should be augurproject

COPY ./scripts/docker/start-dapp.sh /
COPY ./blockchain /blockchain
COPY ./sovereign /sovereign

COPY --from=darcherframework/go-ethereum:latest /usr/local/bin/ethmonitor /usr/local/bin/geth /usr/local/bin/
COPY --from=darcherframework/go-ethereum:latest /entry-*.sh /

RUN chmod +x /start-dapp.sh
#RUN cd /sovereign && meteor reset && meteor npm install

EXPOSE 8545 8546 8547 30303 30303/udp 8989 3000
