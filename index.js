#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');
const http = require('http');

program
  .name('ai-image-generator')
  .description('Generate images using AI models through Ollama')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate an image from a text prompt')
  .argument('<prompt>', 'Text prompt for image generation')
  .option('-o, --output <path>', 'Output file path', 'output.png')
  .action(async (prompt, options) => {
    try {
      console.log(chalk.blue(`Generating image for prompt: "${prompt}"`));
      
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llava',
          prompt: prompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate image: ${response.statusText}`);
      }

      const data = await response.json();
      const imageData = data.response;

      // Ensure output directory exists
      const outputDir = path.dirname(options.output);
      await fs.mkdir(outputDir, { recursive: true });

      // Save the image
      await fs.writeFile(options.output, Buffer.from(imageData, 'base64'));
      console.log(chalk.green(`✓ Image saved to: ${options.output}`));

    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      if (error.message.includes('fetch')) {
        console.log(chalk.yellow('\nMake sure Ollama is running and llava model is installed:'));
        console.log(chalk.blue('1. Install Ollama from https://ollama.ai'));
        console.log(chalk.blue('2. Run: ollama run llava'));
      }
      process.exit(1);
    }
  });

program.parse();
