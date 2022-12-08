// ==UserScript==
// @name         WME Bootstrap
// @version      0.0.10
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

  class Bootstrap {
    /**
     * Bootstrap it once!
     */
    constructor () {
      const sandbox = typeof unsafeWindow !== 'undefined'
      const pageWindow = sandbox ? unsafeWindow : window

      if (!pageWindow.WMEBootstrap) {
        pageWindow.WMEBootstrap = true
        this.check()
      }
    }

    /**
     * Check loading process
     * @param tries
     */
    check (tries = 100) {
      this.log('try to initialize')
      if (W &&
        W.map &&
        W.model &&
        W.model.countries.top &&
        W.loginManager.user
      ) {
        this.init()
        this.log('was initialized')
      } else if (tries > 0) {
        tries--
        setTimeout(() => this.check(tries), 500)
      } else {
        this.log('initialization failed')
      }
    }

    /**
     * Initial events and handlers
     */
    init () {
      try {
        // setup additional handlers
        this.setup()
        // fire `bootstrap.wme` event
        jQuery(document)
          .trigger('bootstrap.wme')
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
      W.selectionManager.events.register('selectionchanged', null, (event) => this.handler(event.selected))

      this.handler(W.selectionManager.getSelectedFeatures())
    }

    /**
     * Proxy-handler
     * @param {Array} selected
     */
    handler (selected) {
      if (selected.length === 0) {
        jQuery(document).trigger('none.wme')
        return
      }

      let isSingle = (selected.length === 1)
      let models = selected.map(x => x.model)
      let model = models[0]

      switch (true) {
        case (model.type === 'node' && isSingle):
          this.triggerById('node.wme', 'node-edit-general', model)
          break
        case (model.type === 'node'):
          this.triggerById('nodes.wme', 'node-edit-general', models)
          break
        case (model.type === 'segment' && isSingle):
          this.triggerById('segment.wme', 'segment-edit-general', model)
          break
        case (model.type === 'segment'):
          this.triggerByQuery('segments.wme', '#segment-edit-general', '#segment-edit-general .feature-ids-details', models)
          break
        case (model.type === 'venue' && isSingle):
          this.triggerById('venue.wme', 'venue-edit-general', model)
          if (model.isResidential()) {
            this.triggerById('residential.wme', 'venue-edit-general', model)
          } else if (model.isPoint()) {
            this.triggerById('point.wme', 'venue-edit-general', model)
          } else {
            this.triggerById('place.wme', 'venue-edit-general', model)
          }
          break
        case (model.type === 'venue'):
          this.triggerById('venues.wme', 'mergeVenuesCollection', models)
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
    triggerById (event, selector, models) {
      this
        .waitElementById(selector)
        .then(element => jQuery(document).trigger(event, [element, models]))
    }

    /**
     * Fire new event with context
     * It can be #node-edit-general
     *  or #segment-edit-general
     *  or #venue-edit-general
     *  or #mergeVenuesCollection
     * @param {String} event
     * @param {String} element
     * @param {String} selector
     * @param {Object|Array} models
     */
    triggerByQuery (event, element, selector, models) {
      this
        .waitElementByQuery(element, selector)
        .then(element => jQuery(document).trigger(event, [element, models]))
    }

    /**
     * Wait for DOM Element
     * @param selector
     * @return {Promise<HTMLElement>}
     */
    waitElementById (selector) {
      selector = '#' + selector
      return this.waitElementByQuery(selector, selector)
    }

    /**
     * Wait for DOM Element
     * @param element
     * @param selector
     * @return {Promise<HTMLElement>}
     */
    waitElementByQuery (element, selector) {
      return new Promise(resolve => {
        if (document.querySelector(selector)) {
          return resolve(document.querySelector(element))
        }

        const observer = new MutationObserver(mutations => {
          if (document.querySelector(selector)) {
            resolve(document.querySelector(element))
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
      console.log('%cBootstrap:%c ' + message, 'color: #0DAD8D; font-weight: bold', 'color: dimgray; font-weight: normal')
    }
  }

  new Bootstrap()

})()
