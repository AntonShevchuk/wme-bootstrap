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

## Usage

```javascript
(function () {
  'use strict'

  $(document)
    .on('bootstrap.wme', function () {
      console.info('@ready')
    })
    .on('none.wme', (e, el) => {
      console.info('@none', el)
    })
    .on('node.wme', (e, el) => {
      console.info('@node', el)
    })
    .on('nodes.wme', (e, el) => {
      console.info('@nodes', el)
    })
    .on('segment.wme', (e, el) => {
      console.info('@segment', el)
    })
    .on('segments.wme', (e, el) => {
      console.info('@segments', el)
    })
    .on('venue.wme', (e, el) => {
      console.info('@venue', el)
    })
    .on('venues.wme', (e, el) => {
      console.info('@venues', el)
    })
    .on('point.wme', (e, el) => {
      console.info('@point', el)
    })
    .on('place.wme', (e, el) => {
      console.info('@place', el)
    })
    .on('residential.wme', (e, el) => {
      console.info('@residential', el)
    })
})();
```

## Links

Author homepage: http://anton.shevchuk.name/  
Script homepage: https://github.com/AntonShevchuk/wme-bootstrap  
GreasyFork: https://greasyfork.org/scripts/450160-wme-bootstrap/code/WME-Bootstrap.js
