import { Map } from "immutable";
import { Action, createStore, Reducer } from "redux";

// Define a state
interface IState {
    id: string;
    transitionTo: ITransition[];
}

interface IStateMachine {
    initialState: string;
    states: IState[];
}

interface ITransition {
    action: string;
    nextState: string;
}

// Configure the state machine
const stateMachine: IStateMachine = {
    initialState: "PARKED",
    states: [
        {
            id: "PARKED",
            transitionTo: [
                {
                    action: "DRIVE",
                    nextState: "MOVING",
                },
            ],
        },
        {
            id: "MOVING",
            transitionTo: [
                {
                    action: "CRASH",
                    nextState: "CRASHED",
                },
                {
                    action: "PARK",
                    nextState: "PARKED",
                },
            ],
        },
        {
            id: "CRASHED",
            transitionTo: [],
        },
    ],
};

// Generate the reducer from the state machine
function generateReducer(machine: IStateMachine): Reducer<string> {
    // Index the states
    const indexStates = (acc: Map<string, number>, current: IState, currentIdx: number) => {
        return acc.set(current.id, currentIdx);
    };
    const statesIdx = machine.states.reduce(indexStates, Map<string, number>());

    // Create a reducer
    return (state = machine.initialState, action: Action) => {
        // Is the action supported on the current state?
        const stateIdx = statesIdx.get(state, -1);
        if (stateIdx === -1) {
            console.log("!!! State did not exist.");
            return state;
        }

        const stateDefinition = machine.states[stateIdx];
        if (stateDefinition === undefined) {
            console.log("!!! State did not exist, but index did?");
            return state;
        }

        const findTransition = (acc: ITransition | null, current: ITransition) => {
            if (action.type as string === current.action) {
                return acc = current;
            }
            return acc;
        };

        const transition = stateDefinition.transitionTo.reduce(findTransition, null);
        if (!transition) {
            console.log("!!! State does not support action.", state, action.type);
            return state;
        }

        return transition.nextState;
    };
}

const car = generateReducer(stateMachine);

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
