# Shield Study: Privacy

When we want to know the effects of certain Firefox changes to improve privacy,
we can make the changes in an arm/variation of this shield study add-on,
so we can measure the effect of the changes via Telemetry.

## Current study

To see what the add-on is studying, check the `studyConfig.variations` in
`lib/study.js`.


## Run it

The easiest way to run the study add-on is with the `shield` cli.

1. `npm i -g shield-study-cli jpm`
2. `shield run . -- -b Aurora`

You can also make `shield` start Firefox with a certain variation:

`shield run . <variation> -- -b Aurora`

## See also

* [shield-studies-addon-template README](https://github.com/mozilla/shield-studies-addon-template/blob/master/README.md)
* [shield-studies-addon-utils](https://github.com/mozilla/shield-studies-addon-utils)
* [howToShieldStudy](https://github.com/mozilla/shield-studies-addon-utils/blob/master/howToShieldStudy.md)
* [shield-studies-docs](https://mozilla.github.io/shield-studies-docs/)
