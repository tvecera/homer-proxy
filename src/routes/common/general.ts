import { Request, Response } from 'express';
import { ConfigItem } from '../../config';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { ParsedQs } from 'qs';

/**
 * Function to manage and respond to errors in API requests.
 *
 * @param {string} name - Name of the service or API where the error occurred.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {any} error - The error object that was caught.
 *
 * The function handles different types of errors that might occur during an API request.
 * It checks if the error has a response part (which means the request was made and the server responded with a status
 * code that falls out of the range of 2xx), a request part (which means the request was made but no response was
 * received), or none (indicating an issue in making the request itself).
 */
export function handleError(
  name: string,
  req: Request,
  res: Response,
  error: AxiosError
) {
  if (error.response) {
    req.log.error(error);
    res.status(error.response.status).send(error.response.data);
  } else if (error.request) {
    req.log.error(error);
    res.status(500).send({ message: `No response received from ${name} API` });
  } else {
    req.log.error(error);
    res.status(500).send({ message: `Error in making request to ${name} API` });
  }
}

/**
 * Generates an Axios configuration object with Basic Authentication for making API requests.
 *
 * @param {Request} req - The Express request object. It is used to extract path and query parameters.
 * @param {ConfigItem} config - Configuration object containing the details required for authentication and connection.
 *
 * This function constructs an Axios configuration for making API requests with Basic Authentication.
 * It extracts the path and query parameters from the request object and combines them with the provided configuration.
 *
 * @returns An object with 'path' and 'axiosConfig'. The 'path' is a string extracted from the request,
 *          and 'axiosConfig' is an AxiosRequestConfig object with the baseURL, headers, and params set up for the
 *          request.
 */
export function getAxiosConfigBasicAuth(req: Request, config: ConfigItem) {
  const path = req.params[0];
  const query = req.query;
  const { host, port, username, password } = config;
  const url = `${host}${port ? `:${port}` : ''}`;

  const base64Credentials = btoa(username + ':' + password);
  const axiosConfig = {
    baseURL: url,
    headers: { Authorization: 'Basic ' + base64Credentials },
    params: query,
  } as AxiosRequestConfig;

  return {
    path: path,
    axiosConfig: axiosConfig,
  };
}

/**
 * Creates an Axios configuration object with API key authentication.
 *
 * @param {Request} req - The Express request object. Used to extract path and default query parameters.
 * @param {ConfigItem} config - Configuration object containing the API connection details, including the API key.
 * @param {string} [headerName] - Optional. The name of the header to use for passing the API key.
 *                                If not provided, the API key won't be included in the headers.
 * @param {ParsedQs} [query] - Optional. Custom query parameters to be used instead of the default ones from the
 *                             request.
 *
 * This function is used to generate an Axios configuration for making API requests with an API key.
 * It extracts the path and query parameters, and constructs the base URL using the provided configuration.
 *
 * If a header name for the API key is provided, it adds the API key to the headers of the Axios configuration.
 * If no custom query parameters are provided, it uses the default query parameters from the request.

 * @returns An object with 'path' and 'axiosConfig'. 'Path' is a string extracted from the request,
 *          and 'axiosConfig' is an AxiosRequestConfig object with the baseURL, headers, and params set up for the
 *          request.
 */
export function getAxiosConfigApiKey(
  req: Request,
  config: ConfigItem,
  headerName?: string,
  query?: ParsedQs
) {
  const path = req.params[0];
  const queryValue = query ? query : req.query;
  const { host, port, apikey } = config;
  const url = `${host}${port ? `:${port}` : ''}`;
  const headers = {};
  if (headerName) headers[headerName] = apikey;

  const axiosConfig = {
    baseURL: url,
    headers: headers,
    params: queryValue,
  } as AxiosRequestConfig;

  return {
    path: path,
    axiosConfig: axiosConfig,
  };
}

/**
 * Handles a GET request using basic authentication.
 *
 * @param {string} name - The name of the API or service being accessed. This is used for logging and error messages.
 * @param {Request} req - The Express request object. Used to extract request details and parameters.
 * @param {Response} res - The Express response object. Used to send responses back to the client.
 * @param {ConfigItem} [config] - Optional configuration object containing API connection details like host, port,
 *                                username, and password.
 *
 * This asynchronous function is designed to handle a GET request to a specified API or service using basic
 * authentication.
 * It first checks if the configuration object is provided and valid, especially for the presence of a password.
 * If the configuration is missing or incomplete, it logs an error and sends a 404 status response to the client.
 */
export async function basicAuthGetRoute(
  name: string,
  req: Request,
  res: Response,
  config?: ConfigItem
) {
  if (!config || !config.password) {
    req.log.error(`${name.toUpperCase()} configuration not found`);
    res.status(404).send(`${name.toUpperCase()} configuration not found`);
  } else {
    const { path, axiosConfig } = getAxiosConfigBasicAuth(req, config);
    try {
      const response = await axios.get(path, axiosConfig);
      res.status(response.status).send(response.data);
    } catch (error) {
      handleError(name.toUpperCase(), req, res, error);
    }
  }
}

/**
 * Handles a POST request using basic authentication.
 *
 * @param {string} name - The name of the API or service being accessed. Used for logging and error messages.
 * @param {Request} req - The Express request object. Provides access to the request body and other request-specific
 *                        information.
 * @param {Response} res - The Express response object. Used for sending responses back to the client.
 * @param {ConfigItem} [config] - Optional configuration object containing API connection details like host, port,
 *                                username, and password.
 *
 * This asynchronous function is tailored to handle a POST request to a specified API or service using basic
 * authentication.
 * It first checks if the configuration object is provided and contains the necessary password. If not, it logs an
 * error and sends a 404 status response.
 *
 * If the configuration is valid, it constructs an Axios configuration using `getAxiosConfigBasicAuth` and makes a
 * POST request to the specified path with the request body.
 * Upon success, it forwards the API response to the client.
 */
export async function basicAuthPosttRoute(
  name: string,
  req: Request,
  res: Response,
  config?: ConfigItem
) {
  if (!config || !config.password) {
    req.log.error(`${name.toUpperCase()} configuration not found`);
    res.status(404).send(`${name.toUpperCase()} configuration not found`);
  } else {
    const { path, axiosConfig } = getAxiosConfigBasicAuth(req, config);
    try {
      const response = await axios.post(path, req.body, axiosConfig);
      res.status(response.status).send(response.data);
    } catch (error) {
      handleError(name.toUpperCase(), req, res, error);
    }
  }
}

/**
 * Handles a GET request using API key authentication.
 *
 * @param {string} name - The name of the API or service being accessed. This is used for logging and in error messages.
 * @param {Request} req - The Express request object. It provides access to request details and parameters.
 * @param {Response} res - The Express response object. Used to send responses back to the client.
 * @param {ConfigItem} [config] - Optional configuration object containing API connection details like host, port, and
 *                                API key.
 * @param {string} [headerName] - Optional. The name of the header where the API key should be included.
 *                                If not provided, the API key won't be included in the request headers.
 * @param {ParsedQs} [query] - Optional. Custom query parameters to be used instead of the default ones from the
 *                             request.
 *
 * This asynchronous function is designed to handle a GET request to a specified API or service using an API key for
 * authentication.
 * It first checks if the configuration object is provided and contains the necessary API key. If not, it logs an error
 * and sends a 404 status response.
 */
export async function apiKeyGetRoute(
  name: string,
  req: Request,
  res: Response,
  config?: ConfigItem,
  headerName?: string,
  query?: ParsedQs
) {
  if (!config || !config.apikey) {
    req.log.error(`${name.toUpperCase()} configuration not found`);
    res.status(404).send(`${name.toUpperCase()} configuration not found`);
  } else {
    const { path, axiosConfig } = getAxiosConfigApiKey(
      req,
      config,
      headerName,
      query
    );
    try {
      const response = await axios.get(path, axiosConfig);
      res.status(response.status).send(response.data);
    } catch (error) {
      handleError(name.toUpperCase(), req, res, error);
    }
  }
}
