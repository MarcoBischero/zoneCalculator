# 🧠 AI Architecture Overview

This project utilizes distinct AI models to power its intelligent features. We currently rely on **Google Gemini 1.5 Flash** for both vision and text generation tasks due to its optimal balance of speed, cost, and multimodal capabilities.

## 1. Vision Analysis (Meal Recognition)
- **Feature**: AI Photo Meal Builder (`/calculator` -> Camera Icon)
- **Model**: `gemini-1.5-flash` (Verified in `src/app/api/vision/route.ts`)
- **Purpose**: accurately identifies food items, estimates portion sizes (in grams), and extracts macronutrients from user-uploaded images.
- **Why Flash?**: Real-time response is critical for user experience. Flash offers low latency while maintaining high accuracy for object recognition.

## 2. Recipe Generation (AI Chef)
- **Feature**: AI Chef (`/chef`)
- **Model**: `gemini-1.5-flash` (Verified in `src/lib/recipe-generator.ts`)
- **Purpose**: Generates balanced Zone Diet recipes based on either available fridge ingredients or abstract block requirements.
- **Why Flash?**: The model excels at following complex structural instructions (JSON schema) and creative constraints (Zone Diet ratios) without the overhead of larger models.

## 3. Future Roadmap
- **Gemini 1.5 Pro**: Potential upgrade for simpler "Chat with Nutritionist" features if deeper reasoning is required.
- **Edge Deployment**: Investigating TensorFlow.js for client-side pre-processing.

## Configuration
Model selection is handled in:
- `src/app/api/vision/route.ts`
- `src/lib/recipe-generator.ts`

API Keys are managed via `GEMINI_API_KEY` in `.env`.
