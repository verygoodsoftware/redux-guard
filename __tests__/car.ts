import { IStateMachineDefinition, StateMachine } from "../src/index";

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

let machine: StateMachine = null;

describe("A car", () => {
    beforeEach(() => {
        machine = new StateMachine(stateMachine);
    });

    describe("that is parked", () => {
        test("can start driving", () => {
            machine.dispatch("DRIVE");
            expect(machine.getState()).toBe("MOVING");
        });

        test("cannot crash", () => {
            machine.dispatch("CRASH");
            expect(machine.getState()).toBe("PARKED");
        });
    });

    describe("that is moving", () => {
        beforeEach(() => {
            machine.dispatch("DRIVE");
        });

        test("can crash", () => {
            machine.dispatch("CRASH");
            expect(machine.getState()).toBe("CRASHED");
        });

        test("can park", () => {
            machine.dispatch("PARK");
            expect(machine.getState()).toBe("PARKED");
        });
    });

    describe("that is crashed", () => {
        beforeEach(() => {
            machine.dispatch("DRIVE");
            machine.dispatch("CRASH");
        });

        test("cannot park", () => {
            machine.dispatch("PARK");
            expect(machine.getState()).toBe("CRASHED");
        });

        test("cannot start driving", () => {
            machine.dispatch("DRIVE");
            expect(machine.getState()).toBe("CRASHED");
        });
    });
});
