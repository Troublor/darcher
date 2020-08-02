FROM darcher/ethash:latest

COPY --from=darcher/go-ethereum/executables:latest /darcher-go-ethereum/build/bin/ethmonitor /usr/local/bin/
COPY --from=darcher/go-ethereum/executables:latest /darcher-go-ethereum/build/bin/geth /usr/local/bin/

COPY ./docker /
COPY ./blockchain /blockchain

RUN chmod +x start_blockchain.sh start_doer.sh start_talker.sh start_ethmonitor.sh

EXPOSE 8545 8546 8547 30303 30303/udp 8989

ENTRYPOINT ["/bin/sh", "./start_blockchain.sh"]