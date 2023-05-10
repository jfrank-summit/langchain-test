import { ChatOpenAI } from "langchain/chat_models/openai";
import { WebBrowser } from "langchain/tools/webbrowser";
import { OpenAI } from "langchain/llms/openai";
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

const model = new OpenAI({ temperature: 0, openAIApiKey: process.env.OPENAI_API_KEY, modelName: "gpt-3.5-turbo" });
const embeddings = new OpenAIEmbeddings();

const repoModel = async () => {
    const githubLoader = new GithubRepoLoader("https://github.com/subspace/blockexplorer", {
        //branch: "main",
        recursive: false,
        unknown: "warn",
    });
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 8000,
        chunkOverlap: 1,
    });
    const docs = await githubLoader.loadAndSplit(splitter);

    const chain = loadQARefineChain(model);
    const store = await MemoryVectorStore.fromDocuments(docs, embeddings);
    const question = "what framework is used for indexing data for the block explorer?";
    const relevantDocs = await store.similaritySearch(question);
    console.log(docs.length, relevantDocs.length);
    const response = await chain.call({ input_documents: relevantDocs, question });

    console.log(response);
};

const main = async () => {
    await repoModel();
};

main().catch(console.error);
