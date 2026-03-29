import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Bootstrap } from '../src/bootstrap'

// Mock jQuery
const triggeredEvents: Array<{ type: string; args: any[] }> = []
const jQueryMock: any = (selector: any) => ({
  trigger: (type: string, args?: any[]) => {
    triggeredEvents.push({ type, args: args || [] })
    return jQueryMock(selector)
  },
  on: () => jQueryMock(selector),
})

// Mock getWmeSdk
let featureEditorHandler: Function
let selectionChangedHandler: Function

const mockWmeSDK = {
  Editing: {
    getSelection: vi.fn(),
  },
  Events: {
    on: vi.fn(({ eventName, eventHandler }) => {
      if (eventName === 'wme-feature-editor-opened') featureEditorHandler = eventHandler
      if (eventName === 'wme-selection-changed') selectionChangedHandler = eventHandler
    }),
  },
  DataModel: {
    Cities: { getById: ({ cityId }) => ({ id: cityId, type: 'city' }) },
    MapComments: { getById: ({ mapCommentId }) => ({ id: mapCommentId, type: 'comment' }) },
    BigJunctions: { getById: ({ bigJunctionId }) => ({ id: bigJunctionId, type: 'junction' }) },
    Nodes: { getById: ({ nodeId }) => ({ id: nodeId, type: 'node' }) },
    Segments: { getById: ({ segmentId }) => ({ id: segmentId, type: 'segment' }) },
    Venues: { getById: ({ venueId }) => ({ id: venueId, type: 'venue', geometry: { type: 'Polygon' }, isResidential: false }) },
    PermanentHazards: { getCameraById: ({ cameraId }) => ({ id: cameraId, type: 'hazard' }) },
    RestrictedDrivingAreas: { getById: ({ restrictedDrivingAreaId }) => ({ id: restrictedDrivingAreaId, type: 'restricted' }) },
  },
}

// Mock document
const mockDocument: any = {
  addEventListener: vi.fn(),
  querySelector: vi.fn(() => null),
}

// Install globals
;(globalThis as any).document = mockDocument
;(globalThis as any).jQuery = jQueryMock
;(globalThis as any).getWmeSdk = () => mockWmeSDK
;(globalThis as any).unsafeWindow = undefined

describe('Bootstrap.eventHandler', () => {
  let bootstrap: Bootstrap

  beforeEach(() => {
    triggeredEvents.length = 0
    vi.restoreAllMocks()

    // Prevent constructor from adding event listener (wme-ready won't fire in tests)
    bootstrap = Object.create(Bootstrap.prototype)
    bootstrap.wmeSDK = mockWmeSDK
  })

  function setupSelection(ids: string[]) {
    mockWmeSDK.Editing.getSelection.mockReturnValue({ ids })
  }

  it('fires segment.wme for a single segment', () => {
    setupSelection(['seg1'])
    bootstrap.eventHandler('segment')
    expect(triggeredEvents.some(e => e.type === 'segment.wme')).toBe(true)
  })

  it('fires segments.wme for multiple segments', () => {
    setupSelection(['seg1', 'seg2'])
    bootstrap.eventHandler('segment')
    expect(triggeredEvents.some(e => e.type === 'segments.wme')).toBe(true)
    expect(triggeredEvents.some(e => e.type === 'segment.wme')).toBe(false)
  })

  it('fires venue.wme + place.wme for a single polygon venue', () => {
    setupSelection(['v1'])
    bootstrap.eventHandler('venue')
    expect(triggeredEvents.some(e => e.type === 'venue.wme')).toBe(true)
    expect(triggeredEvents.some(e => e.type === 'place.wme')).toBe(true)
  })

  it('fires venue.wme + point.wme for a single point venue', () => {
    mockWmeSDK.DataModel.Venues.getById = ({ venueId }) => ({
      id: venueId, type: 'venue', geometry: { type: 'Point' }, isResidential: false,
    })
    setupSelection(['v1'])
    bootstrap.eventHandler('venue')
    expect(triggeredEvents.some(e => e.type === 'venue.wme')).toBe(true)
    expect(triggeredEvents.some(e => e.type === 'point.wme')).toBe(true)
  })

  it('fires venue.wme + residential.wme for a residential venue', () => {
    mockWmeSDK.DataModel.Venues.getById = ({ venueId }) => ({
      id: venueId, type: 'venue', geometry: { type: 'Point' }, isResidential: true,
    })
    setupSelection(['v1'])
    bootstrap.eventHandler('venue')
    expect(triggeredEvents.some(e => e.type === 'venue.wme')).toBe(true)
    expect(triggeredEvents.some(e => e.type === 'residential.wme')).toBe(true)
  })

  it('fires venues.wme for multiple venues', () => {
    mockWmeSDK.DataModel.Venues.getById = ({ venueId }) => ({
      id: venueId, type: 'venue', geometry: { type: 'Polygon' }, isResidential: false,
    })
    setupSelection(['v1', 'v2'])
    bootstrap.eventHandler('venue')
    expect(triggeredEvents.some(e => e.type === 'venues.wme')).toBe(true)
    expect(triggeredEvents.some(e => e.type === 'venue.wme')).toBe(false)
  })

  it('fires node.wme for a single node', () => {
    setupSelection(['n1'])
    bootstrap.eventHandler('node')
    expect(triggeredEvents.some(e => e.type === 'node.wme')).toBe(true)
  })

  it('fires nodes.wme for multiple nodes', () => {
    setupSelection(['n1', 'n2'])
    bootstrap.eventHandler('node')
    expect(triggeredEvents.some(e => e.type === 'nodes.wme')).toBe(true)
    expect(triggeredEvents.some(e => e.type === 'node.wme')).toBe(false)
  })

  it('fires city.wme for a city', () => {
    setupSelection(['c1'])
    bootstrap.eventHandler('city')
    expect(triggeredEvents.some(e => e.type === 'city.wme')).toBe(true)
  })

  it('fires comment.wme for a mapComment', () => {
    setupSelection(['mc1'])
    bootstrap.eventHandler('mapComment')
    expect(triggeredEvents.some(e => e.type === 'comment.wme')).toBe(true)
  })

  it('fires junction.wme for a bigJunction', () => {
    setupSelection(['bj1'])
    bootstrap.eventHandler('bigJunction')
    expect(triggeredEvents.some(e => e.type === 'junction.wme')).toBe(true)
  })

  it('fires camera.wme for a permanentHazard', () => {
    setupSelection(['ph1'])
    bootstrap.eventHandler('permanentHazard')
    expect(triggeredEvents.some(e => e.type === 'camera.wme')).toBe(true)
  })

  it('fires restricted.wme for a restrictedDrivingArea', () => {
    setupSelection(['rda1'])
    bootstrap.eventHandler('restrictedDrivingArea')
    expect(triggeredEvents.some(e => e.type === 'restricted.wme')).toBe(true)
  })

  it('does nothing for unknown feature types', () => {
    setupSelection(['x1'])
    bootstrap.eventHandler('unknownType')
    expect(triggeredEvents.length).toBe(0)
  })

  it('does nothing for empty selection', () => {
    setupSelection([])
    bootstrap.eventHandler('segment')
    expect(triggeredEvents.length).toBe(0)
  })

  it('does nothing for segmentSuggestion (disabled)', () => {
    setupSelection(['ss1'])
    bootstrap.eventHandler('segmentSuggestion')
    expect(triggeredEvents.length).toBe(0)
  })
})

describe('Bootstrap.setup', () => {
  let bootstrap: Bootstrap

  beforeEach(() => {
    triggeredEvents.length = 0
    vi.restoreAllMocks()
    mockWmeSDK.Events.on.mockClear()

    bootstrap = Object.create(Bootstrap.prototype)
    bootstrap.setup()
  })

  it('registers wme-feature-editor-opened handler', () => {
    expect(mockWmeSDK.Events.on).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'wme-feature-editor-opened' })
    )
  })

  it('registers wme-selection-changed handler', () => {
    expect(mockWmeSDK.Events.on).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'wme-selection-changed' })
    )
  })

  it('fires none.wme when selection is cleared', () => {
    mockWmeSDK.Editing.getSelection.mockReturnValue(null)
    selectionChangedHandler()
    expect(triggeredEvents.some(e => e.type === 'none.wme')).toBe(true)
  })

  it('does not fire none.wme when selection exists', () => {
    mockWmeSDK.Editing.getSelection.mockReturnValue({ ids: ['v1'], objectType: 'venue' })
    selectionChangedHandler()
    expect(triggeredEvents.some(e => e.type === 'none.wme')).toBe(false)
  })
})

describe('Bootstrap.log', () => {
  it('logs with styled prefix', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const bootstrap = Object.create(Bootstrap.prototype)
    bootstrap.log('test message')
    expect(spy).toHaveBeenCalledWith(
      '%cBootstrap:%c test message',
      'color: #0DAD8D; font-weight: bold',
      'color: dimgray; font-weight: normal'
    )
    spy.mockRestore()
  })
})
