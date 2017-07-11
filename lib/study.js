/** study.js **/
const self = require('sdk/self');
const shield = require('shield-studies-addon-utils');
const tabs = require('sdk/tabs');
const { when: unload } = require('sdk/system/unload');

const feature = require('./feature');

const studyConfig = {
  name: self.addonId,
  days: 28,
  surveyUrls:  {
    'end-of-study': 'some/url',
    'user-ended-study': 'some/url',
    'ineligible':  null
  },
  variations: {
    'control': () => {},
    'sessionOnlyThirdPartyCookies': () => feature.studyPref('network.cookies.thirdparty.sessionOnly', true),
    'noThirdPartyCookies': () => feature.studyPref('network.cookie.cookieBehavior', 1),
    'thirdPartyCookiesOnlyFromVisited': () => feature.studyPref('network.cookie.cookieBehavior', 3),
    'trackingProtection': () => feature.studyPref('privacy.trackingprotection.enabled', true),
    'originOnlyRefererToThirdParties': () => feature.studyPref('network.http.referer.XOriginTrimmingPolicy', 2),
    'resistFingerprinting': () => feature.studyPref('privacy.resistFingerprinting', true),
    'firstPartyIsolation': () => feature.studyPref('privacy.firstparty.isolate', true),
    'firstPartyIsolationOpenerAccess': () => {
      feature.studyPref('privacy.firstparty.isolate', true)
      feature.studyPref('privacy.firstparty.isolate.restrict_opener_access', false)
    }
  }
};

class PrivacyStudy extends shield.Study {
  isEligible () {
    // bool Already Has the feature.  Stops install if true
    return super.isEligible() && feature.isEligible();
  }
  whenIneligible () {
    super.whenIneligible();
    // additional actions for 'user isn't eligible'
    tabs.open('data:text/html,You are not eligible for this study because you already have a custom privacy preference.');
  }
  whenInstalled () {
    super.whenInstalled();
    console.log('variation: ', this.variation);
    feature.orientation(this.variation);
  }
  cleanup (reason) {
    super.cleanup();  // cleanup simple-prefs, simple-storage
    feature.cleanup();
    // do things, maybe depending on reason, branch
  }
}

const thisStudy = new PrivacyStudy(studyConfig);

// for testing / linting
exports.PrivacyStudy = PrivacyStudy;
exports.studyConfig = studyConfig;

// for use by index.js
exports.study = thisStudy;

unload((reason) => thisStudy.shutdown(reason));
