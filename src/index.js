'use strict'

const invalidTransitionAction = {
    type: 'INVALID_TRANSITION'
}

function createMiddleware(constraints) {
    if (constraints === undefined || constraints === null) {
        throw new Error("State machine constraints are required.")
    }

    return ({ getState }) => next => action => {
        const currentState = getState()

        // Is the action allowed on the current state?
        const allowedActions = constraints[currentState]
        if (allowedActions === undefined || allowedActions.length === 0) {
            // No contraints is an error. We fail closed here.
            return next(invalidTransitionAction)
        }

        const allowed = allowedActions.some(v => v == action.type)
        if (!allowed) {
            return next(invalidTransitionAction)
        }

        // Action allowed. Carry on. Nothing to see here.
        return next(action)
    }
}

module.exports = {
    createMiddleware
}