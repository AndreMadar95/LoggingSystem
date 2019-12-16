var redis = require("redis");
var Bot = require("slackbots");
var express = require("express");
var app = express();
var path = require("path");
var static = require("serve-static");
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var hostname = "127.0.0.1";
const config = require("./config");


app.use(static(__dirname + "/index.html"));

var mashing = [];
var boiling = [];
var fermentation = [];
var allLogs = [];
// slack bot
var settings = {
  token: config.slackBot.token,
  name: config.slackBot.name
};
var bot = new Bot(settings);
const botId = "<@UP866AW4U>";
// redis client
client = redis.createClient({
  url: config.redis.url,
  password: config.redis.password
});
// When we successfully subcribe to a channel...
client.on("subscribe", function (channel, count) {
  console.log(
    "Subscribed to " + channel + ". Now subscribed to " + count + " channel(s)."
  );
});

// When we receive a message from a channel
client.on("message", function (channel, message) {
  let data = JSON.parse(message);
  // store all data in array
  allLogs.push(data);
  console.log(data);
  io.emit("all logs", data);
  // store data based on channel
  storeIncomingMessage(channel, data);
});

bot.on("message", data => {
  // if the message isnt the correct type return
  if (data.type !== "message") {
    return;
  }
  // check if user is talking to bot
  if (data.text.includes(botId)) {
    handleSlackUpdates(data.text);
  }
  console.log(mashing);
});

/**
 *
 * @param {string, text from slackbot} request
 * split(" ") is buggy when previous commands copied and pasted in, need to make sure proper
 * spacing is sent
 */
function handleSlackUpdates(request) {
  const channel = "mashing";
  // parse message
  let parsedRequest = request.split(" ");
  // get status and message
  status = parsedRequest[2];
  //   console.log(parsedRequest);
  //   console.log(status);

  message = parsedRequest.slice(2).join(" ");

  let log = {
    status,
    message,
    timestamp: Date(new Date())
  };
  io.emit("all logs", log);
  io.emit("mashing", log);

  // store the message into a seperate array
  storeIncomingMessage(channel, log);
}
/**
 *
 * @param {string} channel
 * @param {obj} data
 * stores data in an array based on the channel it came from
 */
function storeIncomingMessage(channel, data) {
  switch (channel) {
    case "mashing":
      mashing.push(data);
      console.log("Mashing length", mashing.length);
      io.emit("mashing", data);

      break;
    case "boiling":
      boiling.push(data);
      //   console.log("Boiling length", boiling.length);
      io.emit("boiling", data);

      break;
    case "fermentation":
      fermentation.push(data);
      //   console.log("Fermentation length", fermentation.length);
      io.emit("fermentation", data);

      break;
    default:
      return false;
  }
}

// subscribe to channels
client.subscribe("mashing");
client.subscribe("boiling");
client.subscribe("fermentation");

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "index.html"));
});

app.get("/logs", (req, res) => {
  res.json(mashing);
});

io.on("connection", socket => {
  console.log("User connected");
  io.emit("all logs", "test");
});

http.listen(3000, hostname, () => {
  console.log(`Server running at http://${hostname}:3000/`);
});
