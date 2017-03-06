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

### `GET /features/:z/:x/:y.json`
Gets the GeoJSON features in the database at that z/x/y tile.

### `GET /features/:z/:x/:y.pbf`
Gets the features at the z/x/y tile as a vector tile protobuf suitable for mapbox-gl rendering.

### `GET /features.json`
Gets all the features in the database

### `GET /features/:id.json`
Gets a feature by id

### `PUT /features/:id.json`
Updates a feature by id
`req.body` is a GeoJSON

### `DELETE /features/:id.json`
Deletes a feature by id

### `POST /commit`
Batch update and delete features
`req.body` is a commit object with two keys. `edited` is a list of GeoJSON features with "id" properties corresponding to objects in the database. `deleted` is a list of ids to be deleted in the database.

Commit format: 

```
{
    "edited":
    [
        {
            "type": "Feature",
            "geometry": {"type":"LineString","coordinates":[[123,9],[123,10]]},
            "properties": {"id":"1"}
        },
        {
            "type": "Feature",
            "geometry": {"type":"LineString","coordinates":[[125.455804,9.8069055],[125.456243,9.806644]]},
            "properties": {"id":"2"}
        },
        {
            "type": "Feature",
            "geometry": {"type":"LineString","coordinates":[[123.234,9],[123.24223,10.9238]]},
            "properties": {"id":"4"}
        }
    ],
    "deleted":
    [
        "3"
    ]
}
```

## ⚙ run your own
### dependencies
- Docker
- node 7.6

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
