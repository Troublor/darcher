FROM ubuntu:20.04

ENV NODE_VERSION=10.23.0

RUN apt update; apt install -y curl git python
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN npm i -g yarn
RUN apt install -y make build-essential

# docker context should be heiswap

COPY ./scripts/docker/start-dapp.sh /
ADD ./heiswap /heiswap

RUN chmod +x /start-dapp.sh
RUN cd /heiswap && yarn

ENTRYPOINT ["/start-dapp.sh"]
EXPOSE 3000
