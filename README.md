# Homer Proxy for Homer Dashboard

## Introduction

Homer Proxy is a simple, effective solution designed to enhance the functionality of the Homer Dashboard. This project
primarily addresses CORS issues, secure handling of passwords and API keys, and facilitates complex integrations.

## Structure

The project consists of two main directories:

1. **src:** Contains the source code of the proxy.
2. **homer-components:** Includes custom components for the Homer Dashboard.

## Features

### 1. CORS Issue Resolution

When using the Homer Dashboard, CORS (Cross-Origin Resource Sharing) headers often pose challenges. Instead of directly
calling an API, this proxy provides an endpoint that ensures proper functioning with respect to CORS headers.

### 2. Secure Handling of Credentials

To avoid storing passwords and API keys in plain text in the Homer Dashboard configuration, this proxy securely manages
these credentials. For each endpoint, the proxy reconfigures necessary headers, such as Basic Authentication or API
keys, based on its configuration. Thus, regardless of what is entered in the Homer Dashboard configuration, the proxy
ensures secure communication. The proxy also logs all expected environment properties to the console at startup.

### 3. Complex Integrations

For more complex integrations, such as with Unifi, the proxy uses external libraries without directly incorporating them
into the Homer Dashboard code. This provides a simple interface for the Homer Dashboard components, abstracting the
complexity.

## Usage Example

An example of how to deploy and use this proxy can be found in the `deploy.sh` script.
