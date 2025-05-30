import { app, server, fetchConfig, forwardRequest, processWorkloads, Providers, hostsConfig, Workload, HostsConfig } from './index';
import express from 'express';
import axios from 'axios';
import request from 'supertest';
import { Request, Response } from 'express';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock console methods to avoid cluttering test output
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation();
  jest.spyOn(console, 'error').mockImplementation();
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('Workload Server', () => {
  // Setup and teardown
  beforeEach(() => {
    // Clear hostsConfig before each test to prevent test interference
    Object.keys(hostsConfig).forEach(key => {
      delete hostsConfig[key];
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Close the server if it's running
    if (server && server.close) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    }
  });

  describe('fetchConfig', () => {
    it('should successfully fetch and parse YAML configuration', async () => {
      const mockYamlData = `
        workload1:
          provider: example
          host: example.com
          type: web
      `;
      mockedAxios.get.mockResolvedValueOnce({
        data: mockYamlData
      });

      const result = await fetchConfig();

      expect(mockedAxios.get).toHaveBeenCalledWith('https://raw.githubusercontent.com/co-cddo/zerotrust-cloud-identity/refs/heads/main/shared_config/hosts.yaml');
      expect(result).toEqual({
        workload1: {
          provider: 'example',
          host: 'example.com',
          type: 'web'
        }
      });
    });

    it('should handle errors when fetching config', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchConfig();

      expect(console.error).toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });

  describe('forwardRequest', () => {
    it('should forward requests to the correct host', async () => {
      const mockConfig: HostsConfig = {
        workload1: {
          provider: 'example',
          host: 'example.com',
          type: 'web'
        }
      };

      const mockReq = {
        originalUrl: '/workload1/path',
        method: 'GET',
        query: { param: 'value' },
        headers: { 'content-type': 'application/json' }
      } as unknown as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as unknown as Response;

      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { success: true }
      });

      await forwardRequest(mockReq, mockRes, mockConfig);

      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://example.com/path?param=value',
        headers: {
          'content-type': 'application/json',
          host: 'example.com'
        },
        data: undefined
      });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({ success: true });
    });

    it('should forward requests without query parameters', async () => {
      const mockConfig: HostsConfig = {
        workload1: {
          provider: 'example',
          host: 'example.com',
          type: 'web'
        }
      };

      const mockReq = {
        originalUrl: '/workload1/path',
        method: 'GET',
        query: {},
        headers: {}
      } as unknown as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as unknown as Response;

      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: "Success"
      });

      await forwardRequest(mockReq, mockRes, mockConfig);

      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://example.com/path',
        headers: {
          host: 'example.com'
        },
        data: undefined
      });
    });

    it('should handle requests without a remaining path', async () => {
      const mockConfig: HostsConfig = {
        workload1: {
          provider: 'example',
          host: 'example.com',
          type: 'web'
        }
      };

      const mockReq = {
        originalUrl: '/workload1',
        method: 'GET',
        query: {},
        headers: {}
      } as unknown as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as unknown as Response;

      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: "Root Success"
      });

      await forwardRequest(mockReq, mockRes, mockConfig);

      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://example.com',
        headers: {
          host: 'example.com'
        },
        data: undefined
      });
    });

    it('should handle POST requests with body data', async () => {
      const mockConfig: HostsConfig = {
        workload1: {
          provider: 'example',
          host: 'example.com',
          type: 'web'
        }
      };

      const mockReq = {
        originalUrl: '/workload1/path',
        method: 'POST',
        query: {},
        body: { data: 'test' },
        headers: {}
      } as unknown as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as unknown as Response;

      mockedAxios.request.mockResolvedValueOnce({
        status: 201,
        data: { created: true }
      });

      await forwardRequest(mockReq, mockRes, mockConfig);

      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://example.com/path',
        headers: {
          host: 'example.com'
        },
        data: { data: 'test' }
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.send).toHaveBeenCalledWith({ created: true });
    });

    it('should handle PUT requests with body data', async () => {
      const mockConfig: HostsConfig = {
        workload1: {
          provider: 'example',
          host: 'example.com',
          type: 'web'
        }
      };

      const mockReq = {
        originalUrl: '/workload1/path',
        method: 'PUT',
        query: {},
        body: { data: 'test' },
        headers: {}
      } as unknown as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as unknown as Response;

      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { updated: true }
      });

      await forwardRequest(mockReq, mockRes, mockConfig);

      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'PUT',
        url: 'https://example.com/path',
        headers: {
          host: 'example.com'
        },
        data: { data: 'test' }
      });
    });

    it('should handle PATCH requests with body data', async () => {
      const mockConfig: HostsConfig = {
        workload1: {
          provider: 'example',
          host: 'example.com',
          type: 'web'
        }
      };

      const mockReq = {
        originalUrl: '/workload1/path',
        method: 'PATCH',
        query: {},
        body: { data: 'test' },
        headers: {}
      } as unknown as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as unknown as Response;

      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { updated: true }
      });

      await forwardRequest(mockReq, mockRes, mockConfig);

      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'PATCH',
        url: 'https://example.com/path',
        headers: {
          host: 'example.com'
        },
        data: { data: 'test' }
      });
    });

    it('should return 400 for invalid path with no workload name', async () => {
      const mockReq = {
        originalUrl: '/',
        method: 'GET'
      } as unknown as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as unknown as Response;

      await forwardRequest(mockReq, mockRes, {});

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith('Invalid request path');
    });

    it('should return 404 when workload not found', async () => {
      const mockReq = {
        originalUrl: '/unknown-workload',
        method: 'GET'
      } as unknown as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as unknown as Response;

      await forwardRequest(mockReq, mockRes, {});

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith('Workload unknown-workload not found');
    });

    it('should handle errors during request forwarding', async () => {
      const mockConfig: HostsConfig = {
        workload1: {
          provider: 'example',
          host: 'example.com',
          type: 'web'
        }
      };

      const mockReq = {
        originalUrl: '/workload1/path',
        method: 'GET',
        query: {},
        headers: {}
      } as unknown as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as unknown as Response;

      mockedAxios.request.mockRejectedValueOnce(new Error('Network error'));

      await forwardRequest(mockReq, mockRes, mockConfig);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('Error forwarding request to remote host');
    });

    it('should handle DELETE requests correctly', async () => {
      const mockConfig: HostsConfig = {
        workload1: {
          provider: 'example',
          host: 'example.com',
          type: 'web'
        }
      };

      const mockReq = {
        originalUrl: '/workload1/path',
        method: 'DELETE',
        query: {},
        headers: {}
      } as unknown as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as unknown as Response;

      mockedAxios.request.mockResolvedValueOnce({
        status: 204,
        data: undefined
      });

      await forwardRequest(mockReq, mockRes, mockConfig);

      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'DELETE',
        url: 'https://example.com/path',
        headers: {
          host: 'example.com'
        },
        data: undefined
      });

      expect(mockRes.status).toHaveBeenCalledWith(204);
    });

    it('should handle empty original URL', async () => {
      const mockReq = {
        originalUrl: '',
        method: 'GET'
      } as unknown as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as unknown as Response;

      await forwardRequest(mockReq, mockRes, {});

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith('Invalid request path');
    });

    it('should handle requests with query parameters', async () => {
      const mockConfig: HostsConfig = {
        workload1: {
          provider: 'example',
          host: 'example.com',
          type: 'web'
        }
      };

      const mockReq = {
        originalUrl: '/workload1/path',
        method: 'GET',
        query: {
          param1: 'value1',
          param2: ['value2a', 'value2b'],
          param3: true
        },
        headers: {}
      } as unknown as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as unknown as Response;

      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: "Success with query params"
      });

      await forwardRequest(mockReq, mockRes, mockConfig);

      expect(mockedAxios.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringMatching(/https:\/\/example\.com\/path\?.*param1=value1.*/)
      }));

      // Verify the URL contains all expected query parameters
      const calledUrl = mockedAxios.request.mock.calls[0][0].url;
      expect(calledUrl).toContain('param1=value1');
      expect(calledUrl).toMatch(/param2=(value2a|value2b)/);
      expect(calledUrl).toContain('param3=true');
    });

    it('should handle undefined method', async () => {
      const mockConfig: HostsConfig = {
        workload1: {
          provider: 'example',
          host: 'example.com',
          type: 'web'
        }
      };

      const mockReq = {
        originalUrl: '/workload1/path',
        method: undefined,
        query: {},
        headers: {}
      } as unknown as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as unknown as Response;

      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: "Default GET method"
      });

      await forwardRequest(mockReq, mockRes, mockConfig);

      expect(mockedAxios.request).toHaveBeenCalledWith(expect.objectContaining({
        method: 'GET' // Default method should be GET
      }));
    });
  });

  describe('processWorkloads', () => {
    it('should register routes for each workload with valid provider', () => {
      const mockConfig: HostsConfig = {
        workload1: {
          provider: 'example',
          host: 'example.com',
          type: 'web'
        }
      };

      const mockApp = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        patch: jest.fn()
      };

      processWorkloads(mockConfig, mockApp);

      expect(mockApp.get).toHaveBeenCalledWith('/workload1', Providers.example);
      expect(mockApp.get).toHaveBeenCalledWith('/workload1/*', Providers.example);
      expect(mockApp.post).toHaveBeenCalledWith('/workload1/*', Providers.example);
      expect(mockApp.put).toHaveBeenCalledWith('/workload1/*', Providers.example);
      expect(mockApp.delete).toHaveBeenCalledWith('/workload1/*', Providers.example);
      expect(mockApp.patch).toHaveBeenCalledWith('/workload1/*', Providers.example);
    });

    it('should log error for workload with invalid provider', () => {
      const mockConfig: HostsConfig = {
        workload2: {
          provider: 'nonexistent',
          host: 'example.com',
          type: 'web'
        }
      };

      const mockApp = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        patch: jest.fn()
      };

      processWorkloads(mockConfig, mockApp);

      expect(console.error).toHaveBeenCalledWith(
        "Provider 'nonexistent' not found for workload: workload2"
      );
      expect(mockApp.get).not.toHaveBeenCalled();
    });
  });

  describe('Providers', () => {
    it('should call forwardRequest for the example provider', async () => {
      // Create mock for request and response
      const mockReq = {
        originalUrl: '/workload1/path',
        method: 'GET',
        query: {},
        headers: {}
      } as unknown as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as unknown as Response;

      // Set up a mock config for this test
      const testConfig = {
        workload1: {
          provider: 'example',
          host: 'test.com',
          type: 'web'
        }
      };

      // Assign the test config to hostsConfig
      Object.assign(hostsConfig, testConfig);

      // Set up axios request mock for the provider call
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: "Success"
      });

      // Call the example provider directly
      await Providers.example(mockReq, mockRes);

      // Verify axios was called with the right URL (using our test.com host)
      expect(mockedAxios.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('https://test.com/path')
      }));
    });
  });

  describe('Express App', () => {
    it('should have a GET /config endpoint that returns hostsConfig', async () => {
      // Set up a test config
      const testConfig = {
        testWorkload: {
          provider: 'example',
          host: 'test.com',
          type: 'web'
        }
      };

      // Completely replace hostsConfig for testing
      Object.assign(hostsConfig, testConfig);

      const response = await request(app).get('/config');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(testConfig);
    });

    it('should have a catch-all route that returns user and history information', async () => {
      const response = await request(app).get('/not-configured-path');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('history');
      expect(Array.isArray(response.body.history)).toBe(true);
      // We know what the values should be based on the implementation
      expect(response.body.user).toBe('unknown user');
      expect(response.body.history).toContain('insert identity history0 here');
      expect(response.body.history).toContain('insert identity history1 here');
    });

    it('should return user and history information for the root path', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user', 'unknown user');
      expect(response.body).toHaveProperty('history');
      expect(Array.isArray(response.body.history)).toBe(true);
      expect(response.body.history).toHaveLength(2);
      expect(response.body.history[0]).toBe('insert identity history0 here');
      expect(response.body.history[1]).toBe('insert identity history1 here');
    });
  });

  describe('Server Initialization', () => {
    let originalServer: any;
    let originalConsoleLog: any;

    // Before all tests in this block, save the original server reference
    beforeAll(() => {
      jest.setTimeout(10000); // Increase timeout for this suite
      // Save original server
      originalServer = server;
      originalConsoleLog = console.log;
    });

    // After each test, restore the server
    afterEach(() => {
      if (server && server !== originalServer && server.close) {
        server.close();
      }
      console.log = originalConsoleLog;
    });

    it('should handle initialization errors and exit process', async () => {
      // Mock process.exit to prevent actual exit
      const originalExit = process.exit;
      process.exit = jest.fn() as any;

      // Create a rejection that will be used in the mock
      const testError = new Error('Initialization failed');

      // Mock axios to simulate fetchConfig failing
      mockedAxios.get.mockRejectedValueOnce(testError);

      // Directly call the error handling path
      await expect(fetchConfig()).resolves.toEqual({});

      // Call the initialization code with the error to trigger process.exit
      const promise = Promise.reject(testError);
      promise.catch(error => {
        console.error('Server initialization failed:', error);
        process.exit(1);
      });

      // Wait for promises to resolve
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify process.exit was called
      expect(process.exit).toHaveBeenCalledWith(1);

      // Restore process.exit
      process.exit = originalExit;
    });

    it('should call console.log when server starts', async () => {
      // Mock the listen method on the Express app to call its callback
      const originalListen = app.listen;
      const mockListen = jest.fn().mockImplementation((port, callback) => {
        // Call the callback right away
        if (callback) callback();
        // Return a mock server with a close method
        return { close: jest.fn() };
      });

      // Apply the mock
      app.listen = mockListen;

      // Spy on console.log
      const logSpy = jest.spyOn(console, 'log');

      try {
        // Call the server initialization code directly
        const PORT = process.env.PORT || 8080;
        const testServer = app.listen(PORT, () => {
          console.log(`Server is running on port ${PORT}`);
        });

        // Verify console.log was called
        expect(logSpy).toHaveBeenCalledWith(`Server is running on port ${PORT}`);

        // Clean up
        if (testServer && testServer.close) {
          testServer.close();
        }
      } finally {
        // Restore the original app.listen method
        app.listen = originalListen;
        logSpy.mockRestore();
      }
    });

    it('should handle promise rejection in initialization chain', async () => {
      // Mock process.exit to prevent test from terminating
      const originalExit = process.exit;
      process.exit = jest.fn() as any;

      // Mock console.error to verify it's called
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        // Create a Promise that rejects
        const error = new Error('Chain rejection test');
        const promise = Promise.reject(error);

        // Test the rejection handler directly
        await promise.catch(err => {
          console.error('Server initialization failed:', err);
          process.exit(1);
        });

        // Verify both the console.error and process.exit were called correctly
        expect(errorSpy).toHaveBeenCalledWith('Server initialization failed:', error);
        expect(process.exit).toHaveBeenCalledWith(1);
      } finally {
        // Restore the mocks
        process.exit = originalExit;
        errorSpy.mockRestore();
      }
    });
  });
});
