// ==UserScript==
// @name         WME Bootstrap
// @version      0.6.0
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

(function () {
    'use strict';

    const SELECTORS = {
        city: 'div.city-feature-editor',
        comment: 'div.map-comment-feature-editor',
        hazard: 'div.permanent-hazard-feature-editor',
        node: 'div.connections-edit',
        junction: '#big-junction-edit-general',
        restricted: 'div.restricted-driving-area',
        segment: '#segment-edit-general',
        venue: '#venue-edit-general'};
    const FETCHERS = {
        city: (sdk, id) => sdk.DataModel.Cities.getById({ cityId: id }),
        mapComment: (sdk, id) => sdk.DataModel.MapComments.getById({ mapCommentId: id }),
        bigJunction: (sdk, id) => sdk.DataModel.BigJunctions.getById({ bigJunctionId: id }),
        node: (sdk, id) => sdk.DataModel.Nodes.getById({ nodeId: id }),
        segment: (sdk, id) => sdk.DataModel.Segments.getById({ segmentId: id }),
        venue: (sdk, id) => sdk.DataModel.Venues.getById({ venueId: id }),
        permanentHazard: (sdk, id) => sdk.DataModel.PermanentHazards.getCameraById({ cameraId: id }),
        restrictedDrivingArea: (sdk, id) => sdk.DataModel.RestrictedDrivingAreas.getById({ restrictedDrivingAreaId: id }),
    };
    class Bootstrap {
        /**
         * Bootstrap it once!
         */
        constructor() {
            const sandbox = typeof unsafeWindow !== 'undefined';
            const pageWindow = sandbox ? unsafeWindow : window;
            if (!pageWindow.WMEBootstrapReady) {
                pageWindow.WMEBootstrapReady = true;
                document.addEventListener('wme-ready', () => this.init(), { once: true });
            }
        }
        /**
         * Initial events and handlers
         */
        init() {
            try {
                // fire `bootstrap.wme` event
                jQuery(document).trigger('bootstrap.wme');
                // setup additional handlers
                this.setup();
                // listen to all events
                jQuery(document)
                    .on('junction.wme', (_event, _element, model) => this.log('🔀 junction.wme: ' + model.id))
                    .on('camera.wme', (_event, _element, model) => this.log('📸 camera.wme: ' + model.id))
                    .on('city.wme', (_event, _element, model) => this.log('🏬 city.wme: ' + model.id))
                    .on('comment.wme', (_event, _element, model) => this.log('💬 comment.wme: ' + model.id))
                    .on('segment.wme', (_event, _element, model) => this.log('🛣️ segment.wme: ' + model.id))
                    .on('segments.wme', (_event, _element, models) => this.log('🛣️ segments.wme: ' + models.length + ' elements'))
                    .on('node.wme', (_event, _element, model) => this.log('⭐️ node.wme: ' + model.id))
                    .on('nodes.wme', (_event, _element, models) => this.log('🌟 nodes.wme: ' + models.length + ' elements'))
                    .on('venue.wme', (_event, _element, model) => this.log('🏠 venue.wme: ' + model.id))
                    .on('venues.wme', (_event, _element, models) => this.log('🏘️ venues.wme: ' + models.length + ' elements'))
                    .on('point.wme', () => this.log('📍 point.wme'))
                    .on('place.wme', () => this.log('📌 place.wme'))
                    .on('residential.wme', () => this.log('🏡 residential.wme'));
            }
            catch (e) {
                console.error(e);
            }
        }
        /**
         * Setup handlers for WME SDK events
         */
        setup() {
            this.wmeSDK = getWmeSdk({
                scriptId: 'wme-bootstrap',
                scriptName: 'WME Bootstrap',
            });
            this.wmeSDK.Events.on({
                eventName: 'wme-feature-editor-opened',
                eventHandler: ({ featureType }) => this.eventHandler(featureType),
            });
            this.wmeSDK.Events.on({
                eventName: 'wme-selection-changed',
                eventHandler: () => {
                    if (!this.wmeSDK.Editing.getSelection()) {
                        jQuery(document).trigger('none.wme');
                    }
                },
            });
        }
        /**
         * Handler for selected features
         */
        eventHandler(featureType) {
            const fetcher = FETCHERS[featureType];
            if (!fetcher) {
                return;
            }
            const selection = this.wmeSDK.Editing.getSelection();
            if (!selection || !selection.ids || !selection.ids.length) {
                return;
            }
            const models = selection.ids.map((id) => fetcher(this.wmeSDK, id));
            if (!models.length) {
                return;
            }
            const isSingle = models.length === 1;
            const model = models[0];
            if (featureType === 'city') {
                this.eventTrigger('city.wme', SELECTORS.city, model);
            }
            else if (featureType === 'mapComment') {
                this.eventTrigger('comment.wme', SELECTORS.comment, model);
            }
            else if (featureType === 'bigJunction') {
                this.eventTrigger('junction.wme', SELECTORS.junction, model);
            }
            else if (featureType === 'node' && isSingle) {
                this.eventTrigger('node.wme', SELECTORS.node, model);
            }
            else if (featureType === 'node') {
                this.eventTrigger('nodes.wme', SELECTORS.node, models);
            }
            else if (featureType === 'permanentHazard') {
                this.eventTrigger('camera.wme', SELECTORS.hazard, model);
            }
            else if (featureType === 'restrictedDrivingArea') {
                this.eventTrigger('restricted.wme', SELECTORS.restricted, models);
            }
            else if (featureType === 'segment' && isSingle) {
                this.eventTrigger('segment.wme', SELECTORS.segment, model);
            }
            else if (featureType === 'segment') {
                this.eventTrigger('segments.wme', SELECTORS.segment, models);
            }
            else if (featureType === 'venue' && isSingle) {
                this.eventTrigger('venue.wme', SELECTORS.venue, model);
                if (model.isResidential) {
                    this.eventTrigger('residential.wme', SELECTORS.venue, model);
                }
                else if (model.geometry.type === 'Point') {
                    this.eventTrigger('point.wme', SELECTORS.venue, model);
                }
                else {
                    this.eventTrigger('place.wme', SELECTORS.venue, model);
                }
            }
            else if (featureType === 'venue') {
                this.eventTrigger('venues.wme', SELECTORS.venue, models);
            }
        }
        /**
         * Trigger jQuery event on the document with a DOM element and model(s)
         */
        eventTrigger(eventType, selector, models) {
            jQuery(document).trigger(eventType, [document.querySelector(selector), models]);
        }
        /**
         * Log message with a Bootstrap prefix
         */
        log(message) {
            console.log('%cBootstrap:%c ' + message, 'color: #0DAD8D; font-weight: bold', 'color: dimgray; font-weight: normal');
        }
    }

    new Bootstrap();

})();
