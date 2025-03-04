const promptInput = document.getElementById('prompt');
const generateButton = document.getElementById('generate');
const statusDiv = document.getElementById('status');
const generatedImage = document.getElementById('generated-image');

async function generateImage() {
    try {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            showStatus('Please enter a prompt', 'error');
            return;
        }

        // Disable input and button while generating
        promptInput.disabled = true;
        generateButton.disabled = true;
        showStatus('Generating image...', 'pending');
        generatedImage.style.display = 'none';

        console.log('Sending request with prompt:', prompt);
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate image');
        }

        // Show the generated image
        console.log('Loading image from:', data.imageUrl);
        generatedImage.onload = () => {
            console.log('Image loaded successfully');
            generatedImage.style.display = 'block';
            showStatus('Image generated successfully!', 'success');
        };
        generatedImage.onerror = (e) => {
            console.error('Error loading image:', e);
            showStatus('Error loading the generated image', 'error');
        };
        generatedImage.src = data.imageUrl + '?t=' + new Date().getTime(); // Add timestamp to prevent caching

    } catch (error) {
        console.error('Error generating image:', error);
        showStatus(error.message, 'error');
    } finally {
        // Re-enable input and button
        promptInput.disabled = false;
        generateButton.disabled = false;
    }
}

function showStatus(message, type = 'normal') {
    console.log('Status:', type, message);
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
}

// Allow generating by pressing Enter
promptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !generateButton.disabled) {
        generateImage();
    }
});
