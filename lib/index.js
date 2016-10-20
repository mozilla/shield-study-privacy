/** index.js **/
const self = require('sdk/self');

const { Panel } = require('sdk/panel');
const { ToggleButton } = require('sdk/ui/button/toggle');

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

function handleChange (state) {
  if (state.checked) {
    panel.show({ position: button });
  }
}

function handleHide() {
  button.state('window', {checked: false});
}
