// eslint-disable-next-line @typescript-eslint/no-var-requires
const Notifier = require("../dist/metamask-notifier.bundle");
const notifier = new Notifier("ws://localhost:1237");
notifier.start();
