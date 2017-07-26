/** feature.js **/
const data = require('sdk/self').data;
const prefSvc = require('sdk/preferences/service');
const tabs = require('sdk/tabs');

const studyPrefs = [
  'network.cookie.thirdparty.sessionOnly',
  'network.cookie.cookieBehavior',
  'network.http.referer.trimmingPolicy',
  'privacy.resistFingerprinting',
  'privacy.trackingprotection.enabled',
  'privacy.resistFingerprinting',
  'privacy.firstparty.isolate',
  'privacy.firstparty.isolate.restrict_opener_access'
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
  return tabs.open(data.url('orientation.html'));
};

exports.cleanup = function () {
  for (let pref of studyPrefs) {
    console.log('resetting pref: ', pref);
    prefSvc.reset(pref);
  }
  return tabs.open(data.url('https://mozilla.github.io/shield-study-privacy/thankyou.html'));
};
