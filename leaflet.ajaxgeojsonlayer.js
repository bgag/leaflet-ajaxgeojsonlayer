/* global $:false, L:true */

'use strict';


/**
 * Layer based on dynamic loaded GeoJSON data
 * @param url
 * @param map
 * @param options
 */
L.AjaxGeoJSONLayer = L.Class.extend({
  includes: L.Mixin.Events,
  initialize: function (url, options) {
    this._url = url;
    this._options = options;
    this._layers = {};
    this._geoJsonLayer = null;
    this._updateBindThis = this.update.bind(this);

    if (!('geoJsonLayers' in this._options)) {
      this._options.geoJsonLayers = {};
    }
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
    return this._geoJsonLayer.getLayers();
  },
  getLayerId: function (layer) {
    return L.stamp(layer);
  },
  buildUrl: function () {
    return this._url + '?bounds=' + this._map.getBounds().toBBoxString();
  },
  update: function () {
    var self = this;

    $.getJSON(self.buildUrl(), function (data) {
      if (self._geoJsonLayer != null) {
        self.removeLayer(self._geoJsonLayer);
      }

      self._geoJsonLayer = L.geoJson(data, self._options.geoJsonLayers);

      self.addLayer(self._geoJsonLayer);

      self.fireEvent('update', self._geoJsonLayer);
    });
  }
});