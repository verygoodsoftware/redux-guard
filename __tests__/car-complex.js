const { Map } = require('immutable')
const { applyMiddleware, createStore } = require('redux')
const { createMiddleware, inSet } = require('../src/index')

// Define the state machine
const config = {
    guards: [
        {
            getProp: state => state.get('__currentState'),
            filter: inSet([ 'DRIVE', 'CRASH', 'PARK', 'DRIVE_FASTER' ]),
            constraints: {
                'PARKED': [ 'DRIVE' ],
                'MOVING': [ 'CRASH', 'PARK', 'DRIVE_FASTER' ],
                'CRASHED': []
            }
        },
        {
            getProp: state => state.get('gear'),
            filter: inSet([ 'SHIFT', 'DOWNSHIFT' ]),
            constraints: {
                1: [ 'SHIFT' ],
                2: [ 'SHIFT', 'DOWNSHIFT' ]
            }
        }
    ]
}

const getCarState = store => store.getState().get('__currentState')
const getGearState = store => store.getState().get('gear')

const initialState = Map({
    __currentState: 'PARKED',
    speed: 0,
    gear: 1
})

function car(state = initialState, action) {
    switch (action.type) {
        case 'DRIVE':
            return state.merge({ __currentState: 'MOVING', speed: 65 })
        case 'CRASH':
            return state.merge({ __currentState: 'CRASHED', speed: 0 })
        case 'PARK':
            return state.merge({ __currentState: 'PARKED', speed: 0 })
        case 'DRIVE_FASTER':
            // "Accidentally" don't merge the state, leaving out __currentState
            return Map({ speed: 85 })
        case 'SHIFT':
            return state.merge({ gear: state.get('gear') + 1 })
        case 'DOWNSHIFT':
            return state.merge({ gear: state.get('gear') - 1 })
        default:
            return state
    }
}

let store = null

describe('A more complex car', () => {
    beforeEach(() => {
        store = createStore(car, applyMiddleware(createMiddleware({ config })))
    })

    describe('that is parked', () => {
        test('can start driving', () => {
            store.dispatch({ type: 'DRIVE'})
            expect(getCarState(store)).toBe('MOVING')
        })

        test('cannot crash', () => {
            expect(() => store.dispatch({ type: 'CRASH'})).toThrow()
        })
    })

    describe('that is moving', () => {
        beforeEach(() => {
            store.dispatch({ type: 'DRIVE' })
        })

        test('can crash', () => {
            store.dispatch({ type: 'CRASH' })
            expect(getCarState(store)).toBe('CRASHED')
        })

        test('can park', () => {
            store.dispatch({ type: 'PARK' })
            expect(getCarState(store)).toBe('PARKED')
        })

        test('can shift up from first gear', () => {
            store.dispatch({ type: 'SHIFT' })
            expect(getGearState(store)).toBe(2)
        })

        test('cannot downshift from first gear', () => {
            expect(() => store.dispatch({ type: 'DOWNSHIFT' })).toThrow()
        })
    })

    describe('that is crashed', () => {
        beforeEach(() => {
            store.dispatch({ type: 'DRIVE' })
            store.dispatch({ type: 'CRASH' })
        })

        test('cannot park', () => {
            expect(() => store.dispatch({ type: 'PARK' })).toThrow()
        })

        test('cannot start driving', () => {
            expect(() => store.dispatch({ type: 'DRIVE' })).toThrow()
        })
    })
})

describe('A complex state machine', () => {
    beforeEach(() => {
        store = createStore(car, applyMiddleware(createMiddleware({ config })))
    })

    test('that has an improperly structured state should throw an error', () => {
        store.dispatch({ type: 'DRIVE' })
        store.dispatch({ type: 'DRIVE_FASTER' })
        
        expect(() => store.dispatch({ type: 'PARK' })).toThrow()
    })
})


