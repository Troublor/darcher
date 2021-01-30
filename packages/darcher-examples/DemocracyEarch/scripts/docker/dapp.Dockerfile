FROM ubuntu

RUN apt-get update && \
    apt-get install -qqy \
    apt-transport-https \
    build-essential \
    python \
    curl \
    git

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -

RUN apt-get update && apt-get install -qqy nodejs

RUN curl https://install.meteor.com/?release=1.8.3 | sh

# Fix permissions warning; https://github.com/meteor/meteor/issues/7959
ENV METEOR_ALLOW_SUPERUSER true

COPY ./sovereign /sovereign
WORKDIR /sovereign

RUN npm install
RUN meteor npm install && meteor reset

# start sovereign as dev
CMD [ "meteor", "--settings=config/development/settings.json" ]

# start server as prod
# CMD [ "meteor", "--settings=config/production/settings.json" ]
