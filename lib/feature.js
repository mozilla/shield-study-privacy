/** feature.js **/
const prefSvc = require('sdk/preferences/service');
const tabs = require('sdk/tabs');

const studyPrefs = [
  "network.cookies.thirdparty.sessionOnly",
  "network.cookie.cookieBehavior",
  "network.http.referer.trimmingPolicy",
  "privacy.resistFingerprinting",
  "privacy.trackingprotection.enabled"
];

exports.studyPref = function (pref, val) {
  return prefSvc.set(pref, val);
};

exports.isEligible = function () {
  for (let pref of studyPrefs) {
    if (prefSvc.isSet(pref)) {
      return false;
    }
  }
  if (prefSvc.get('browser.privatebrowsing.autostart')) {
    return false;
  }
  if (
    prefSvc.get('privacy.sanitize.sanitizeOnShutdown') &&
    prefSvc.get('privacy.clearOnShutdown.cookies')
  ) {
    return false;
  }
  return true;
};

exports.orientation = function (variation) {
  return tabs.open(`data:text/html, Thank you for helping us study privacy improvements in Firefox. You are in the ${variation} variation. Please use the purple shield browser action button to report site problems.`);
};

exports.cleanup = function () {
  for (let pref of studyPrefs) {
    console.log("resetting pref: ", pref);
    prefSvc.reset(pref);
  }
};
