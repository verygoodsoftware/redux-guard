const { createGuardMiddleware } = require('../src/index')


describe('redux-guard middleware configuration', () => {
    it('should throw an error if not defined', () => {
        expect(() => createGuardMiddleware()).toThrow()
        expect(() => createGuardMiddleware(null)).toThrow()
    })

    it('should throw an error if guards are not specified', () => {
        expect(() => createGuardMiddleware({})).toThrow()
        expect(() => createGuardMiddleware({ guards: [] })).toThrow()
    })

    it('should throw an error if getCurrentState is not a function', () => {
        expect(() => createGuardMiddleware({
            guards: [
                {
                    getCurrentState: 100
                }
            ]
        })).toThrow()

        expect(() => createGuardMiddleware({
            guards: [
                {
                    getCurrentState: null
                }
            ]
        })).toThrow()
    })

    it('should throw an error if constraints are not specified', () => {
        expect(() => createGuardMiddleware({
            guards: [
                {
                    getCurrentState: (state) => state,
                }
            ]
        })).toThrow()
    })
})
