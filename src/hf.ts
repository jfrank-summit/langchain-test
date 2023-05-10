import { HuggingFaceInference } from "langchain/llms/hf";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { loadQAStuffChain, loadQAMapReduceChain, loadQARefineChain } from "langchain/chains";
import { GithubRepoLoader } from "langchain/document_loaders/web/github";
import { Document } from "langchain/document";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import * as dotenv from "dotenv";
dotenv.config();

const model = new HuggingFaceInference({
    model: "replit/replit-code-v1-3b",
    apiKey: process.env.HUGGING_FACE_API_KEY, 
});

const main = async () => {
    const res = await model.call("what continents do elephants live on?");
    console.log({ res });
};

main().catch(console.error);
