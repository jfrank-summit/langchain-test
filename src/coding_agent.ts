import { OpenAI } from "langchain/llms/openai";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    PromptTemplate,
    SystemMessagePromptTemplate,
} from "langchain/prompts";

import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { json } from "stream/consumers";
dotenv.config();

interface CodeResponse {
    all_files: { code: string; filename: string }[];
    info: string;
}

const model = new OpenAI({ temperature: 0, openAIApiKey: process.env.OPENAI_API_KEY, modelName: "gpt-3.5-turbo" });

const writeFile = ({ all_files }: CodeResponse) => {
    const outputDir = "output";
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Create the path for the output file
    all_files.forEach(({ filename, code }) => {
        const outputPath = path.join(outputDir, filename);

        // Write the generated code to the output file
        fs.writeFile(outputPath, code, err => {
            if (err) {
                console.error("Error writing the file:", err);
            } else {
                console.log(`Code written to: ${outputPath}`);
            }
        });
    });
};
const main = async () => {
    const format = JSON.stringify({ all_files: [{ code: "code", filename: "filename" }], info: "info" });
    console.log(format);
    const codeTemplate = (request: string) =>
        `${request}. the entire response should be a json object formatted as follows: ${format}. all extra information should be returned in the info key. do not give any extra information outside of the json object`;

    const prompt = codeTemplate(
        "create a react tic tac toe game in typescript, including all necessary files and dependencies."
    );
    console.log(prompt);
    const response = await model.call(prompt);

    const justJson = response.match(/{[\s\S]*?}/g)?.[0] || "";
    console.log(response);
    console.log("just json: " + justJson);
    //writeFile(JSON.parse(justJson) as CodeResponse);
};
main().catch(console.error);
