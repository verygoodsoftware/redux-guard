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
        test("can start driving", (done: any) => {
            machine.events.subscribe((state: string) => {
                expect(state).toBe("MOVING");
                done();
            });

            machine.transition("DRIVE");
            expect(machine.getState()).toBe("MOVING");
        });

        test("cannot crash", () => {
            machine.transition("CRASH");
            expect(machine.getState()).toBe("PARKED");
        });
    });

    describe("that is moving", () => {
        beforeEach(() => {
            machine.transition("DRIVE");
        });

        test("can crash", (done: any) => {
            machine.events.subscribe((state: string) => {
                expect(state).toBe("CRASHED");
                done();
            });

            machine.transition("CRASH");
            expect(machine.getState()).toBe("CRASHED");
        });

        test("can park", (done: any) => {
            machine.events.subscribe((state: string) => {
                expect(state).toBe("PARKED");
                done();
            });

            machine.transition("PARK");
            expect(machine.getState()).toBe("PARKED");
        });
    });

    describe("that is crashed", () => {
        beforeEach(() => {
            machine.transition("DRIVE");
            machine.transition("CRASH");
        });

        test("cannot park", () => {
            machine.transition("PARK");
            expect(machine.getState()).toBe("CRASHED");
        });

        test("cannot start driving", () => {
            machine.transition("DRIVE");
            expect(machine.getState()).toBe("CRASHED");
        });
    });
});
