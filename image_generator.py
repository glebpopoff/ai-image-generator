from diffusers import StableDiffusionPipeline
import torch
import base64
from io import BytesIO
import sys
import json

def generate_image(prompt):
    try:
        # Initialize the pipeline with a smaller model
        model_id = "CompVis/stable-diffusion-v1-4"
        pipe = StableDiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float32
            # Safety checker is now enabled by default
        )
        
        # Move to CPU
        pipe = pipe.to("cpu")
        
        # Generate the image with smaller size for faster generation
        image = pipe(
            prompt,
            num_inference_steps=20,  # Reduce steps for faster generation
            height=512,
            width=512,
            guidance_scale=7.5  # Standard guidance scale for good quality
        ).images[0]
        
        # Convert to base64
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        # Return as JSON
        print(json.dumps({
            "success": True,
            "image": img_str
        }))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        prompt = sys.argv[1]
        generate_image(prompt)
    else:
        print(json.dumps({
            "success": False,
            "error": "No prompt provided"
        }), file=sys.stderr)
        sys.exit(1)
