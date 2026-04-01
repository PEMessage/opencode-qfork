# AGENTS.md - OpenCode QFork Plugin

Agentic coding guidelines for the opencode-qfork repository.

## Project Overview

A TypeScript plugin for OpenCode that adds the `/qfork` command to quickly fork sessions without git worktree creation.

## Build & Development Commands

```bash
# Type check only (fast feedback)
bun run typecheck

# Build TypeScript to JavaScript
bun run build

# Development mode - builds and runs with test config
bun run dev

# Install dependencies
bun install
```

**Note**: There is no test suite configured yet. To add tests, use Bun's built-in test runner (`bun:test`).

## Code Style Guidelines

### TypeScript Configuration

- **Target**: ES2022 with ESNext modules
- **Module Resolution**: bundler
- **Strict Mode**: Enabled - all strict options active
- **Declaration files**: Generated (`.d.ts`)
- **Bun Types**: Included via `types: ["bun"]` in tsconfig

### Formatting & Indentation

- **Indentation**: Tabs (not spaces)
- **Line Endings**: Unix (LF)
- **Semicolons**: Required at end of statements
- **Quote Style**: Double quotes for strings, backticks for templates
- **Trailing Commas**: Use where allowed

### Naming Conventions

- **Functions**: camelCase (e.g., `quickFork`, `sendIgnoredMessage`)
- **Types/Interfaces**: PascalCase (e.g., `PluginInput`)
- **Constants**: camelCase for local, no special const casing
- **Files**: kebab-case for multi-word files (e.g., `qfork.ts`)
- **Plugin Names**: PascalCase with "Plugin" suffix (e.g., `QuickForkPlugin`)

### Imports

```typescript
// Type imports first
import type { Plugin, PluginInput } from "@opencode-ai/plugin"

// Then value imports
import { OpencodeClient } from "@opencode-ai/sdk/client"

// Use @opencode-ai/sdk/client for client types
```

### Error Handling Patterns

```typescript
// Silent error handling (for non-critical operations)
await someOperation().catch(() => {}) // Ignore errors

// Error logging via client
await client.app.log({
    body: {
        service: "qfork",
        level: "error", // or "warn", "info"
        message: "Error description",
        extra: { /* context */ }, // Use 'extra', not 'metadata'
    },
}).catch(() => {})

// Try-catch with typed errors
try {
    // operation
} catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    // handle
}
```

### TypeScript Types

```typescript
// Return types for async functions
async function myFunc(): Promise<void> { }

// Object return types
Promise<{ success: boolean; message: string; newSessionId?: string }>

// Using 'any' with casting (when necessary)
output.parts.push({ type: "text", text: "msg" } as any)

// Nullish coalescing assignment
opencodeConfig.command ??= {}
```

### Plugin Architecture

Plugins follow the OpenCode hooks pattern:

```typescript
const MyPlugin: Plugin = async (ctx: PluginInput) => {
    const { client } = ctx

    return {
        // Register commands
        config: async (opencodeConfig) => { },

        // Handle command execution
        "command.execute.before": async (input, output) => { },

        // Other hooks: "chat.message", "tool.execute.before", etc.
    }
}
```

### API Client Usage

- Use `OpencodeClient` type from `@opencode-ai/sdk/client`
- Client methods:
  - `client.session.fork()` - Fork a session
  - `client.session.prompt()` - Send a message to session
  - `client.app.log()` - Log to application log
  - `client.tui.publish()` - Publish TUI events (toast, prompts)

### Comment Style

```typescript
/**
 * JSDoc for public functions
 * @param paramName Description
 */

// Inline comments use double slash with space
// TODO: Format for todo items

// Attribution comments for borrowed code:
// Thanks to: <source-reference>
```

## File Structure

```
qfork.ts          # Main source file (single file plugin)
qfork.js          # Compiled output (gitignored)
qfork.d.ts        # Type declarations (gitignored)
package.json      # Dependencies and scripts
tsconfig.json     # TypeScript configuration
.dev/             # Development configuration
  opencode.jsonc  # OpenCode dev config
  plugins/        # Symlink to parent for dev
```

## Development Workflow

1. Edit `qfork.ts` (never edit `.js` directly - it's compiled)
2. Run `bun run typecheck` to verify types
3. Run `bun run build` to compile
4. Run `bun run dev` to test in OpenCode

## Peer Dependencies

This is a plugin - it has peer dependencies on:
- `@opencode-ai/plugin` >=0.13.7
- `@opencode-ai/sdk`

Do not bundle these - they are provided by the host OpenCode environment.

## Common Pitfalls

- **Logging**: Use `extra` not `metadata` for structured log data
- **TUI Events**: Valid types are `"tui.prompt.append"`, `"tui.command.execute"`, `"tui.toast.show"`
- **Session Operations**: When forking, send confirmation messages to the NEW session ID (not the original)
- **Silent Operations**: Mark non-essential operations with `.catch(() => {})` to prevent cascading failures

## License

MIT - Keep license headers in source files when present.
