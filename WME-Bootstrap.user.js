// ==UserScript==
// @name         WME Bootstrap
// @version      0.3.1
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
          .on('segments.wme', () => this.log('🛣️️ segments.wme'))
          .on('node.wme', (event, element, model) => this.log('⭐️ node.wme: ' + model.id))
          .on('nodes.wme', () => this.log('⭐️ nodes.wme'))
          .on('venue.wme', (event, element, model) => this.log('📍️ venue.wme: ' + model.id))
          .on('venues.wme', () => this.log('🏬️ venues.wme'))
          .on('point.wme', () => this.log('️🏠 point.wme'))
          .on('place.wme', () => this.log('🏢️️ place.wme'))
          .on('residential.wme', () => this.log('🪧 residential.wme'))
      } catch (e) {
        console.error(e)
      }
    }

    /**
     * Setup additional handler for `wme-selection-changed` event
     */
    setup () {
      this.wmeSDK = getWmeSdk(
        {
          scriptId: "wme-bootstrap",
          scriptName: "WME Bootstrap"
        }
      );

      // register handler for selection
      this.wmeSDK.Events.on({
        eventName: "wme-selection-changed",
        eventHandler: () => this.handler(
          this.wmeSDK.Editing.getSelection()
        )
      })

      // fire handler for current selection
      this.handler(
        this.wmeSDK.Editing.getSelection()
      )
    }

    /**
     * Proxy-handler
     * @param {Object} selection
     */
    handler (selection) {
      if (!selection || selection.ids.length === 0) {
        jQuery(document).trigger('none.wme')
        return
      }

      let models

      switch (selection.objectType) {
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

      let hasSelector = `#edit-panel:has([subtitle="ID: ${model.id}"]) `

      switch (true) {
        case (selection.objectType === 'node' && isSingle):
          this.trigger('node.wme', hasSelector + SELECTORS.node, model)
          break
        case (selection.objectType === 'node'):
          this.trigger('nodes.wme', SELECTORS.node, models)
          break
        case (selection.objectType === 'segment' && isSingle):
          this.trigger('segment.wme', hasSelector + SELECTORS.segment, model)
          break
        case (selection.objectType === 'segment'):
          this
            .waitSegmentsPanel(models.length)
            .then(element => jQuery(document).trigger('segments.wme', [element, models]))
          break
        case (selection.objectType === 'venue' && isSingle):
          this.trigger('venue.wme', hasSelector + SELECTORS.venue, model)
          if (model.isResidential) {
            this.trigger('residential.wme', hasSelector + SELECTORS.venue, model)
          } else if (model.geometry.type === 'Point') {
            this.trigger('point.wme', hasSelector + SELECTORS.venue, model)
          } else {
            this.trigger('place.wme', hasSelector + SELECTORS.venue, model)
          }
          break
        case (selection.objectType === 'venue'):
          this
            .waitVenuesPanel(models.length)
            .then(element => jQuery(document).trigger('venues.wme', [element, models]))
          break
      }
    }

    /**
     * Fire new event with context
     * It can be #node-edit-general
     *  or #segment-edit-general
     *  or #venue-edit-general
     *  or #mergeVenuesCollection
     * @param {String} event
     * @param {String} selector
     * @param {Object|Array} models
     */
    trigger (event, selector, models) {
      this
        .waitElementBySelector(selector)
        .then(element => jQuery(document)
          .trigger(event, [element, models])
        )
    }

    /**
     * Wait for DOM Element
     * @param {string} selector
     * @return {Promise<HTMLElement>}
     */
    waitElementBySelector (selector) {
      return new Promise(resolve => {
        if (document.querySelector(selector)) {
          return resolve(document.querySelector(selector))
        }

        const observer = new MutationObserver(() => {
          if (document.querySelector(selector)) {
            resolve(document.querySelector(selector))
            observer.disconnect()
          }
        })

        observer.observe(document.getElementById('sidebar'), {
          childList: true,
          subtree: true
        })
      })
    }

    /**
     * Wait for DOM Element
     * @param {Number} counter
     * @return {Promise<HTMLElement>}
     */
    waitSegmentsPanel (counter) {
      let counterSelector = '#edit-panel div.segment.sidebar-column > :first-child'
      return new Promise(resolve => {
        if (
          document.querySelector(counterSelector)?.headline?.startsWith(counter) // beta
          || document.querySelector(counterSelector)?.innerText.startsWith(counter) // wme
        ) {
          return resolve(document.querySelector(SELECTORS.segment))
        }

        const observer = new MutationObserver(() => {
          if (
            document.querySelector(counterSelector)?.headline?.startsWith(counter) // beta
            || document.querySelector(counterSelector)?.innerText.startsWith(counter) // wme
          ) {
            resolve(document.querySelector(SELECTORS.segment))
            observer.disconnect()
          }
        })

        observer.observe(document.getElementById('edit-panel'), {
          childList: true,
          subtree: true
        })
      })
    }

    /**
     * Wait for DOM Element
     * @param {Number} counter
     * @return {Promise<HTMLElement>}
     */
    waitVenuesPanel (counter) {

      let hasSelector = `:has(.merge-venue-card:nth-of-type(${counter}))`
        + `:not(:has(.merge-venue-card:nth-of-type(${counter+1})))`

      return new Promise(resolve => {
        if (document.querySelectorAll(SELECTORS.merge + hasSelector).length) {
          return resolve(document.querySelector(SELECTORS.merge))
        }

        const observer = new MutationObserver(() => {
          if (document.querySelectorAll(SELECTORS.merge + hasSelector).length) {
            resolve(document.querySelector(SELECTORS.merge))
            observer.disconnect()
          }
        })

        observer.observe(document.getElementById('edit-panel'), {
          childList: true,
          subtree: true
        })
      })
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

})()
