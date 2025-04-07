# BardsBallad Backend

## Description
This is the backend of BardsBallad.

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
   docker build -t bb-backend .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 3000:3000 bb-backend
   ```

#### Using Docker Compose
1. Build the application with Docker Compose:
   ```bash
   docker compose up --build
   ```

2. Start the application:
   ```bash
   docker compose up
   ```

3. Stop the application:
   ```bash
   docker compose down
   ```

4. Stop the application, remove containers, and volumes:
   ```bash
   docker compose down -v
   ```

### Accessing the Application
Open your browser and go to `http://localhost:3000` to see the response. 