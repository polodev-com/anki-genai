require('dotenv').config()
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// const MODEL = "deepseek-reasoner";
const MODEL = "deepseek-chat";

const OCR_RESULTS_PATH = path.join(__dirname, "ocr-results.json");

const OUTPUT_CSV_PATH = path.join(__dirname, "anki_import_deepseek.csv");

const PROMPT = `I have a question. Please analyze it and provide the letter of the correct answer followed by a detailed explanation. Explain why each incorrect option is wrong and why the correct option is right.

Here's the question:
`;

// Configure the OpenAI client to point to the DeepSeek API
const deepseek = new OpenAI({
    apiKey: DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com/v1",
});

async function run() {
    try {
        // Read OCR results from JSON file
        const ocrResultsRaw = fs.readFileSync(OCR_RESULTS_PATH, 'utf-8');
        const ocrResults = JSON.parse(ocrResultsRaw);

        let csvContent = "";
        console.log(`Found ${ocrResults.length} questions to process with DeepSeek...`);

        for (const result of ocrResults) {
            const { filename, text } = result;
            
            console.log(`Processing question from ${filename}...`);

            try {
                // Make the API call to DeepSeek with the OCR text
                const completion = await deepseek.chat.completions.create({
                    model: MODEL,
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: PROMPT + text },
                            ],
                        },
                    ],
                    max_tokens: 1024, // Set a reasonable limit for the response
                });
                const responseText = completion.choices[0].message.content;
                // const responseText = completion.choices[0].message.reasoning_content;
                // Format the CSV content
                // Front side is the original question text
                const front = text.trim().replace(/"/g, '""'); // Escape double quotes
                // Back side is the AI's answer/explanation
                const back = responseText.trim().replace(/"/g, '""'); // Escape double quotes
                csvContent += `"${front}";"${back}"\n`;
                console.log(`  -> Successfully processed question.`);
            } catch (error) {
                console.error(`Error processing question from ${filename}:`, error.message);
            }
        }

        fs.writeFileSync(OUTPUT_CSV_PATH, csvContent, "utf-8");
        console.log(`\n✅ Successfully created Anki import file at: ${OUTPUT_CSV_PATH}`);
    } catch (error) {
        console.error("Error reading OCR results file:", error);
    }
}

run();