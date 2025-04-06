const core = require('@actions/core');
const Kutt = require('kutt').default;

// Mock the core module
jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

// Mock the Kutt module
jest.mock('kutt', () => {
  const mockKutt = {
    set: jest.fn().mockReturnThis(),
    links: jest.fn().mockReturnThis(),
    create: jest.fn(),
  };
  return {
    default: jest.fn().mockImplementation(() => mockKutt),
  };
});

// Import the action after mocking
const { run } = require('../index');

describe('Kutt URL Shortener Action', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'api-url':
          return 'https://kutt.it/api/v2';
        case 'api-key':
          return 'test-api-key';
        case 'target-url':
          return 'https://example.com';
        default:
          return '';
      }
    });
  });

  it('should successfully shorten a URL', async () => {
    // Mock successful Kutt response
    const mockShortUrl = 'https://kutt.it/abc123';
    Kutt().links().create.mockResolvedValue({
      link: mockShortUrl,
      id: 'abc123',
    });

    await run();

    // Verify core.setOutput was called with correct values
    expect(core.setOutput).toHaveBeenCalledWith('link', mockShortUrl);
    expect(core.setOutput).toHaveBeenCalledWith('id', 'abc123');

    // Verify no errors were set
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  it('should handle missing required inputs', async () => {
    // Mock missing inputs
    core.getInput.mockImplementation(() => '');

    await run();

    // Verify error was set
    expect(core.setFailed).toHaveBeenCalledWith(
      'Missing required inputs: api-url, api-key, target-url'
    );
  });

  it('should handle Kutt API errors', async () => {
    // Mock Kutt API error
    const errorMessage = 'API Error';
    Kutt().links().create.mockRejectedValue(new Error(errorMessage));

    await run();

    // Verify error was set
    expect(core.setFailed).toHaveBeenCalledWith(errorMessage);
  });

  it('should handle invalid response from Kutt', async () => {
    // Mock invalid response (missing shortUrl)
    Kutt().links().create.mockResolvedValue({});

    await run();

    // Verify error was set
    expect(core.setFailed).toHaveBeenCalledWith('Failed to get shortened URL from response');
  });

  it('should use custom API URL when provided', async () => {
    const customApiUrl = 'https://custom-kutt-instance.com/api/v2';
    core.getInput.mockImplementation((name) => {
      if (name === 'api-url') return customApiUrl;
      return 'test-value';
    });

    await run();

    // Verify Kutt client was initialized with custom URL
    expect(Kutt().set).toHaveBeenCalledWith('api', customApiUrl);
  });
});
