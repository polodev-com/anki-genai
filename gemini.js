require('dotenv').config()
const API_KEY = process.env.GEMINI_API_KEY;
const IMAGES_FOLDER_PATH = process.env.INPUT_IMAGES_PATH
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const OUTPUT_CSV_PATH = path.join(__dirname, "anki_import_text.csv");

// 4. The updated prompt for Gemini.
// This prompt asks the AI to first extract the text, then provide the answer and explanation,
// separated by '|||'.
const PROMPT = `First, extract all text from this image, including the question and all options.
Then, on a new line, write '|||'.
Finally, after the separator, provide the letter of the correct answer followed by a detail explanation. Why each question is wrong, and why others is right.`;
// --------------------

const genAI = new GoogleGenerativeAI(API_KEY);

// Function to convert a file to a GenerativePart object.
function fileToGenerativePart(filePath, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            mimeType,
        },
    };
}

async function run() {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const imageFiles = fs.readdirSync(IMAGES_FOLDER_PATH).filter(file =>
        /\.(jpe?g|png)$/i.test(file)
    );

    let csvContent = "";
    console.log(`Found ${imageFiles.length} images to process...`);

    for (const file of imageFiles) {
        const imagePath = path.join(IMAGES_FOLDER_PATH, file);
        const mimeType = `image/${path.extname(file).slice(1)}`;

        console.log(`Processing ${file}...`);

        try {
            const imagePart = fileToGenerativePart(imagePath, mimeType);
            const result = await model.generateContent([PROMPT, imagePart]);
            const response = await result.response;
            const fullResponseText = response.text();

            // Split the response into the question and the answer/explanation part
            const parts = fullResponseText.split('|||');

            if (parts.length === 2) {
                // The first part is the question (front of the card)
                const front = parts[0].trim().replace(/"/g, '""'); // Escape double quotes for CSV

                // The second part is the answer/explanation (back of the card)
                const back = parts[1].trim().replace(/"/g, '""'); // Escape double quotes for CSV

                csvContent += `"${front}";"${back}"\n`;
                console.log(`  -> Successfully extracted question and answer.`);
            } else {
                console.log(`  -> Could not parse response for ${file}. Skipping.`);
            }

        } catch (error) {
            console.error(`Error processing ${file}:`, error);
        }
    }

    fs.writeFileSync(OUTPUT_CSV_PATH, csvContent, "utf-8");
    console.log(`\n✅ Successfully created Anki import file at: ${OUTPUT_CSV_PATH}`);
}

run();