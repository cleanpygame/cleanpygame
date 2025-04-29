# Clean Python Game Levels Compiler

It processes Python level files in \*.py format and generates a JSON file that is used by the web application.

## Setup

```bash
npm install
```

## Usage

### Generate levels.json

```bash
npm start --source <levels_dir> --output <output.json>
```

## Integration into build pipeline

This tool may be integrated into a vite pipeline as a plugin. See vite.config.ts