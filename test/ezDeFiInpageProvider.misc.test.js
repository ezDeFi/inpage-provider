const { ezDeFiInpageProvider } = require('../dist');
const { default: messages } = require('../dist/messages');

const MockDuplexStream = require('./mocks/DuplexStream');

describe('ezDeFiInpageProvider: Miscellanea', () => {

  describe('constructor', () => {

    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.runAllTimers();
    });

    it('succeeds if stream is provided', () => {
      expect(() => new ezDeFiInpageProvider(new MockDuplexStream())).not.toThrow();
    });

    it('succeeds if stream and valid options are provided', () => {
      const stream = new MockDuplexStream();

      expect(
        () => new ezDeFiInpageProvider(stream, {
          maxEventListeners: 10,
        }),
      ).not.toThrow();

      expect(
        () => new ezDeFiInpageProvider(stream, {
          shouldSendMetadata: false,
        }),
      ).not.toThrow();

      expect(
        () => new ezDeFiInpageProvider(stream, {
          maxEventListeners: 10,
          shouldSendMetadata: false,
        }),
      ).not.toThrow();
    });

    it('throws if no or invalid stream is provided', () => {
      expect(
        () => new ezDeFiInpageProvider(),
      ).toThrow(messages.errors.invalidDuplexStream());

      expect(
        () => new ezDeFiInpageProvider('foo'),
      ).toThrow(messages.errors.invalidDuplexStream());

      expect(
        () => new ezDeFiInpageProvider({}),
      ).toThrow(messages.errors.invalidDuplexStream());
    });

    it('throws if bad options are provided', () => {
      const stream = new MockDuplexStream();

      expect(
        () => new ezDeFiInpageProvider(stream, null),
      ).toThrow('Cannot destructure property `jsonRpcStreamName` of \'undefined\' or \'null\'');

      expect(
        () => new ezDeFiInpageProvider(stream, {
          maxEventListeners: 10,
          shouldSendMetadata: 'foo',
        }),
      ).toThrow(messages.errors.invalidOptions(10, 'foo'));

      expect(
        () => new ezDeFiInpageProvider(stream, {
          maxEventListeners: 'foo',
          shouldSendMetadata: true,
        }),
      ).toThrow(messages.errors.invalidOptions('foo', true));
    });

    it('accepts valid custom logger', () => {
      const stream = new MockDuplexStream();
      const customLogger = {
        debug: console.debug,
        error: console.error,
        info: console.info,
        log: console.log,
        trace: console.trace,
        warn: console.warn,
      };

      expect(
        () => new ezDeFiInpageProvider(stream, {
          logger: customLogger,
        }),
      ).not.toThrow();
    });

    it('throws if non-object logger provided', () => {
      const stream = new MockDuplexStream();

      expect(
        () => new ezDeFiInpageProvider(stream, {
          logger: 'foo',
        }),
      ).toThrow(messages.errors.invalidLoggerObject());
    });

    it('throws if provided logger is missing method key', () => {
      const stream = new MockDuplexStream();
      const customLogger = {
        debug: console.debug,
        error: console.error,
        info: console.info,
        log: console.log,
        trace: console.trace,
        // warn: console.warn, // missing
      };

      expect(
        () => new ezDeFiInpageProvider(stream, {
          logger: customLogger,
        }),
      ).toThrow(messages.errors.invalidLoggerMethod('warn'));
    });

    it('throws if provided logger has invalid method', () => {
      const stream = new MockDuplexStream();
      const customLogger = {
        debug: console.debug,
        error: console.error,
        info: console.info,
        log: console.log,
        trace: console.trace,
        warn: 'foo', // not a function
      };

      expect(
        () => new ezDeFiInpageProvider(stream, {
          logger: customLogger,
        }),
      ).toThrow(messages.errors.invalidLoggerMethod('warn'));
    });
  });

  describe('isConnected', () => {
    it('returns isConnected state', () => {

      jest.useFakeTimers();
      const provider = new ezDeFiInpageProvider(new MockDuplexStream());
      provider.autoRefreshOnNetworkChange = false;

      expect(
        provider.isConnected(),
      ).toBe(false);

      provider._state.isConnected = true;

      expect(
        provider.isConnected(),
      ).toBe(true);

      provider._state.isConnected = false;

      expect(
        provider.isConnected(),
      ).toBe(false);

      jest.runAllTimers();
    });
  });
});