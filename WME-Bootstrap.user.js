// ==UserScript==
// @name         WME Bootstrap
// @version      0.4.0
// @description  Bootstrap library for custom Waze Map Editor scripts
// @license      MIT License
// @author       Anton Shevchuk
// @namespace    https://greasyfork.org/users/227648-anton-shevchuk
// @supportURL   https://github.com/AntonShevchuk/wme-bootstrap/issues
// @match        https://*.waze.com/editor*
// @match        https://*.waze.com/*/editor*
// @exclude      https://*.waze.com/user/editor*
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://anton.shevchuk.name&size=64
// @grant        none
// ==/UserScript==

/* jshint esversion: 8 */
/* global jQuery */
/* global sdk */

(function () {
  'use strict'

  const SELECTORS = {
    node: 'div.connections-edit',
    segment: '#segment-edit-general',
    venue: '#venue-edit-general',
    merge: '#mergeVenuesCollection'
  }

  class Bootstrap {
    /**
     * Bootstrap it once!
     */
    constructor () {
      const sandbox = typeof unsafeWindow !== 'undefined'
      const pageWindow = sandbox ? unsafeWindow : window

      if (!pageWindow.WMEBootstrapReady) {
        pageWindow.WMEBootstrapReady = true
        document.addEventListener(
          'wme-ready',
          () => this.init(),
          { once: true },
        );
      }
    }

    /**
     * Initial events and handlers
     */
    init () {
      try {
        // fire `bootstrap.wme` event
        jQuery(document).trigger('bootstrap.wme')
        // setup additional handlers
        this.setup()
        // listen all events
        jQuery(document)
          .on('segment.wme', (event, element, model) => this.log('🛣️ segment.wme: ' + model.id))
          .on('segments.wme', (event, element, models) => this.log('🛣️️ segments.wme: ' + models.length + ' elements'))
          .on('node.wme', (event, element, model) => this.log('⭐️ node.wme: ' + model.id))
          .on('nodes.wme', (event, element, models) => this.log('⭐️ nodes.wme: ' + models.length + ' elements'))
          .on('venue.wme', (event, element, model) => this.log('📍️ venue.wme: ' + model.id))
          .on('venues.wme', (event, element, models) => this.log('🏬️ venues.wme: ' + models.length + ' elements'))
          .on('point.wme', () => this.log('️🏠 point.wme'))
          .on('place.wme', () => this.log('🏢️️ place.wme'))
          .on('residential.wme', () => this.log('🪧 residential.wme'))
      } catch (e) {
        console.error(e)
      }
    }

    /**
     * Setup additional handler for `wme-feature-editor-opened` event
     * https://www.waze.com/editor/sdk/interfaces/index.SDK.SdkEvents.html#wme-feature-editor-opened
     */
    setup () {
      this.wmeSDK = getWmeSdk({
        scriptId: "wme-bootstrap",
        scriptName: "WME Bootstrap"
      });

      // register handler for feature
      this.wmeSDK.Events.on({
        eventName: "wme-feature-editor-opened",
        eventHandler: ({featureType}) => this.eventHandler(featureType)
      })

      // register handler for nothing
      this.wmeSDK.Events.on({
        eventName: "wme-selection-changed",
        eventHandler: () => {
          if (!this.wmeSDK.Editing.getSelection()) {
            jQuery(document).trigger('none.wme')
          }
        }
      })
    }

    /**
     * Handler for selected features
     * @param {String} featureType one of "node" | "segment" | "venue"
     * @return void
     */
    eventHandler (featureType) {
      let models
      let selection = this.wmeSDK.Editing.getSelection()

      switch (featureType) {
        case 'node':
          models = selection.ids.map((id) => this.wmeSDK.DataModel.Nodes.getById( { nodeId: id } ))
          break;
        case 'segment':
          models = selection.ids.map((id) => this.wmeSDK.DataModel.Segments.getById( { segmentId: id } ))
          break;
        case 'venue':
          models = selection.ids.map((id) => this.wmeSDK.DataModel.Venues.getById( { venueId: id } ))
          break;
      }

      let isSingle = (models.length === 1)

      let model = models[0]

      switch (true) {
        case (featureType === 'node' && isSingle):
          this.eventTrigger('node.wme', SELECTORS.node, model)
          break
        case (featureType === 'node'):
          this.eventTrigger('nodes.wme', SELECTORS.node, models)
          break
        case (featureType === 'segment' && isSingle):
          this.eventTrigger('segment.wme', SELECTORS.segment, model)
          break
        case (featureType === 'segment'):
          this.eventTrigger('segments.wme', SELECTORS.segment, models)
          break
        case (featureType === 'venue' && isSingle):
          this.eventTrigger('venue.wme', SELECTORS.venue, model)
          if (model.isResidential) {
            this.eventTrigger('residential.wme', SELECTORS.venue, model)
          } else if (model.geometry.type === 'Point') {
            this.eventTrigger('point.wme', SELECTORS.venue, model)
          } else {
            this.eventTrigger('place.wme', SELECTORS.venue, model)
          }
          break
        case (featureType === 'venue'):
          this.eventTrigger('venues.wme', SELECTORS.venue, models)
          break
      }
    }

    /**
     * Trigger the document event
     *  - pass the DOM Element as argument
     *  - pass the Model(s) as argument
     * @param {String} eventType
     * @param {String} selector
     * @param {Object|Object[]} models
     */
    eventTrigger (eventType, selector, models) {
      jQuery(document).trigger(eventType, [document.querySelector(selector), models])
    }

    /**
     * Just logger
     * @param {String} message
     */
    log (message) {
      console.log(
        '%cBootstrap:%c ' + message,
        'color: #0DAD8D; font-weight: bold', 'color: dimgray; font-weight: normal'
      )
    }
  }

  new Bootstrap()

})();
