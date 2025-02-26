# My Express App

## Description
This is a simple Express server that responds with "Hello, World!" when accessed.

## Getting Started

### Prerequisites
- Node.js
- Docker
- Docker Compose

### Running the Application

#### Using Node.js
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   node server.js
   ```

#### Using Docker
1. Build the Docker image:
   ```bash
   docker build -t my-express-app .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 3000:3000 my-express-app
   ```

#### Using Docker Compose
1. Start the application with Docker Compose:
   ```bash
   docker-compose up
   ```

2. Stop the application:
   ```bash
   docker-compose down
   ```

### Accessing the Application
Open your browser and go to `http://localhost:3000` to see the response. 