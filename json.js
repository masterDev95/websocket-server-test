const WebSocket = require("ws");

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 }, () => {
  console.log("Server started on port 8080");
});

let isSendingVideo = false;

// Handle incoming connections
wss.on("connection", (ws) => {
  console.log("Client connected");

  // Send a message to the client
  ws.on("message", (message) => {
    let isBinary = message.byteLength > 2048;

    // If message is binary, don't log it
    if (!isBinary) {
      console.log("Received: %s", message);
      isSendingVideo = false;
    } else {
      if (!isSendingVideo) {
        console.log("Sending video...");
        isSendingVideo = true;
      }
      const respServ = new WebSocket("ws://localhost:8082/video");
      respServ.on("open", () => {
        respServ.send(message);
      });
      return;
    }

    let obj;
    // Check if the message is a JSON object
    try {
      obj = JSON.parse(message);
      console.log("Received object: %o", obj);
    } catch (e) {
      console.log("Message is not a JSON object");
    }

    // Check if the object is not null and has a 'type' property
    if (obj && obj.hasOwnProperty("type")) {
      if (obj.type === "test" || obj.type === "request") {
        ws.send(`Received ${obj.type}`);
        // Send a message to another server on 8081
        const client = new WebSocket("ws://localhost:8081/dbcom");
        client.on("open", () => {
          client.send(JSON.stringify(obj));
        });
      }

      if (obj.type === "response") {
        console.log("Received response");
        const respServ = new WebSocket("ws://localhost:8082/response");
        respServ.on("open", () => {
          console.log("Sending response to 8082");
          respServ.send(JSON.stringify(obj));
        });
      }
    }
  });
});

// Handle server listening
wss.on("listening", () => {
  console.log("Server is listening");
});
