/** feature.js **/
const prefSvc = require('sdk/preferences/service');
const tabs = require('sdk/tabs');

const ourpref = 'network.cookie.lifetimePolicy';

exports.which = function (val) {
  prefSvc.set(ourpref, val);
  return val;
};

exports.isEligible = function () {
  return !prefSvc.isSet(ourpref);
};

exports.orientation = function (variation) {
  return tabs.open(`data:text/html, You are in the ${variation} variation.`);
};

exports.cleanup = function () {
  return prefSvc.reset(ourpref);
};
