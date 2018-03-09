'use strict'

function createMiddleware({ config }) {
    // TODO: Better configuration validation. JSON schema perhaps?
    if (config === undefined || config === null) {
        throw new Error('Configuration is required.')
    }

    // Generate the middleware
    return ({ getState }) => next => action => {
        let currentState = config.getProp(getState())

        if (currentState === undefined) {
            throw new Error('Current state was not structured properly.')
        }

        // Is the action allowed on the current state?
        const allowedActions = config.constraints[currentState]
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
