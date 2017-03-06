/* Array of features to feature collection */
function fc (features) {
  return {
    type: 'FeatureCollection',
    features: features
  };
}

module.exports = fc;

