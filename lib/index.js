// Add-ons SDK modules
const self = require('sdk/self');
const tabs = require('sdk/tabs');
const { URL } = require('sdk/url');
const { Panel } = require('sdk/panel');
const { ToggleButton } = require('sdk/ui/button/toggle');

// Shield modules
const shieldUtils = require('shield-studies-addon-utils');

// Local modules
const study = require('./study').study;

const breakageRadioOptions = {
  'control': [
    {'value': 'layout', 'label': 'Layout'},
    {'value': 'downloads', 'label': 'Downloads'},
    {'value': 'login', 'label': 'Logins'},
    {'value': 'payment', 'label': 'Payments'},
    {'value': 'other', 'label': 'Something else'}
  ],
  'sessionOnlyThirdPartyCookies': [
    {'value': 'payment-failure', 'label': 'Could not complete a payment.'},
    {'value': 'login-failure', 'label': 'Could not sign in.'},
    {'value': 'unexpected-signout', 'label': 'Was unexpectedly signed out.'},
    {'value': 'other', 'label': 'Something else'}
  ],
  'noThirdPartyCookies': [
    {'value': 'payment-failure', 'label': 'Could not complete a payment.'},
    {'value': 'login-failure', 'label': 'Could not sign in.'},
    {'value': 'other', 'label': 'Something else'}
  ],
  'trackingProtection': [
    {'value': 'images', 'label': 'Images'},
    {'value': 'video', 'label': 'Video'},
    {'value': 'layout', 'label': 'Layout'},
    {'value': 'buttons', 'label': 'Buttons'},
    {'value': 'other', 'label': 'Something else'}
  ],
  'originOnlyRefererToThirdParties': [
    {'value': 'images', 'label': 'Images'},
    {'value': 'downloads', 'label': 'Downloads'},
    {'value': 'login-failure', 'label': 'Could not sign in.'},
    {'value': 'other', 'label': 'Something else'}
  ],
  'resistFingerprinting': [
    {'value': 'layout', 'label': 'Layout'},
    {'value': 'fonts', 'label': 'Fonts'},
    {'value': 'flash', 'label': 'Flash'},
    {'value': 'other', 'label': 'Something else'}
  ]
}

study.startup(self.loadReason);

let button = ToggleButton({
  id: "shield-study-privacy-button",
  label: "Shield Study: Privacy",
  icon: "./panel/img/tracking-protection-16.png",
  onChange: handleChange
});

let panel = Panel({
  contentURL: self.data.url('panel/html/popup.html'),
  width: 360,
  height: 480,
  onHide: handleHide
});

panel.port.on('hostReport', function (message) {
  let telemetryPingMessage = {
    branch: study.variation,
    originDomain: getDomainFromActiveTabUrl(),
    event: message.feedback,
    breakage: '',
    notes: ''
  }
  console.log('telemetry ping payload: ' + JSON.stringify(telemetryPingMessage))
  shieldUtils.report(telemetryPingMessage)
});

function getDomainFromActiveTabUrl () {
  return new URL(tabs.activeTab.url).hostname;
}

function reportBreakageOrNotes (message) {
  let notesSubmission = message.hasOwnProperty('notes');
  let telemetryPingMessage = {
    originDomain: getDomainFromActiveTabUrl(),
    event: '',
    breakage: message.breakage
  }
  if (notesSubmission) {
    telemetryPingMessage['notes'] = message.notes;
  }
  console.log('telemetry ping payload: ' + JSON.stringify(telemetryPingMessage))
  shieldUtils.report(telemetryPingMessage)
  if (notesSubmission) {
    panel.hide();
  }
}

function handleChange (state) {
  if (state.checked) {
    panel.show({ position: button });
  }
}

function handleHide () {
  button.state('window', {checked: false});
  panel.contentURL = self.data.url('panel/html/popup.html');
}

panel.port.on('breakage', reportBreakageOrNotes)
panel.port.on('notes', reportBreakageOrNotes)

panel.port.emit('breakageRadioOptions', breakageRadioOptions[study.variation]);
