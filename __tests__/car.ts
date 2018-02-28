import { Store } from "redux";
import { createStateMachine, IStateMachineDefinition } from "../src/index";

// Define the state machine
const stateMachine: IStateMachineDefinition = {
    initialState: "PARKED",
    states: [
        {
            id: "PARKED",
            transitions: [ "DRIVE" ],
        },
        {
            id: "MOVING",
            transitions: [ "CRASH", "PARK" ],
        },
        {
            id: "CRASHED",
            transitions: [],
        },
    ],
    transitions: [
        {
            id: "DRIVE",
            nextState: "MOVING",
        },
        {
            id: "CRASH",
            nextState: "CRASHED",
        },
        {
            id: "PARK",
            nextState: "PARKED",
        },
    ],
};

let store: Store<string> = null;

describe("A car", () => {
    beforeEach(() => {
        store = createStateMachine(stateMachine);
    });

    describe("that is parked", () => {
        test("can start driving", () => {
            store.dispatch({ type: "DRIVE" });
            expect(store.getState()).toBe("MOVING");
        });

        test("cannot crash", () => {
            store.dispatch({ type: "CRASH"});
            expect(store.getState()).toBe("PARKED");
        });
    });

    describe("that is moving", () => {
        beforeEach(() => {
            store.dispatch({ type: "DRIVE" });
        });

        test("can crash", () => {
            store.dispatch({ type: "CRASH"});
            expect(store.getState()).toBe("CRASHED");
        });

        test("can park", () => {
            store.dispatch({ type: "PARK"});
            expect(store.getState()).toBe("PARKED");
        });
    });

    describe("that is crashed", () => {
        beforeEach(() => {
            store.dispatch({ type: "DRIVE" });
            store.dispatch({ type: "CRASH" });
        });

        test("cannot park", () => {
            store.dispatch({ type: "PARK"});
            expect(store.getState()).toBe("CRASHED");
        });

        test("cannot start driving", () => {
            store.dispatch({ type: "DRIVE" });
            expect(store.getState()).toBe("CRASHED");
        });
    });
});
