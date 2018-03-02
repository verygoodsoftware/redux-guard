const { applyMiddleware, createStore } = require('redux')
const { createMiddleware, INVALID_TRANSITION } = require('../src/index')

// Define the state machine
const constraints = {
    'PARKED': [ 'DRIVE' ],
    'MOVING': [ 'CRASH', 'PARK', 'DRIVE_FASTER' ],
    'CRASHED': []
}

function car(state = { state: 'PARKED', speed: 0 }, action) {
    switch (action.type) {
        case 'DRIVE':
            return { state: 'MOVING', speed: 65 }
        case 'CRASH':
            return { state: 'CRASHED', speed: 0 }
        case 'PARK':
            return { state: 'PARKED', speed: 0 }
        case 'DRIVE_FASTER':
            return { speed: 85 }
        // I don't love having to manually add this to my reducer.
        case INVALID_TRANSITION:
            return { state: INVALID_TRANSITION, speed: 0 }
        default:
            return state
    }
}

let store = null

describe('A more complex car', () => {
    beforeEach(() => {
        store = createStore(car, applyMiddleware(createMiddleware({ constraints, complex: true })))
    })

    describe('that is parked', () => {
        test('can start driving', () => {
            store.dispatch({ type: 'DRIVE'})
            expect(store.getState().state).toBe('MOVING')
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
            expect(store.getState().state).toBe('CRASHED')
        })

        test('can park', () => {
            store.dispatch({ type: 'PARK' })
            expect(store.getState().state).toBe('PARKED')
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
        store = createStore(car, applyMiddleware(createMiddleware({ constraints, complex: true })))
    })

    test('that has an improperly structured state should throw an error', () => {
        store.dispatch({ type: 'DRIVE' })
        store.dispatch({ type: 'DRIVE_FASTER' })
        
        expect(() => store.dispatch({ type: 'PARK' })).toThrow()
    })
})

