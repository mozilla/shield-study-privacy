// Add-ons SDK modules
const self = require('sdk/self');
const tabs = require('sdk/tabs');
const { URL } = require('sdk/url');
const { Panel } = require('sdk/panel');
const { ToggleButton } = require('sdk/ui/button/toggle');

// Shield modules
const shieldUtils = require('shield-studies-addon-utils');

// Local modules
require('./study').study.startup(self.loadReason);

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

panel.port.on('hostReport', function(message) {
  let telemetryPingMessage = {
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
    breakage: message.breakage,
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

panel.port.on('breakage', reportBreakageOrNotes)
panel.port.on('notes', reportBreakageOrNotes)

function handleChange (state) {
  if (state.checked) {
    panel.show({ position: button });
  }
}

function handleHide() {
  button.state('window', {checked: false});
}


