const WebSocket = require("ws");
const DOMParser = require("xmldom").DOMParser;

const wss = new WebSocket.Server({ port: 8080 }, () => {
  console.log("Server started on port 8080");
});

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    const msg = message.toString();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(msg, "text/xml");

    console.log("***".repeat(10));
    console.log("Received:\n%s", msg);

    // Check if the message is a valid XML document
    if (xmlDoc.documentElement.nodeName === "parsererror") {
      console.log("Invalid XML document");
      return;
    }

    // Get the root element
    const root = xmlDoc.documentElement;

    // Check if the root element is not null and has a 'type' element
    if (root && root.getElementsByTagName("type").length > 0) {
      const type = root.getElementsByTagName("type")[0].childNodes[0].nodeValue;
      console.log("Type: %s", type);

      if (type === "test" || type === "request") {
        ws.send(`Received ${type}`);
        const client = new WebSocket("ws://localhost:8081/dbcom");
        client.on("open", () => {
          client.send(msg);
        });
      }

      if (type === "response") {
        console.log("Received response");
        const respServ = new WebSocket("ws://localhost:8082/response");
        respServ.on("open", () => {
          console.log("Sending response to 8082");
          respServ.send(msg);
        });
      }
    }
  });
});

wss.on("listening", () => {
  console.log("Server is listening");
});