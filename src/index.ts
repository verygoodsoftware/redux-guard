import { Action, createStore } from "redux";

// Reducer
function car(state = "PARKED", action: Action) {
    switch (action.type) {
        case "CRASH":
            return "CRASHED";
        case "DRIVE":
            return "MOVING";
        case "PARK":
            return "PARKED";
        default:
            return state;
    }
}

// Store
const store = createStore(car);

// Subscribe
store.subscribe(() => {
    console.log(store.getState());
});

// Do some things...
store.dispatch({ type: "DRIVE" });
store.dispatch({ type: "PARK" });
store.dispatch({ type: "CRASH" });
