const { applyMiddleware, createStore } = require('redux')
const { createGuardMiddleware } = require('../src/index')

// Define the state machine
const config = {
    guards: [
        {
            getCurrentState: state => state.__currentState,
            constraints: {
                'RESTING': [ 'HEAT_WATER', 'GRIND_BEANS', 'STOP' ],
                'BREWING': [ 'HEAT_WATER', 'GRIND_BEANS', 'POUR_WATER', 'POUR_COFFEE', 'STOP' ],
                'DRINKING': [ 'SIP', 'STOP' ]
            }
        }
    ]    
}

function reducer(state = { __currentState: 'RESTING', enjoyment: 0 }, action) {
    switch (action.type) {
        case 'STOP':
            return { __currentState: 'RESTING', enjoyment: 0 }
        case 'HEAT_WATER':
            return { __currentState: 'BREWING', enjoyment: 20 }
        case 'GRIND_BEANS':
            return { __currentState: 'BREWING', enjoyment: 40 }
        case 'POUR_WATER':
            return { __currentState: 'BREWING', enjoyment: 60 }
        case 'POUR_COFFEE':
            return { __currentState: 'DRINKING', enjoyment: 80 }
        case 'SIP':
            return { __currentState: 'DRINKING', enjoyment: 100 }
        default:
            return state
    }
}

let store = null

describe('A barista', () => {
    beforeEach(() => {
        store = createStore(reducer, applyMiddleware(createGuardMiddleware(config)))
    })

    describe('that is resting', () => {
        test('can start heating water', () => {
            store.dispatch({ type: 'HEAT_WATER' })
            expect(store.getState().__currentState).toBe('BREWING')
        })

        test('can start grinding beans', () => {
            store.dispatch({ type: 'GRIND_BEANS' })
            expect(store.getState().__currentState).toBe('BREWING')
        })

        test('can stop', () => {
            store.dispatch({ type: 'GRIND_BEANS' })
            store.dispatch({ type: 'STOP' })
            expect(store.getState().__currentState).toBe('RESTING')
        })

        test('can not pour coffee', () => {
            expect(() => store.dispatch({ type: 'POUR_COFFEE' })).toThrow()
        })

        test('cannot sip coffee', () => {
            expect(() => store.dispatch({ type: 'SIP' })).toThrow()
        })
    })

    describe('that is brewing coffee', () => {
        test('can pour water', () => {
            store.dispatch({ type: 'HEAT_WATER' })
            store.dispatch({ type: 'POUR_WATER' })
            expect(store.getState().__currentState).toBe('BREWING')
        })

        test('can pour coffee', () => {
            store.dispatch({ type: 'HEAT_WATER' })
            store.dispatch({ type: 'POUR_COFFEE' })
            expect(store.getState().__currentState).toBe('DRINKING')
        })

        test('cannot sip without pouring coffee', () => {
            store.dispatch({ type: 'HEAT_WATER' })
            store.dispatch({ type: 'POUR_WATER' })
            expect(() => store.dispatch({ type: 'SIP' })).toThrow()
        })
    })

    describe('that is drinking coffee', () => {
        test('can sip the coffee', () => {
            store.dispatch({ type: 'HEAT_WATER' })
            store.dispatch({ type: 'POUR_COFFEE' })
            store.dispatch({ type: 'SIP' })
            expect(store.getState().__currentState).toBe('DRINKING')
        })

        test('cannot continue sipping after stopping', () => {
            store.dispatch({ type: 'HEAT_WATER' })
            store.dispatch({ type: 'POUR_COFFEE' })
            store.dispatch({ type: 'STOP' })
            expect(() => store.dispatch({ type: 'SIP' })).toThrow()
        })
    })
})

