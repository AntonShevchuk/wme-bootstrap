// ==UserScript==
// @name         WME Bootstrap
// @namespace    https://greasyfork.org/users/227648-anton-shevchuk
// @version      0.0.1
// @description  Bootstrap library for custom Waze Map Editor scripts
// @license      MIT License
// @match        https://www.waze.com/editor*
// @match        https://www.waze.com/*/editor*
// @match        https://beta.waze.com/editor*
// @match        https://beta.waze.com/*/editor*
// @exclude      https://www.waze.com/user/editor*
// @exclude      https://beta.waze.com/user/editor*
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://anton.shevchuk.name&size=64
// @grant        none
// ==/UserScript==

/* jshint esversion: 6 */

/* global W */

(async function ($) {
  'use strict'

  const APIHelper = 'https://greasyfork.org/scripts/389117-apihelper/code/APIHelper.js'
  const APIHelperUI = 'https://greasyfork.org/scripts/389577-apihelperui/code/APIHelperUI.js'
  const CommonUtils = 'https://greasyfork.org/scripts/389765-common-utils/code/CommonUtils.js'

  const WMEEvents = ''
  const WMEClass = ''

  class Bootstrap {
    log (message) {
      console.log('%cBootstrap:%c ' + message, 'color: #0DAD8D; font-weight: bold', 'color: dimgray; font-weight: normal')
    }

    /**
     * Bootstrap it once!
     */
    init () {
      if (!window.WMEBootstrap) {
        window.WMEBootstrap = true
        this.check()
      }
    }

    /**
     * Check
     * @param {int} tries
     */
    check (tries = 100) {
      this.log('try to init')
      if (W &&
        W.map &&
        W.model &&
        W.model.countries.top &&
        W.loginManager.user
      ) {
        this
          .load()
          .then(() => $(document).trigger('bootstrap.wme'))
          .then(() => this.log('was initialized'))
          .catch((e) => this.log('loading failed', e))
      } else if (tries > 0) {
        tries--
        setTimeout(() => this.check(tries), 500)
      } else {
        this.log('initialization failed')
      }
    }

    async load () {
      return Promise.all([
        $.getScript(APIHelper),
        $.getScript(APIHelperUI),
        $.getScript(CommonUtils),
      ])
    }
  }

  let WMEBootstrap = new Bootstrap()
  await WMEBootstrap.init()
})(window.jQuery)
