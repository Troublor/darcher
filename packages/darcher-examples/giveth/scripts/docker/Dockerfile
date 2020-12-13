FROM darcher/ethash:latest

COPY --from=darcher/go-ethereum/executables:latest /darcher-go-ethereum/build/bin/ethmonitor /usr/local/bin/
COPY --from=darcher/go-ethereum/executables:latest /darcher-go-ethereum/build/bin/geth /usr/local/bin/

# context should be giveth/scripts folder

COPY ./scripts/docker /
COPY ./blockchain /blockchain

RUN chmod +x start_foreign_doer.sh start_foreign_talker.sh start_foreign_ethmonitor.sh start_home_doer.sh start_home_talker.sh start_home_ethmonitor.sh

EXPOSE 8545 8546 8547 30303 30303/udp 8989
