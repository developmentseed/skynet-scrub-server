/* database object => GeoJSON */
function dbObjToGeoJSON(dbFeature) {
  let feature = dbFeature.object;
  let id = dbFeature.id;
  feature.properties = Object.assign({}, feature.properties, {'id': id});
  return feature;
}

module.exports = dbObjToGeoJSON;

