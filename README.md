# hoodat-api
Backend API service for [Hoodat mobile app](https://github.com/messiah-hoodat/hoodat-ui).

## Running with Docker (recommended)
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Clone the repo
```
git clone https://github.com/messiah-hoodat/hoodat-api.git
```
3. Add required environment variables to `.env` (ask Eric for the variables)
4. Build the image
```
cd hoodat-api
docker build -t hoodat-api .
```
5. Run the image as a container
```
docker run --rm -it -p 8000:8000/tcp hoodat-api:latest
```

## Running Locally
1. Install [NodeJS](https://nodejs.org/en/)
2. Clone the repo
```
git clone https://github.com/messiah-hoodat/hoodat-api.git
```
3. Install dependencies
```
cd hoodat-api
npm install
```
4. Add required environment variables to `.env` (ask Eric for the variables)
5. Start the server
```
npm run start
```

## API Reference
The API is self-documenting using [tsoa](https://tsoa-community.github.io/docs/) and [Swagger](https://swagger.io/). The documentation can be viewed [here](https://hoodat-api.herokuapp.com/docs).
