/* globals addon, URL */
const disabled = false // eslint-disable-line no-unused-vars
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
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
  'thirdPartyCookiesOnlyFromVisited': [
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
    {'value': 'screen', 'label': 'Window size'},
    {'value': 'other', 'label': 'Something else'}
  ]
}
const searchParams = new URL(window.location).searchParams
const variation = decodeURIComponent(searchParams.get('variation'))
let breakageChecked = null

// an implimentation of the Fisher-Yates Shuffle
function shuffle (array) {
  let m = array.length
  let temp
  let i
  while (m) { // while there remain elements to shuffle
    // Pick a remaining element at random
    i = Math.floor(Math.random() * m)
    m -= m
    // And swap it with the current element
    temp = Object.assign({}, array[m])
    array[m] = Object.assign({}, array[i])
    array[i] = Object.assign({}, temp)
  }
  return array
}

function show (querySelector) {
  for (let element of document.querySelectorAll(querySelector)) {
    element.classList.remove('hide')
  }
}

function hide (querySelector) {
  for (let element of document.querySelectorAll(querySelector)) {
    element.classList.add('hide')
  }
}

function refreshBreakageOptions () {
  // Shuffle breakage options everytime feedback-panel is shown
  // keep last value "Something Else" at end: don't include in shuffle
  let options = breakageRadioOptions[variation]
  const lastValue = options.pop()
  options = shuffle(options)
  options.push(lastValue)

  // clear out old options (to make room for new shuffle)
  const radioOptionsDiv = document.querySelector('#breakage-radio-options')
  while (radioOptionsDiv.firstChild) {
    radioOptionsDiv.removeChild(radioOptionsDiv.firstChild)
  }

  for (let option of options) {
    const input = document.createElement('input')
    const label = document.createElement('label')

    input.classList.add('breakage')
    input.type = 'radio'
    input.name = 'breakage'
    input.value = option.value
    input.id = option.value

    label.setAttribute('for', option.value)
    label.innerText = option.label

    radioOptionsDiv.appendChild(input)
    radioOptionsDiv.appendChild(label)
    radioOptionsDiv.appendChild(document.createElement('br'))
  }
}

function showFeedbackPanel () {
  hide('#main-panel')
  refreshBreakageOptions() // shuffle and replace the breakage options
  show('#feedback-panel')
  hide('#breakage-notes-panel')
}

function showBreakageNotesPanel () {
  hide('#main-panel')
  hide('#feedback-panel')
  show('#breakage-notes-panel')
}

function showThankYouPanel () {
  hide('#main-panel')
  hide('#feedback-panel')
  hide('#breakage-notes-panel')
  show('#thank-you-panel')
}

// grabbed from http://stackoverflow.com/questions/13203518/javascript-date-suffix-formatting
// for clean date formatting
// TODO: find an alternate solution if we ever L10N
function ordinal (date) {
  if (date > 20 || date < 10) {
    switch (date % 10) {
      case 1:
        return 'st'
      case 2:
        return 'nd'
      case 3:
        return 'rd'
    }
  }
  return 'th'
}

function showHostReport (hostReport) {
  let date = new Date(hostReport.dateTime)
  let hostReportDateTimeString = days[date.getDay()] + ', ' + months[date.getMonth()] + ' ' + date.getDate() + ordinal(date.getDate())
  let hostReportType = '.' + hostReport.feedback + '-host-report'
  document.querySelector(hostReportType + ' .host-report-date').innerText = ' ' + hostReportDateTimeString
  hide('.host-report')
  show(hostReportType)
  show('.host-report-row')
}

function setDisabledUI () {
  hide('.blocking')
  show('.disabled')
  document.querySelector('#enabledSwitch').removeAttribute('checked')
}

function setEnabledUI () {
  hide('.disabled')
  show('.blocking')
  document.querySelector('#enabledSwitch').setAttribute('checked', true)
}

function updateFromBackgroundPage (bgPage) { // eslint-disable-line no-unused-vars
  const disabled = bgPage.topFrameHostDisabled
  if (disabled) {
    setDisabledUI()
  } else {
    setEnabledUI()
  }
  let hostReport = bgPage.topFrameHostReport
  if (hostReport.hasOwnProperty('feedback')) {
    showHostReport(hostReport)
  }
}

for (let feedbackBtn of document.querySelectorAll('.feedback-btn')) {
  feedbackBtn.addEventListener('click', function (event) {
    let feedback = event.target.dataset.feedback
    let hostReport = {
      'feedback': feedback,
      'dateTime': Date.now()
    }
    showHostReport(hostReport)
    addon.port.emit('hostReport', hostReport)
    if (feedback === 'page-problem') {
      showFeedbackPanel()
    } else {
      addon.port.emit('close')
    }
  })
}

for (let submitBtn of document.querySelectorAll('.submit-btn')) {
  submitBtn.addEventListener('click', function (ev) {
    if (ev.target.id === 'submit-breakage-btn') {
      breakageChecked = document.querySelector('input.breakage:checked')
      if (breakageChecked !== null) {
        let message = {
          'breakage': breakageChecked.value
        }
        addon.port.emit('breakage', message)
        showBreakageNotesPanel()
      } else {
        document.querySelector('#breakage-required').className = ''
      }
    } else if (ev.target.id === 'submit-notes-btn') {
      let notes = document.querySelector('textarea#notes').value
      if (notes !== null) {
        let message = {
          'breakage': breakageChecked.value,
          'notes': notes
        }
        addon.port.emit('notes', message)
      }
      showThankYouPanel()
    }
  })
}

document.querySelector('#close-btn').addEventListener('click', () => {
  addon.port.emit('close')
})

for (let disableLink of document.querySelectorAll('.disable-link')) {
  disableLink.addEventListener('click', () => {
    addon.port.emit('disable')
  })
}
