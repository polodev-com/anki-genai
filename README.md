# Anki GenAI

A Node.js application that uses Optical Character Recognition (OCR) and AI models to automatically generate Anki flashcards from images containing exam questions.

## Overview

This project helps you create Anki flashcards from certification exam questions by:
1. Extracting text from images using OCR (Optical Character Recognition)
2. Processing the extracted text with AI models to generate answers and explanations
3. Creating CSV files that can be imported directly into Anki

## Features

- Text extraction from images using Tesseract.js
- Support for multiple AI models:
  - Google Gemini
  - DeepSeek
- Export to Anki-compatible CSV format
- Customizable prompts for different AI models

## Prerequisites

- Node.js (v14 or higher)
- npm package manager
- Images of exam questions

## Installation

1. Clone this repository:
   ```
   git clone <repository-url>
   cd anki-genai
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the project root with your API keys:
   ```
   INPUT_IMAGES_PATH=/path/to/your/images/folder
   GEMINI_API_KEY=your_gemini_api_key
   DEEPSEEK_API_KEY=your_deepseek_api_key
   ```

## Usage

To be update
```