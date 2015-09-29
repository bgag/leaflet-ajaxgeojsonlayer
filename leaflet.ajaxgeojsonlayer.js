/* global $:false, L:true */

'use strict';

if (module && module.exports) {
  var L = require('leaflet');
} else {
  //do nothing
}

/**
 * Layer based on dynamic loaded GeoJSON data
 * @param url
 * @param map
 * @param options
 */
var AjaxGeoJSONLayer = L.Class.extend({
  includes: L.Mixin.Events,
  initialize: function (url, options) {
    this._url = url;
    this._options = options;
    this._layers = {};
    this._enabled = true;
    this._geoJsonLayer = null;
    this._updateBindThis = this.update.bind(this);

    if (!('geoJsonLayers' in this._options)) {
      this._options.geoJsonLayers = {};
    }
  },
  enable: function () {
    this._enabled = true;

    if (this._geoJsonLayer != null) {
      this.addLayer(this._geoJsonLayer);
    }
  },
  disable: function () {
    this._enabled = false;

    if (this._geoJsonLayer != null) {
      this.removeLayer(this._geoJsonLayer);
    }
  },
  enabled: function () {
    return this._enabled;
  },
  onAdd: function (map) {
    this._map = map;

    map.on('moveend', this._updateBindThis);

    this.update();
  },
  onRemove: function (map) {
    this._map = null;

    map.off('moveend', this._updateBindThis);

    map.removeLayer(this._geoJsonLayer);
  },
  addLayer: function (layer) {
    var id = this.getLayerId(layer);

    this._layers[id] = layer;

    if (this._map) {
      this._map.addLayer(layer);
    }

    return this;
  },
  removeLayer: function (layer) {
    var id = layer in this._layers ? layer : this.getLayerId(layer);

    if (this._map && this._layers[id]) {
      this._map.removeLayer(this._layers[id]);
    }

    delete this._layers[id];

    return this;
  },
  getLayers: function () {
    return this._geoJsonLayer ? this._geoJsonLayer.getLayers() : [];
  },
  getLayerId: function (layer) {
    return L.stamp(layer);
  },
  buildUrl: function () {
    return this._url + '?bounds=' + this._map.getBounds().toBBoxString();
  },
  update: function () {
    var self = this;

    if (!self._enabled) {
      return;
    }

    $.getJSON(self.buildUrl(), function (data) {
      if (self._geoJsonLayer != null) {
        self.removeLayer(self._geoJsonLayer);
      }

      self._geoJsonLayer = L.geoJson(data, self._options.geoJsonLayers);

      self.addLayer(self._geoJsonLayer);

      self.fireEvent('update', self._geoJsonLayer);
    });
  },
  setStyle: function (style) {
    if (!style)
      return;
    var self = this;
    self._options.geoJsonLayers.style = style;
  },
  resetStyle: function () {
    var self = this;
    self._options.geoJsonLayers.style = self._options.style;
  },
  zoomToLayer: function () {
    var self = this;
    if (this._geoJsonLayer){
      this._map.fitBounds(this._geoJsonLayer.getBounds());
    }
  }
});

if (module && module.exports) {
  module.exports = AjaxGeoJSONLayer;
} else {
  L.AjaxGeoJSONLayer = AjaxGeoJSONLayer;
}