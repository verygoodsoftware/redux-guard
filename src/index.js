'use strict'

function createMiddleware({ config }) {
    // TODO: Better configuration validation. JSON schema perhaps?
    if (config === undefined || config === null) {
        throw new Error('Configuration is required.')
    }

    // Generate the middleware
    return ({ getState }) => next => action => {
        for (let guard of config.guards) {
            let currentState = guard.getProp(getState())

            if (currentState === undefined) {
                throw new Error('Current state was not structured properly.')
            }

            // Is the current state interested in the action?
            const matchAction = v => v === action.type

            const interested = guard.filter === undefined ? true : guard.filter.some(matchAction)
            if (!interested) {
                continue
            }
    
            // Is the action allowed on the current state?
            const allowedActions = guard.constraints[currentState]
            if (allowedActions === undefined || allowedActions.length === 0) {
                // No contraints is an error. We fail closed here.
                throw new Error('Action was not allowed on current state.')
            }
    
            const allowed = allowedActions.some(matchAction)
            if (!allowed) {
                throw new Error('Action was not allowed on current state.')
            }
        }        

        // Action allowed. Carry on. Nothing to see here.
        return next(action)
    }
}

module.exports = {
    createMiddleware
}
