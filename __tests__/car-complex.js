const { applyMiddleware, createStore } = require('redux')
const { createMiddleware } = require('../src/index')

// Define the state machine
const config = {
    getProp: state => state.__currentState,
    constraints: {
        'PARKED': [ 'DRIVE' ],
        'MOVING': [ 'CRASH', 'PARK', 'DRIVE_FASTER' ],
        'CRASHED': []
    }
}

function car(state = { __currentState: 'PARKED', speed: 0 }, action) {
    switch (action.type) {
        case 'DRIVE':
            return { __currentState: 'MOVING', speed: 65 }
        case 'CRASH':
            return { __currentState: 'CRASHED', speed: 0 }
        case 'PARK':
            return { __currentState: 'PARKED', speed: 0 }
        case 'DRIVE_FASTER':
            return { speed: 85 }
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
            expect(store.getState().__currentState).toBe('MOVING')
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
            expect(store.getState().__currentState).toBe('CRASHED')
        })

        test('can park', () => {
            store.dispatch({ type: 'PARK' })
            expect(store.getState().__currentState).toBe('PARKED')
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


