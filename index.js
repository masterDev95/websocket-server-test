const WebSocket = require('ws');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 }, () => {
    console.log('Server started on port 8080');
});

// Handle incoming connections
wss.on('connection', (ws) => {
    console.log('Client connected');
    
    // Send a message to the client
    ws.on('message', (message) => {
        console.log('Received: %s', message);
        ws.send('Hello! I received your message');

        let obj;
        // Check if the message is a JSON object
        try {
            obj = JSON.parse(message);
            console.log('Received object: %o', obj);
        } catch (e) {
            console.log('Message is not a JSON object');
            return;
        }

        // Check if the object is not null and has a 'type' property
        if (obj && obj.hasOwnProperty('type') && obj.type === 'test') {
            ws.send('Received test object thx!');
            // Send a message to another server on 8081
            const client = new WebSocket('ws://localhost:8081/dbcom');
            client.on('open', () => {
                client.send(JSON.stringify(obj));
                client.close();
            });
        }
    });
});

// Handle server listening
wss.on('listening', () => {
    console.log('Server is listening');
});