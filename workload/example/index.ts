import express from 'express'
import type { Request, Response } from 'express'
import axios from 'axios'
import yaml from 'js-yaml'

// Define types for workload configuration
export interface Workload {
  provider: string;
  host: string;
  type: string;
}

// Define type for hosts configuration
export interface HostsConfig {
  [workloadName: string]: Workload;
}

// Define type for provider functions
type ProviderFunction = (req: Request, res: Response) => void;

// Define type for providers object
interface ProviderMap {
  [providerName: string]: ProviderFunction;
}

// Function to fetch and parse the YAML configuration
export async function fetchConfig() {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/co-cddo/zerotrust-cloud-identity/refs/heads/main/shared_config/hosts.yaml')
    const yamlData = response.data
    const jsonConfig = yaml.load(yamlData) as HostsConfig
    console.log('Configuration loaded successfully')
    return jsonConfig
  } catch (error) {
    console.error('Failed to fetch or parse configuration:', error)
    return {} as HostsConfig
  }
}

// Initialize app
const app = express()
const PORT = process.env.PORT || 8080

// Store the config
export let hostsConfig: HostsConfig = {}

// Define server variable to export for testing
let server: any

// Define providers for different types of workloads
export const Providers: ProviderMap = {
  example: async (req: Request, res: Response) => {
    await forwardRequest(req, res, hostsConfig);
  }
}

// Extract the forwarding logic for better testability
export async function forwardRequest(
  req: Request,
  res: Response,
  config: HostsConfig
): Promise<void> {
  try {
    // Get the original URL and extract the workload name from the path
    const originalUrl = req.originalUrl || '';
    const pathParts = originalUrl.split('/').filter(Boolean);

    if (pathParts.length === 0) {
      res.status(400).send('Invalid request path');
      return;
    }

    const workloadName = pathParts[0];
    // Use the provided configuration
    const workload = config[workloadName];

    if (!workload) {
      res.status(404).send(`Workload ${workloadName} not found`);
      return;
    }

    // Remove the workload name from the path
    const remainingPath = pathParts.slice(1).join('/');

    // Construct the target URL
    let targetUrl = `https://${workload.host}${remainingPath ? '/' + remainingPath : ''}`;

    // Forward query parameters if they exist
    if (req.query && Object.keys(req.query).length > 0) {
      const queryString = Object.entries(req.query)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&');

      if (queryString) {
        targetUrl += `?${queryString}`;
      }
    }

    console.log(`Forwarding request to: ${targetUrl}`);

    // Make the request to the target host using axios.request for consistency
    const response = await axios.request({
      method: req.method || 'GET',
      url: targetUrl,
      headers: {
        ...req.headers as any,
        host: workload.host,
      },
      data: ['POST', 'PUT', 'PATCH'].includes(req.method?.toUpperCase() || '') ? req.body : undefined
    });

    // Forward the response back to the client
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('Error forwarding request:', error);
    res.status(500).send('Error forwarding request to remote host');
  }
}

// Process workload configurations and register routes
export function processWorkloads(config: HostsConfig, expressApp: any) {
  for (const workloadName in config) {
    console.log(`Setting up routes for workload: ${workloadName}`);
    const workload = config[workloadName];
    const provider = Providers[workload.provider];
    if (provider) {
      expressApp.get(`/${workloadName}`, provider);
      expressApp.get(`/${workloadName}/*`, provider);
      expressApp.post(`/${workloadName}/*`, provider);
      expressApp.put(`/${workloadName}/*`, provider);
      expressApp.delete(`/${workloadName}/*`, provider);
      expressApp.patch(`/${workloadName}/*`, provider);
      console.log(`Routes registered for ${workloadName} with provider: ${workload.provider}`);
    } else {
      console.error(`Provider '${workload.provider}' not found for workload: ${workloadName}`);
    }
  }
}
const getUserAndHistory = async (_req: Request, _res: Response) => {
  return {
    user: "unknown user",
    history: [
      "insert identity history0 here",
      "insert identity history1 here",
    ]
  }
}

// Fetch the config before starting the server
fetchConfig()
  .then(config => {
    hostsConfig = config

    console.log("fetched host config:", hostsConfig)

    // Set up routes after config is loaded

    // Add a route to access the configuration
    app.get('/config', (req: Request, res: Response) => {
      res.status(200).json(hostsConfig)
    })

    // Process workload configurations
    processWorkloads(hostsConfig, app);

    // Catch-all route for any other path
    app.get('*', async (req: Request, res: Response) => {
      const userAndHistory = await getUserAndHistory(req, res);
      res.status(200).json(userAndHistory)
    })

    // Start the server
    server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })


// Export for testing
export { app, server }