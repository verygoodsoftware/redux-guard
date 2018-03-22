# redux-guard&nbsp;&nbsp;[![Build Status](https://travis-ci.org/verygoodsoftware/redux-guard.svg?branch=master)](https://travis-ci.org/verygoodsoftware/redux-guard)&nbsp;[![Test Coverage](https://api.codeclimate.com/v1/badges/1e422e77c9eda15630e1/test_coverage)](https://codeclimate.com/github/verygoodsoftware/redux-guard/test_coverage)&nbsp;[![Maintainability](https://api.codeclimate.com/v1/badges/1e422e77c9eda15630e1/maintainability)](https://codeclimate.com/github/verygoodsoftware/redux-guard/maintainability)

A middleware that turns Redux into a state machine, enforcing
how your actions are sequenced.

**Redux Guard protects future you from present you.**

## Example

Say you're signing in a user:

```javascript
// Reducer

const initialState = {
    __currentState: 'UNAUTHENTICATED',
    message: 'Please sign in to continue.'
}

function reducer(state = initialState, action) {
    switch (action.type) {
        case 'LOG_OUT':
            return {
                __currentState: 'UNAUTHENTICATED',
                message: 'Please sign in to continue.'
            }
        case 'LOG_IN':
            return {
                __currentState: 'AUTHENTICATING',
                message: 'You are now signed in.'
            }
        default:
            return state
    }
}
```

And you are dispatching the following actions in succession:

```javascript
store.dispatch({ type: 'LOG_IN' }) // Great! Let's log you in.
store.dispatch({ type: 'LOG_OUT' }) // Okay, now you're logged out.
store.dispatch({ type: 'LOG_OUT' }) // Huh? Why you logging out again?
```

It doesn't make sense for a user to log out a second time after they are
already logged out.

Redux Guard provides a means to protect against scenarios like this. You
configure a set of constraints up front, and it enforces them... throwing an
error if anything is amiss:

```javascript
import { createStore, applyMiddleware } from 'redux'
import { createGuardMiddleware } from 'redux-guard'
import rootReducer from './reducers/index'

// Write your config for the redux-guard middleware.
const config = {
    guards: [
        {
            // Point to where you're tracking current status.
            getCurrentState: state => state.__currentState,
            constraints: {
                // If we're authenticated, we can only log out.
                'AUTHENTICATED': ['LOG_OUT'],
                // If we're unauthenticated, we can only log in.
                'UNAUTHENTICATED': ['LOG_IN']
            }
        }
    ]
}

// Apply the middleware, passing in the config.
const store = createStore(
    rootReducer,
    applyMiddleware(
        createGuardMiddleware(config),
        ...otherMiddleware
    )
)
```

> *Because this middleware is designed to stop improperly dispatched actions
before they make undesired changes to your app, it is recommended that you pass
this to `applyMiddleware` first.*

Now when you try dispatching the same actions, Guard will stop you:

```javascript
store.dispatch({ type: 'LOG_IN' }) // ✅
store.dispatch({ type: 'LOG_OUT' }) // ✅
store.dispatch({ type: 'LOG_OUT' }) // 🚫 Throws an error.
```
