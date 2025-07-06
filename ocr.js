require('dotenv').config()
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs').promises;

// Path to the folder containing your images
const imagesDir = process.env.INPUT_IMAGES_PATH;

/**
 * Processes a single image file with Tesseract.js.
 * @param {string} filePath - The full path to the image file.
 * @returns {Promise<{filename: string, text: string}>} Object containing filename and extracted text
 */
const processImage = async (filePath) => {
    try {
        const filename = path.basename(filePath);
        console.log(`Processing ${filename}...`);
        const { data: { text } } = await Tesseract.recognize(
            filePath,
            'eng', // Specify the language
            // { logger: m => console.log(m) } // Uncomment for detailed progress
        );
        
        console.log(`--- Text extracted from ${filename} ---`);
        return {
            filename,
            text
        };
    } catch (error) {
        console.error(`Error processing ${path.basename(filePath)}:`, error);
        return {
            filename: path.basename(filePath),
            text: `Error: ${error.message}`,
            error: true
        };
    }
};

/**
 * Reads a directory, filters for image files, processes them, and saves results to a JSON file.
 */
const processAllImages = async () => {
    console.log(`Reading files from: ${imagesDir}\n`);
    try {
        // Read all files in the directory
        const files = await fs.readdir(imagesDir);

        // Filter for common image file extensions
        const imageFiles = files.filter(file => {
            const extension = path.extname(file).toLowerCase();
            return ['.png', '.jpg', '.jpeg', '.bmp', '.tiff'].includes(extension);
        });

        if (imageFiles.length === 0) {
            console.log('No image files found in the directory.');
            return;
        }

        console.log(`Found ${imageFiles.length} images to process.`);

        // Array to store results
        const results = [];

        // Process each image file sequentially
        for (const file of imageFiles) {
            const imagePath = path.join(imagesDir, file);
            const result = await processImage(imagePath);
            results.push(result);
        }

        // Save results to JSON file
        const outputPath = path.join(process.cwd(), 'ocr-results.json');
        await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
        console.log(`\nResults saved to: ${outputPath}`);

    } catch (error) {
        console.error('Could not read the images directory:', error);
    }
};

// Run the main function
processAllImages();