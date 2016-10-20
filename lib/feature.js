/** feature.js **/
const prefSvc = require('sdk/preferences/service');
const tabs = require('sdk/tabs');

const studyPref = 'network.cookie.thirdparty.sessionOnly';

exports.which = function (val) {
  prefSvc.set(studyPref, val);
  return val;
};

exports.isEligible = function () {
  return !prefSvc.isSet(studyPref);
};

exports.orientation = function (variation) {
  let prefValue = prefSvc.get(studyPref);
  return tabs.open(`data:text/html, You are in the ${variation} variation. ${studyPref} is set to ${prefValue}`);
};

exports.cleanup = function () {
  return prefSvc.reset(studyPref);
};
