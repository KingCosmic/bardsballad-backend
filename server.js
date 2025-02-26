const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const routes = require('./routes/index');
const cors = require('cors');

const startServer = async () => {
  // Middleware
  app.use(cors());
  app.use(express.json());

  // Use the routes
  app.use('/', routes);

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();
