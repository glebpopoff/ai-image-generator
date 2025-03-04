# AI Image Generator CLI

A command-line tool to generate images using AI models through Ollama.

## Prerequisites

1. Install [Ollama](https://ollama.ai)
2. Install the llava model:
   ```bash
   ollama run llava
   ```

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Link the package globally:
   ```bash
   npm link
   ```

## Usage

Generate an image:
```bash
ai-image-generator generate "Cats in the cloud"
```

Specify output path:
```bash
ai-image-generator generate "Cats in the cloud" -o ./images/cats.png
```

## Options

- `-o, --output <path>`: Specify the output file path (default: output.png)
- `-h, --help`: Display help information
- `-V, --version`: Display version information
