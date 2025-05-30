# Example Express Server

[![Workload CI](https://github.com/user/repo/actions/workflows/workload.yml/badge.svg)](https://github.com/user/repo/actions/workflows/workload.yml)

A simple Express.js server that responds with "hello world" on port 8080 (default).

## Setup

```bash
# Install dependencies
npm install

# Start the server with default port (8080)
npm start

# Start the server with a custom port
PORT=3000 npm start
```

## Testing

The server includes unit tests with 100% coverage:

```bash
# Run tests
npm test

# Run tests and view coverage report
npm test -- --coverage
```

## Docker Usage

The application can be run as a Docker container:

```bash
# Build the Docker image
docker build -t example-server .

# Run with default port (8080)
docker run -p 8080:8080 example-server

# Run with custom port (e.g., 3000)
docker run -e PORT=3000 -p 3000:3000 example-server
```

### Using the GitHub Container Registry

When code is merged to the main branch, the container is automatically published to GitHub Container Registry:

```bash
# Pull the container from GHCR
docker pull ghcr.io/OWNER/workload-example:latest

# Run the container
docker run -p 8080:8080 ghcr.io/OWNER/workload-example:latest
```

Replace `OWNER` with your GitHub username or organization name.

## Docker Compose Usage

You can also use Docker Compose to run the application:

```bash
# Run with default port (8080)
docker-compose up

# Run with custom PORT
PORT=3000 HOST_PORT=3000 docker-compose up
```

## Note
The server uses port 8080 by default, but you can override it by setting the PORT environment variable. 




