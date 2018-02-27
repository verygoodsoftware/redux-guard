import { Action, createStore } from "redux";

// Reducer
function counter(state = 0, action: Action) {
    switch (action.type) {
        case "INCREMENT":
            return state + 1;
        case "DECREMENT":
            return state - 1;
        default:
            return state;
    }
}

// Store
const store = createStore(counter);

// Subscribe
store.subscribe(() => {
    console.log(store.getState());
});

// Do some things...
store.dispatch({ type: "INCREMENT" });
store.dispatch({ type: "INCREMENT" });
store.dispatch({ type: "DECREMENT" });
