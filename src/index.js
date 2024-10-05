const express = require('express');
 const app = express();
 const port = process.env.PORT || 3000; // Use the provided port or default to 3000

 // Middleware to parse JSON request bodies
 app.use(express.json());

 // Define a sample route
 app.get('/', (req, res) => {
 res.send('Hello, Express!');
 });

 // Start the server
 app.listen(port, () => {
 console.log(`Server is running on port ${port}`);
 });