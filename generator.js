var redis = require("redis");
var Bot = require("slackbots");
const config = require("./config");
// redis client
client = redis.createClient({
  url: config.redis.url,
  password: config.redis.password
});

/**
 * randomly generate and publish a message to redis DB
 * runs until terminated
 * messages should be published to one of 3 channels randomly
 *      - mashing
 *      - boiling
 *      - fermentation
 * 
 * Model/ structure (JSON)
 *      {
 *      "status": randomly populate with either "valid", "warning", or "error",
        "message": some randomly generated text,
        "timestamp": A timestamp, formatting of your choosing, that includes both DD/MM/YYYY and HH/MM data (not randomly generated, use the actual time the message occured)
        }
 */

setInterval(() => {
  //   console.log(log);
  let log = generateLog();
  //   console.log(log);
}, 1000);

async function generateLog() {
  // status can be valid, warning, error
  // message is anything
  // timestamp is date time now
  let { status, message } = generateData();

  let log = {
    status,
    message,
    timestamp: Date(new Date())
  };

  publishMessage(log);
  return log;
}

function publishMessage(log) {
  let channelSwitch = Math.floor(Math.random() * Math.floor(3));
  let channel = "";
  switch (channelSwitch) {
    case 0:
      channel = "mashing";
      break;
    case 1:
      channel = "boiling";
      break;
    case 2:
      channel = "fermentation";
      break;
    default:
      channel = "default";
  }
  //   stringifiedLog = JSON.stringify(log);
  //   console.log(log.toString());
  client.publish(channel, JSON.stringify(log));
}

function generateData() {
  let statusInt = Math.floor(Math.random() * Math.floor(3));
  let status = "";
  let message = "";
  switch (statusInt) {
    case 0:
      status = "valid";
      message = "Valid message";
      break;
    case 1:
      status = "warning";
      message = "Warning message";
      break;
    case 2:
      status = "error";
      message = "Error message";
      break;
    default:
      status = "default";
      message = "Default message";
  }
  return { status, message };
}
