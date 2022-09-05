# WME Bootstrap
Bootstrap library for custom WME scripts

## Require Script

```javascript
// @require https://greasyfork.org/scripts/450160-wme-bootstrap/code/WME-Bootstrap.js
```

## Events

* `bootstrap.wme` – on `document`, when all ready for usage
* `none.wme` – on `document`, when nothing chosen
* `node.wme` – on `document`, when chosen node for edit
* `nodes.wme` – on `document`, when chosen more than one node (I'm not sure how it possible)
* `segment.wme` – on `document`, when chosen segment for edit
* `segments.wme` – on `document`, when chosen more than one segment
* `venue.wme` – on `document`, when chosen place or point for edit
* `venues.wme` – on `document`, when chosen more than one place or point
* `point.wme` – on `document`, when chosen point place for edit
* `place.wme` – on `document`, when chosen place for edit
* `residential.wme` – on `document`, when chosen residential place for edit

## Arguments

* `event` – [`jQuery.Event`](https://api.jquery.com/category/events/event-object/)
* `element` – [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) of the sidebar panel 
* `model` – `W.model`
* `models` - array of `W.model`

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
    })
    .on('nodes.wme', (event, element, models) => {
      console.info('nodes', models)
    })
    .on('segment.wme', (event, element, model) => {
      console.info('segment', model)
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

Author homepage: http://anton.shevchuk.name/  
Script homepage: https://github.com/AntonShevchuk/wme-bootstrap  
GreasyFork: https://greasyfork.org/scripts/450160-wme-bootstrap/code/WME-Bootstrap.js
