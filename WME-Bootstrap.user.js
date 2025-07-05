// ==UserScript==
// @name         WME Bootstrap
// @version      0.1.6
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
/* global jQuery, W */

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

      if (!pageWindow.WMEBootstrap) {
        pageWindow.WMEBootstrap = true
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
          .on('segment.wme', () => this.log('🛣️ segment.wme'))
          .on('segments.wme', () => this.log('🛣️️ segments.wme'))
          .on('node.wme', () => this.log('⭐️ node.wme'))
          .on('nodes.wme', () => this.log('⭐️ nodes.wme'))
          .on('venue.wme', () => this.log('📍️ venue.wme'))
          .on('venues.wme', () => this.log('🏬️ venues.wme'))
          .on('point.wme', () => this.log('️🏠 point.wme'))
          .on('place.wme', () => this.log('🏢️️ place.wme'))
          .on('residential.wme', () => this.log('🪧 residential.wme'))
      } catch (e) {
        console.error(e)
      }
    }

    /**
     * Setup additional handler for `selectionchanged` event
     */
    setup () {
      // register handler for selection
      W.selectionManager.events.register(
        'selectionchanged',
        null,
        () => this.handler(W.selectionManager.getSelectedDataModelObjects())
      )
      // fire handler for current selection
      this.handler(W.selectionManager.getSelectedDataModelObjects())
    }

    /**
     * Proxy-handler
     * @param {Array} models
     */
    handler (models) {
      if (models.length === 0) {
        jQuery(document).trigger('none.wme')
        return
      }

      let isSingle = (models.length === 1)
      let model = models[0]

      let has = `:has([subtitle="ID: ${model.getID()}"])`

      switch (true) {
        case (model.type === 'node' && isSingle):
          this.trigger('node.wme', SELECTORS.node + has, model)
          break
        case (model.type === 'node'):
          this.trigger('nodes.wme', SELECTORS.node, models)
          break
        case (model.type === 'segment' && isSingle):
          this.trigger('segment.wme', SELECTORS.segment + has, model)
          break
        case (model.type === 'segment'):
          this
            .waitSegmentsCounter(models.length)
            .then(element => jQuery(document).trigger('segments.wme', [element, models]))
          break
        case (model.type === 'venue' && isSingle):
          this.trigger('venue.wme', SELECTORS.venue + has, model)
          if (model.isResidential()) {
            this.trigger('residential.wme', SELECTORS.venue + has, model)
          } else if (model.isPoint()) {
            this.trigger('point.wme', SELECTORS.venue + has, model)
          } else {
            this.trigger('place.wme', SELECTORS.venue + has, model)
          }
          break
        case (model.type === 'venue'):
          this.trigger('venues.wme', SELECTORS.merge, models)
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
          .trigger(event, [element, models]))
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

        observer.observe(document.getElementById('edit-panel'), {
          childList: true,
          subtree: true
        })
      })
    }

    /**
     * Wait for DOM Element
     * @param counter
     * @return {Promise<HTMLElement>}
     */
    waitSegmentsCounter (counter) {
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
