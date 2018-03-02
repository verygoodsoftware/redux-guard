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

type ReducerFn = (state: string, transitionName: string) => string;
type ReducerMap = Map<string, ReducerFn>;

export class StateMachine {
    private reducers: ReducerMap;
    private store: Store<string>;

    constructor(private readonly definition: IStateMachineDefinition) {
        this.reducers = Map<string, ReducerFn>();

        const reducer = this.generateReducer(definition);
        this.store = createStore(reducer);
    }

    public transition(transition: string) {
        this.store.dispatch({ type: transition });
    }

    public getState(): string {
        return this.store.getState();
    }

    private generateReducer(machine: IStateMachineDefinition): Reducer<string> {
        // Index the transitions
        const indexTransistions = (acc: Map<string, ITransition>, current: ITransition) => {
            return acc.set(current.id, current);
        };
        const transistionsIdx = machine.transitions.reduce(indexTransistions, Map<string, ITransition>());

        // Generate reducers for each state
        const indexStates = (acc: ReducerMap, current: IState) => {
            const reducer = (state: string, transitionName: string): string => {
                // Is the transition allowed?
                const allowed = current.transitions.some((v: string) => v === transitionName);
                if (!allowed) {
                    return state;
                }

                // Return the next state
                const transition = transistionsIdx.get(transitionName);
                if (transition === undefined) {
                    return state;
                }

                return transition.nextState;
            };

            return acc.set(current.id, reducer);
        };
        const statesIdx = machine.states.reduce(indexStates, this.reducers);

        // Create a reducer
        return (state = machine.initialState, action: Action) => {
            // Call the approriate reducer
            const reducer = statesIdx.get(state);
            if (reducer === undefined) {
                return state;
            }

            return reducer.call(this, state, action.type as string);
        };
    }
}
