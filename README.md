# WME Bootstrap
This is a small Boostrap library for checking WME loading and providing useful events, which you can use for your scripts.

**For what?**

You can meet the realization of checking loading in the many scripts; it looks like this:

```javascript
// 👎
function init() {
  /* checking */
  setTimeout(init, 200) 
}
```

No need more this way; look at the following code:

```javascript
// 👍
$(document).on('bootstrap.wme', () => { /* your code here */ } )
```

So I think it's clear.

**Need more?**

So, it is not all. This script trigger [more events](#events) for common events in the WME where you can manipulate the [arguments](#arguments).

## Development

```bash
npm install
npm run build       # one-off build → dist/WME-Bootstrap.user.js
npm run watch       # rebuild on changes
```

Source is written in TypeScript under `src/`, built with Rollup into a single IIFE at `dist/WME-Bootstrap.user.js`.

```
src/
├── meta.ts          # userscript header
├── globals.d.ts     # getWmeSdk declaration
├── bootstrap.ts     # SELECTORS + Bootstrap class
└── index.ts         # entry point
```

## Require Script

```javascript
// @require https://greasyfork.org/scripts/450160-wme-bootstrap/code/WME-Bootstrap.js
```

## Events

All following events are triggered on the `document`

* `bootstrap.wme` – when all WME-objects are ready for usage
* `none.wme` – when nothing chosen
* `node.wme` – when chosen node for edit
* `nodes.wme` – when chosen more than one node (I'm not sure how it is possible)
* `segment.wme` – when chosen segment for edit
* `segments.wme` – when chosen more than one segment
* `venue.wme` – when chosen place or point for edit
* `venues.wme` – when chosen more than one place or point
* `point.wme` – when chosen point place for edit
* `place.wme` – when chosen place for edit
* `residential.wme` – when chosen residential place for edit

## Arguments

* `event` – [`jQuery.Event`](https://api.jquery.com/category/events/event-object/)
* `element` – [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) of the sidebar panel 
* `model` – depends on type it can be Node, Segment or Venue
* `models` – array of models

## Usage

```javascript
(function () {
  'use strict'

  $(document)
    .on('bootstrap.wme', function () {
      console.info('ready')
    })
    .on('none.wme', (e) => {
      console.info('none')
    })
    .on('node.wme', (event, element, model) => {
      console.info('node', model)
      console.info('sidebar', element)
    })
    .on('nodes.wme', (event, element, models) => {
      console.info('nodes', models)
    })
    .on('segment.wme', (event, element, model) => {
      console.info('segment', model)
      console.info('sidebar', element)
    })
    .on('segments.wme', (event, element, models) => {
      console.info('segments', models)
    })
    .on('venue.wme', (event, element, model) => {
      console.info('venue', model)
    })
    .on('venues.wme', (event, element, model) => {
      console.info('venues', models)
    })
    .on('point.wme', (event, element, model) => {
      console.info('point', model)
    })
    .on('place.wme', (event, element, model) => {
      console.info('place', model)
    })
    .on('residential.wme', (event, element, model) => {
      console.info('residential', model)
    })
})();
```

## Links

Author homepage: https://anton.shevchuk.name/  
Author pet projects: https://hohli.com/  
Support author: https://donate.hohli.com/  
Script homepage: https://github.com/AntonShevchuk/wme-bootstrap  
GreasyFork: https://greasyfork.org/en/scripts/450160-wme-bootstrap
