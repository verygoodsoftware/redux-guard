const { applyMiddleware, createStore } = require('redux')
const { createMiddleware, INVALID_TRANSITION } = require('../src/index');

// Define the state machine
const constraints = {
    'PARKED': [ 'DRIVE' ],
    'MOVING': [ 'CRASH', 'PARK' ],
    'CRASHED': []
};

function car(state = 'PARKED', action) {
    switch (action.type) {
        case 'DRIVE':
            return 'MOVING'
        case 'CRASH':
            return 'CRASHED'
        case 'PARK':
            return 'PARKED'
        // I don't love having to manually add this to my reducer.
        case INVALID_TRANSITION:
            return INVALID_TRANSITION
        default:
            return state
    }
}

let store = null;

describe('A car', () => {
    beforeEach(() => {
        store = createStore(car, applyMiddleware(createMiddleware(constraints)))
    });

    describe('that is parked', () => {
        test('can start driving', () => {
            store.dispatch({ type: 'DRIVE'});
            expect(store.getState()).toBe('MOVING');
        });

        test('cannot crash', () => {
            store.dispatch({ type: 'CRASH'});
            expect(store.getState()).toBe(INVALID_TRANSITION);
        });
    });

    describe('that is moving', () => {
        beforeEach(() => {
            store.dispatch({ type: 'DRIVE' });
        });

        test('can crash', () => {
            store.dispatch({ type: 'CRASH' });
            expect(store.getState()).toBe('CRASHED');
        });

        test('can park', () => {
            store.dispatch({ type: 'PARK' });
            expect(store.getState()).toBe('PARKED');
        });
    });

    describe('that is crashed', () => {
        beforeEach(() => {
            store.dispatch({ type: 'DRIVE' });
            store.dispatch({ type: 'CRASH' });
        });

        test('cannot park', () => {
            store.dispatch({ type: 'PARK' });
            expect(store.getState()).toBe(INVALID_TRANSITION);
        });

        test('cannot start driving', () => {
            store.dispatch({ type: 'DRIVE' });
            expect(store.getState()).toBe(INVALID_TRANSITION);
        });
    });
});
