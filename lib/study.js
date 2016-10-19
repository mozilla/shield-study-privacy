/** study.js **/
const self = require('sdk/self');
const shield = require('shield-studies-addon-utils');
const tabs = require('sdk/tabs');
const { when: unload } = require('sdk/system/unload');

const feature = require('./feature');

const studyConfig = {
  name: self.addonId,
  duration: 14,
  surveyUrls:  {
    'end-of-study': 'some/url',
    'user-ended-study': 'some/url',
    'ineligible':  null
  },
  variations: {
    'control': () => {},
    'v2': () => feature.which('2')
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
    tabs.open('data:text/html,Uninstalling, you are not eligible for this study because you have a custom network.cookie.lifetimePolicy');
  }
  whenInstalled () {
    super.whenInstalled();
    // orientation, unless our branch is 'notheme'
    if (this.variation === 'control') return;
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
