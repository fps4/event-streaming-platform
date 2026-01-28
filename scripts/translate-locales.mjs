import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import { OpenAI } from "openai";
import crypto from "crypto";
import dotenv from 'dotenv';
dotenv.config();

// CONFIG
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SOURCE_LANG = "en";
const TARGET_LANGS = ['nl', 'de', 'fr']; // Add more languages here
const CONTENT_DIR = "./src/locales/langs"; 
const CHECKSUM_FILE = path.join(CONTENT_DIR, "checksums.json");

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

function calculateChecksum(content) {
    return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

async function loadChecksums() {
    if (await fs.pathExists(CHECKSUM_FILE)) {
        return await fs.readJson(CHECKSUM_FILE);
    }
    return {};
}

async function saveChecksums(checksums) {
    await fs.ensureDir(path.dirname(CHECKSUM_FILE));
    await fs.writeJson(CHECKSUM_FILE, checksums, { spaces: 2 });
}

async function translateText(text, targetLang, sourceLang = "en") {
    const prompt = `Translate the following json file from ${sourceLang} to ${targetLang}. Don't enclose the resulting content into codeblock. Keep the formatting intact:\n\n${text}`;

    const response = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
}

async function processFiles(fileName = null) {
    let files;
    const checksums = await loadChecksums();

    if (fileName) {
        const filePath = path.join(CONTENT_DIR, SOURCE_LANG, fileName);
        if (!fs.existsSync(filePath)) {
            console.log(`❌ File not found: ${filePath}`);
            process.exit(1); // Exit with an error code
        }
        files = [filePath];
    } else {
        files = glob.sync(`${CONTENT_DIR}/${SOURCE_LANG}/**/*.json`); // Updated to include files in root and subfolders
    }

    if (files.length === 0) {
        const relativePath = path.relative(process.cwd(), `${CONTENT_DIR}/${SOURCE_LANG}`);
        console.log("❌ No files found to process in the directory:", relativePath);
        process.exit(1); // Exit with an error code
    }

    console.log(`Found ${files.length} file(s) to process:`);
    files.forEach(file => console.log(`- ${file}`)); // Log each file path

    for (const file of files) {
        const relPath = path.relative(`${CONTENT_DIR}/${SOURCE_LANG}`, file); 
        const content = await fs.readFile(file, "utf8");
        const currentChecksum = calculateChecksum(content);

        if (checksums[relPath] === currentChecksum) {
            console.log(`Skipping ${relPath}, no changes detected`);
            continue;
        }

        for (const lang of TARGET_LANGS) {
            const targetPath = path.join(CONTENT_DIR, lang, relPath);

            console.log(`Translating ${relPath} -> [${lang}]`);

            try {
                const translated = await translateText(content, lang, SOURCE_LANG);
                await fs.ensureDir(path.dirname(targetPath));
                await fs.writeFile(targetPath, translated, "utf8");
                console.log(`✅ Written to ${targetPath}`);
            } catch (err) {
                console.error(`❌ Failed to translate ${relPath} to ${lang}:`, err);
            }
        }

        checksums[relPath] = currentChecksum; // Update checksum after successful translation
    }

    await saveChecksums(checksums); // Save updated checksums
    process.exit(0); // Exit the process after processing all files
}

// Update the invocation to accept a file name as an argument
const fileName = process.argv[2] || null; // Pass the file name as a command-line argument
processFiles(fileName);
