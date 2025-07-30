import * as fs from 'fs';
import * as path from 'path';
import type {Topic} from '../types.js'
import {parseLevelFile} from "./parser.ts";

export interface OutputStructure {
    topics: Topic[];
}

export function generate(source: string, output: string): void {
    const outputStructure: OutputStructure = {topics: []};

    // Get all directories in the source directory
    const sourceDirs = fs.readdirSync(source)
        .filter(dir => fs.statSync(path.join(source, dir)).isDirectory())
        .sort();

    for (const topicDir of sourceDirs) {
        const topicPath = path.join(source, topicDir);
        const topicFile = path.join(topicPath, 'topic.json');

        if (!fs.existsSync(topicFile)) {
            continue;
        }

        const topicData = JSON.parse(fs.readFileSync(topicFile, 'utf-8'));
        const topicName = topicData.name;

        console.log(`${topicName} (${topicFile})`);

        const topic: Topic = {
            name: topicName,
            levels: []
        };

        // Get all Python files in the topic directory
        const levelFiles = fs.readdirSync(topicPath)
            .filter(file => file.endsWith('.py'))
            .sort();

        for (const levelFile of levelFiles) {
            const levelFilePath = path.join(topicPath, levelFile);
            console.log(`  * level ${levelFilePath}`);

            // Read the file content
            const content = fs.readFileSync(levelFilePath, 'utf-8');

            // Parse the level with both the file path and content
            const level = parseLevelFile(levelFilePath, content);
            if (level) {
                topic.levels.push(level);
            }
        }

        outputStructure.topics.push(topic);
    }

    // Ensure the output directory exists
    const outputDir = path.dirname(output);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {recursive: true});
    }

    // Write the output file
    fs.writeFileSync(output, JSON.stringify(outputStructure, null, 2), 'utf-8');

    console.log(`✅ Built ${output} from ${source}`);
}

// If this file is run directly
// In ES modules, we can use import.meta.url to check if this is the main module
const isMainModule = import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMainModule) {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('Usage: main.ts <inputDir> <outputFile>');
        process.exit(1);
    }

    const [inputDir, outputFile] = args;

    try {
        await generate(inputDir, outputFile);
        console.log(`Levels compiled from ${inputDir} to ${outputFile}`);
    } catch (err) {
        console.error('Error during level compilation:', err);
        process.exit(1);
    }
}