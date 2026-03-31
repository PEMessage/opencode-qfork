# qfork-plugin

Quick fork plugin for OpenCode - fork session without git worktree.

## Installation

```bash
opencode add PEMessage/opencode-qfork --from https://github.com/PEMessage/opencode-qfork
```

## Usage

```bash
/qfork              # Fork current session and switch
/qfork <reason>    # Fork with optional reason
```

## Features

- ✅ No git worktree creation
- ✅ No context copying
- ✅ Auto-switch to forked session
- ✅ Single file, zero dependencies

## API

The plugin exposes one command:

| Command | Description |
|---------|-------------|
| `/qfork [reason]` | Fork current session and auto-switch |

## License

MIT
