---
name: mcp-troubleshooting
description: Troubleshooting workflows for resolving MCP (Model Context Protocol) server connection failures, specifically targeting MongoDB and Postman MCP servers.
---

# MCP Connectivity Troubleshooting Skill

When the user asks to debug or fix an MCP server connection (such as MongoDB or Postman), or when an MCP server fails to connect during startup, follow these specific troubleshooting workflows.

## 1. MongoDB MCP Server Troubleshooting

### Symptom
The MongoDB MCP server hangs during the `connect` command or fails with a DNS timeout (`queryTxt ETIMEOUT`) when using a `mongodb+srv://` connection string.

### Root Cause
Some ISPs, local network firewalls, or DNS resolvers fail to correctly route or resolve MongoDB Atlas SRV/TXT records.

### Resolution
1. Do not rely on changing the system DNS, as it may not always be possible or effective.
2. Instruct the user to obtain or manually construct the standard `mongodb://` connection string (which lists the exact shard hostnames) instead of the `mongodb+srv://` string.
3. Update the `mcp_config.json` with the standard connection string.

**Example Conversion:**
*From:* `mongodb+srv://user:pass@cluster.mongodb.net/db`
*To:* `mongodb://user:pass@shard-00-00.mongodb.net:27017,shard-00-01.mongodb.net:27017,shard-00-02.mongodb.net:27017/db?replicaSet=atlas-shard-0&ssl=true&authSource=admin`

## 2. Postman MCP Server Troubleshooting

### Symptom
The Postman MCP Server connects but returns `401 Unauthorized` when calling tools like `list_resources` or `createCollection`.

### Root Cause
The `x-api-key` in `mcp_config.json` is either malformed, expired, deleted from the Postman dashboard, or lacks the necessary permissions.

### Resolution
1. Do not attempt to guess or modify the existing key format.
2. Instruct the user to navigate to their Postman API Keys dashboard (`https://postman.com/settings/me/api-keys`).
3. Have the user generate a **brand new** API Key.
4. Update `mcp_config.json` under `Postman.headers.x-api-key` with the new key.
5. Restart/reload the IDE to apply the new MCP configuration.

## 3. Postman MCP: Creating & Pushing Collections

When asked to generate or push API endpoints to Postman using the MCP server, do not rely solely on individual endpoint tools if a full workspace setup is requested.

### Workflow for Generating Collections
1. **Understand the Backend Routes:** Analyze the backend routes and schemas (e.g., Express routes and Zod schemas) to map all required endpoints, HTTP methods, and Request Bodies.
2. **Construct Collection JSON:** Build a raw Postman Collection `v2.1.0` JSON structure. Ensure it includes:
   - `info` block (name, schema).
   - `item` array containing category folders.
   - Sub-items for endpoints containing `request.method`, `request.header`, `request.body.raw` (stringified JSON), and `request.url` (`{{baseUrl}}/api/v1/...`).
3. **Avoid String Overload:** Since MCP tool arguments can be large, you can safely pass the parsed JSON object directly into the `collection` parameter of the `createCollection` tool.
4. **Target Workspace:** Always ask or specify the correct `workspace` ID when calling `createCollection`.

**Example MCP Tool Call Structure:**
Tool: `createCollection`
Arguments:
```json
{
  "workspace": "your-workspace-id",
  "collection": {
    "info": { "name": "API Collection", "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
    "item": [
      {
        "name": "Auth",
        "item": [
          {
            "name": "Login",
            "request": {
              "method": "POST",
              "header": [{ "key": "Content-Type", "value": "application/json" }],
              "body": { "mode": "raw", "raw": "{\"email\":\"test@test.com\",\"password\":\"123\"}" },
              "url": "{{baseUrl}}/api/login"
            }
          }
        ]
      }
    ]
  }
}
```
