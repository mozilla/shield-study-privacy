/** feature.js **/
const prefSvc = require('sdk/preferences/service');
const tabs = require('sdk/tabs');

const studyPref = 'network.cookie.thirdparty.sessionOnly';

exports.which = function (val) {
  prefSvc.set(studyPref, val);
  return val;
};

exports.isEligible = function () {
  let userHasAlreadySetPref = prefSvc.isSet(studyPref);
  let userAlwaysPrivateBrowsing = prefSvc.get('browser.privatebrowsing.autostart');
  let userClearsCookiesOnShutdown = (
    prefSvc.get('privacy.sanitize.sanitizeOnShutdown') &&
    prefSvc.get('privacy.clearOnShutdown.cookies')
  );
  return !userHasAlreadySetPref && !userAlwaysPrivateBrowsing && !userClearsCookiesOnShutdown
};

exports.orientation = function (variation) {
  return tabs.open(`data:text/html, Thank you for helping us study privacy improvements in Firefox. Please use the purple shield browser action button to report site problems.`);
};

exports.cleanup = function () {
  return prefSvc.reset(studyPref);
};
