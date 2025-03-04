const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log('Generating image for prompt:', prompt);

        // Run the Python script
        const pythonProcess = spawn('python3', ['image_generator.py', prompt]);
        
        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
            console.error('Python error:', data.toString());
        });

        await new Promise((resolve, reject) => {
            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error('Python script failed with code:', code);
                    console.error('Error output:', error);
                    reject(new Error(error || 'Failed to generate image'));
                } else {
                    resolve();
                }
            });
        });

        // Parse the Python script output
        let data;
        try {
            data = JSON.parse(result);
        } catch (e) {
            console.error('Failed to parse Python output:', result);
            throw new Error('Invalid response from image generator');
        }
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to generate image');
        }

        // Generate a unique filename
        const filename = `image-${Date.now()}.png`;
        const filepath = path.join(__dirname, 'public', 'generated', filename);
        
        // Ensure the directory exists
        await fs.mkdir(path.join(__dirname, 'public', 'generated'), { recursive: true });
        
        // Save the image
        await fs.writeFile(filepath, Buffer.from(data.image, 'base64'));
        console.log('Image saved to:', filepath);
        
        res.json({ 
            success: true, 
            imageUrl: `/generated/${filename}`
        });
    } catch (error) {
        console.error('Error details:', error);
        res.status(500).json({ 
            error: error.message,
            hint: 'Make sure Python and required dependencies are installed'
        });
    }
});

// Add a test endpoint to verify the static file serving
app.get('/test-static', (req, res) => {
    res.json({ 
        publicDir: path.join(__dirname, 'public'),
        generatedDir: path.join(__dirname, 'public', 'generated')
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Static files served from:', path.join(__dirname, 'public'));
});
