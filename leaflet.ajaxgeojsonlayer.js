/* global $:false, L:true */

'use strict';


/**
 * Layer based on dynamic loaded GeoJSON data
 * @param url
 * @param map
 * @param options
 * @returns {*}
 */
L.ajaxGeoJSONLayer = function (url, map, options) {
  var
    layer = L.layerGroup(),
    geoJsonLayer;

  var buildUrl = function () {
    return url + '?bounds=' + map.getBounds().toBBoxString();
  };

  if ('onChange' in options) {
    layer.onChange = options.onChange;
  } else {
    layer.onChange = function () {};
  }

  layer.update = function () {
    $.getJSON(buildUrl(), function (data) {
      if (geoJsonLayer != null) {
        layer.removeLayer(geoJsonLayer);
      }

      geoJsonLayer = L.geoJson(data, options);

      layer.addLayer(geoJsonLayer);

      layer.onChange(geoJsonLayer);
    });
  };

  // update once for initial load...
  layer.update();

  // ...and on each moveend event
  map.on('moveend', function () {
    layer.update();
  });

  layer.addTo(map);

  return layer;
};