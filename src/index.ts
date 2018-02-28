import { Map } from "immutable";
import { Action, createStore, Reducer, Store } from "redux";

// Define a state
export interface IStateMachineDefinition {
    initialState: string;
    transitions: ITransition[];
    states: IState[];
}

interface IState {
    id: string;
    transitions: string[];
}

interface ITransition {
    id: string;
    nextState: string;
}

export class StateMachine {
    private static generateReducer(machine: IStateMachineDefinition): Reducer<string> {
        // Index the states
        const indexStates = (acc: Map<string, number>, current: IState, currentIdx: number) => {
            return acc.set(current.id, currentIdx);
        };
        const statesIdx = machine.states.reduce(indexStates, Map<string, number>());

        // Index the transitions
        const indexTransistions = (acc: Map<string, ITransition>, current: ITransition) => {
            return acc.set(current.id, current);
        };
        const transistionsIdx = machine.transitions.reduce(indexTransistions, Map<string, ITransition>());

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

            const findTransition = (acc: ITransition, current: string) => {
                if (action.type as string === current) {
                    return acc = transistionsIdx.get(current);
                }
                return acc;
            };

            const transition = stateDefinition.transitions.reduce(findTransition, null);
            if (!transition) {
                return state;
            }

            return transition.nextState;
        };
    }

    private store: Store<string>;

    constructor(private readonly definition: IStateMachineDefinition) {
        const reducer = StateMachine.generateReducer(definition);
        this.store = createStore(reducer);
    }

    public dispatch(transition: string) {
        this.store.dispatch({ type: transition });
    }

    public getState(): string {
        return this.store.getState();
    }
}
