
/**
 * Module dependencies.
 */

var Identify = require('facade').Identify;
var alias = require('alias');
var convertDates = require('convert-dates');
var integration = require('analytics.js-integration');
var md5 = require('./md5.js');

/**
 * Expose `Boomtrain` integration.
 */

var Boomtrain = module.exports = integration('Boomtrain')
  .global('_bt')
  .option('appId', '')
  .tag('<script src="https://cdn.boomtrain.com/analyticstrain/{{ appId }}/analyticstrain.min.js"></script>');

/**
 * Initialize.
 *
 *
 *
 * @api public
 */

Boomtrain.prototype.initialize = function() {
  window._bt = window._bt || [];
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Boomtrain.prototype.loaded = function() {
  return !!(window._bt && window._bt.push !== Array.prototype.push);
};

/**
 * Identify.
 *
 * 
 *
 * @api public
 * @param {Identify} identify
 */

Boomtrain.prototype.identify = function(identify) {
  if (!identify.userId()) return this.debug('user id required');
  var traits = identify.traits({ createdAt: 'created' });
  traits = alias(traits, { created: 'created_at' });
  traits = convertDates(traits, convertDate);
  window._bt.identify(traits);
  window.console.log('id:' + window._bt.getCurrentId());
  window.console.log('app:' + window._bt.getApp());
};

/**
 * Page.
 *
 *
 *
 * @api public
 * @param {Page} page
 */

Boomtrain.prototype.page = function(page) {
  var properties = page.properties();
  properties.model = getModel();
  properties.id = md5(page.properties().url);
  window._bt.track('viewed', { model: properties.model, id: properties.id});
  window.console.log('Page: ' + page.name());
  window.console.log('Page props: ' + JSON.stringify(properties));
};

/**
 * Track.
 *
 * 
 *
 * @api public
 * @param {Track} track
 */

Boomtrain.prototype.track = function(track) {
  var properties = track.properties();
  window._bt.track(track.event(), properties);
  window.console.log('Tracked: ' + track.event());
  window.console.log('properties: ' + JSON.stringify(track.properties()));
};

/**
 * Convert a date to the format Boomtrain supports.
 *
 * @api private
 * @param {Date} date
 * @return {number}
 */

function convertDate(date) {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Get model of page, stored under meta-tag with property "og:type"
 *
 * @api private
 * @param 
 * @return {string}
 */

function getModel(){
  var elements = window.document.getElementsByTagName('meta');
  var data = {}
  var pattern = 'og:';
  var key = 'property';
  for (var i = elements.length - 1; i >= 0; i--) {
    var property = elements[i].getAttribute && elements[i].getAttribute(key)
    if (property && property.match(pattern)) {
      data[property.replace(pattern, '')] = elements[i].getAttribute('content')
    }
  }
  return data.type;
}