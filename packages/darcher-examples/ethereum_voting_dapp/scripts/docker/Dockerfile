FROM node:10.23.1-alpine3.11

RUN apk add git python gcc g++ make

# context path should be ethereum_voting_dapp

COPY ./scripts/docker/start-dapp.sh /
COPY ./blockchain /blockchain
COPY ./ethereum_voting_dapp/chapter4 /ethereum_voting_dapp

COPY --from=darcherframework/go-ethereum:latest /usr/local/bin/ethmonitor /usr/local/bin/geth /usr/local/bin/
COPY --from=darcherframework/go-ethereum:latest /entry-*.sh /

RUN chmod +x /start-dapp.sh
RUN cd /ethereum_voting_dapp && npm i && npm run build

EXPOSE 8545 8546 8547 30303 30303/udp 8989 3000
