<h1 align="center">skynet-scrub-server 🌏 </h1>
<div align="center">
<i>
Database of features!
</i>
</div>
<br />

A feature server for the skynet-scrub tool. Uses [tile38](http://tile38.com) for the backing store.

## 📖 api
### `GET /`
Renders a mapbox-gl map with all the features

### `GET /features/z/x/y`
Gets the GeoJSON features in the database at that z/x/y tile.

### `GET /z/x/y.pbf`
Gets the features at the z/x/y tile as a vector tile protobuf suitable for mapbox-gl rendering.

## ⚙ run your own
### dependencies
- Docker
- node 6+

## run the database
```
docker pull tile38/tile38
mkdir data
npm run start-db
```
This will host the database at localhost:9851

## import data into database 

```
yarn install
bin/import.js -f test/fixtures/testset.geojson
```

## run the server

Options:

- --token: a mapbox token to access the rendered map
- --port: the tcp port where the server will run (defaults to `4030`)
- --addr: the address where the server will run (used to construct URLs in the html, defaults to `http://localhost:4030`)

```
node index.js --token MAPBOX_ACCESS_TOKEN
```

Open a browser at [http://localhost:4030](http://localhost:4030) ✨
