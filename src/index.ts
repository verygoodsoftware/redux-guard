import { Map } from "immutable";
import { Action, createStore, Reducer, Store } from "redux";

// Define a state
export interface IStateMachine {
    initialState: string;
    states: IState[];
}

interface IState {
    id: string;
    transitionTo: ITransition[];
}

interface ITransition {
    action: string;
    nextState: string;
}

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
            return state;
        }

        const stateDefinition = machine.states[stateIdx];
        if (stateDefinition === undefined) {
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
            return state;
        }

        return transition.nextState;
    };
}

export function createStateMachine(machine: IStateMachine): Store<string> {
    const reducer = generateReducer(machine);
    const store = createStore(reducer);

    return store;
}
