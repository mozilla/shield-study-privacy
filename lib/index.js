// Bootstrap modules
const { AddonManager } = require("resource://gre/modules/AddonManager.jsm");
const { Cu } = require("chrome");
const { LightweightThemeManager } = Cu.import("resource://gre/modules/LightweightThemeManager.jsm", {});
const { Services }  = require('resource://gre/modules/Services.jsm');

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

study.startup(self.loadReason);

let button = ToggleButton({
  id: "shield-study-privacy-button",
  label: "Shield Study: Privacy",
  icon: "./panel/img/report.svg",
  onChange: handleChange
});

const ThemeChanger = {
  existingTheme: null,
  init() {
    this.check();
  },

  setButtonIcon(theme) {
    let icon = './panel/img/report.svg';
    if (theme === 'firefox-compact-dark@mozilla.org') {
      icon = './panel/img/report-d.svg';
    }
    button.icon = icon;
  },

  async check() {
    const theme = this.getTheme();
    this.update(theme);
  },

  update(theme) {
    if (this.existingTheme !== theme) {
      this.setButtonIcon(theme);
      this.existingTheme = theme;
    }
  },

  async observe(subject, topic) {
    if (topic === "lightweight-theme-changed") {
      try {
        const theme = await this.getTheme();
        this.update(theme);
      } catch (e) {
        throw new Error("Unable to get theme; e: ", e);
      }
    }
  },

  getTheme() {
    const defaultTheme = "firefox-compact-light@mozilla.org";
    return new Promise(function (resolve) {
      let theme = defaultTheme;
      if (LightweightThemeManager.currentTheme && LightweightThemeManager.currentTheme.id) {
        theme = LightweightThemeManager.currentTheme.id;
      }
      resolve(theme);
    });
  }
};

ThemeChanger.init();
Services.obs.addObserver(ThemeChanger, 'lightweight-theme-changed', false);

let panel = Panel({
  contentURL: self.data.url('panel/html/popup.html?variation=' + study.variation),
  width: 360,
  height: 480,
  onHide: handleHide
});

panel.port.on('hostReport', function (message) {
  let telemetryPingMessage = {
    study: study.config.name,
    branch: study.variation,
    originDomain: getDomainFromActiveTabUrl(),
    event: message.feedback,
    breakage: '',
    notes: ''
  }
  shieldUtils.report(telemetryPingMessage)
});

function getDomainFromActiveTabUrl () {
  return new URL(tabs.activeTab.url).hostname;
}

function reportBreakageOrNotes (message) {
  let notesSubmission = message.hasOwnProperty('notes');
  let telemetryPingMessage = {
    study: study.config.name,
    branch: study.variation,
    originDomain: getDomainFromActiveTabUrl(),
    event: 'breakage',
    breakage: message.breakage,
    notes: ''
  }
  if (notesSubmission) {
    telemetryPingMessage['event'] = 'notes';
    telemetryPingMessage['notes'] = message.notes;
  }
  shieldUtils.report(telemetryPingMessage)
}

function handleChange (state) {
  if (state.checked) {
    panel.show({ position: button });
  }
}

function handleHide () {
  button.state('window', {checked: false});
  panel.contentURL = self.data.url('panel/html/popup.html?variation=' + study.variation);
}

async function disableAddon () {
  const addon = await AddonManager.getAddonByID(self.id)
  let telemetryPingMessage = {
    study: study.config.name,
    branch: study.variation,
    originDomain: getDomainFromActiveTabUrl(),
    event: 'disable',
    breakage: '',
    notes: ''
  }
  await shieldUtils.report(telemetryPingMessage)
  addon.uninstall()
}

panel.port.on('breakage', reportBreakageOrNotes)
panel.port.on('notes', reportBreakageOrNotes)
panel.port.on('disable', disableAddon)
panel.port.on('close', () => { panel.hide() })
