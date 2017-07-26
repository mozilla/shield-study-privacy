# METRICS

## Data Analysis
The collected data will primarily be used to answer the following questions.
Images are used for visualization and are not composed of actual data.

### Immediate Questions

* Which privacy preferences cause the most/least breakage?
* On what sites are users reporting the most breakage?
  * How are those sites broken?

### Follow-up Questions

* How might we fix sites that are reported as broken?

## Data Collection

### Server Side
There is currently no server side component besides existing Unified Telemtry.

### Client Side
Study will use SHIELD's Telemetry wrapper with no batching of data.

Clicking the browserAction icon opens a pop-up with panels to report site
breakage problems. We send Telemetry pings on user events in the pop-up.

Details of when pings are sent are below, along with examples of the `payload`
portion of a `shield-study` telemetry ping for each scenario.

#### The user clicks "This page works well" button in the pop-up

```js
  {
    "study": "@shield-study-privacy",
    "branch": "thirdPartyCookiesOnlyFromVisited",
    "event": "page-works",
    "originDomain": "www.redditmedia.com",
    "breakage": "",
    "notes": ""
  }
```

#### The user clicks "Report a problem" button in the pop-up

```js
  {
    "study": "@shield-study-privacy",
    "branch": "thirdPartyCookiesOnlyFromVisited",
    "event": "page-problem",
    "originDomain": "www.redditmedia.com",
    "breakage": "",
    "notes": ""
  }
```

#### The user submits the "There are problems with:" form, which appears after they click the "Report a problem" button

```js
{
  "study": "@shield-study-privacy",
  "branch": "thirdPartyCookiesOnlyFromVisited",
  "event": "breakage",
  "originDomain": "redditmedia.com",
  "breakage": "buttons",
  "notes": ""
}
```

#### The user submits the "Add a comment" form, which appears after they submit the "There are problems with:" form

```js
{
  "study": "@shield-study-privacy",
  "branch": "thirdPartyCookiesOnlyFromVisited",
  "event": "notes",
  "originDomain": "redditmedia.com",
  "breakage": "images",
  "notes": "comment",
}
```

#### The user clicks "Disable privacy study" link

```
{
  "study": "@shield-study-privacy",
  "branch": "thirdPartyCookiesOnlyFromVisited",
  "originDomain": "redditmedia.com",
  "event": "disable",
  "breakage": "",
  "notes": "",
}
```

### A Redshift schema for the payload

```lua
local schema = {
--   column name       field type   length  attributes   field name
    {"study",          "VARCHAR",   255,    nil,         "Fields[payload.study]"},
    {"branch",         "VARCHAR",   255,    nil,         "Fields[payload.branch]"},
    {"event",          "VARCHAR",   255,    nil,         "Fields[payload.event]"},
    {"originDomain",   "VARCHAR",   255,    nil,         "Fields[payload.originDomain]"},
    {"breakage",       "VARCHAR",   255,    nil,         "Fields[payload.breakage]"},
    {"notes",          "VARCHAR",   10000   nil,         "Fields[payload.notes]"}
}
```

### Retention

All Mozilla data is kept by default for 180 days and in accordance with our
privacy policies.
