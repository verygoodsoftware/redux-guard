'use strict'

function createMiddleware({ constraints, complex }) {
    if (constraints === undefined || constraints === null) {
        throw new Error('State transition constraints are required.')
    }

    let isComplexState = complex === true

    // Generate the middleware
    return ({ getState }) => next => action => {
        let currentState = getState()
        if (isComplexState) {
            currentState = currentState.__currentState
        }

        if (currentState === undefined) {
            throw new Error('Current state was not structured properly.')
        }

        // Is the action allowed on the current state?
        const allowedActions = constraints[currentState]
        if (allowedActions === undefined || allowedActions.length === 0) {
            // No contraints is an error. We fail closed here.
            throw new Error('Action was not allowed on current state.')
        }

        const allowed = allowedActions.some(v => v == action.type)
        if (!allowed) {
            throw new Error('Action was not allowed on current state.')
        }

        // Action allowed. Carry on. Nothing to see here.
        return next(action)
    }
}

module.exports = {
    createMiddleware
}
