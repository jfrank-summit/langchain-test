import { ChatOpenAI } from "langchain/chat_models/openai";
import {
    generateInitializationPrompt,
    generatePlanningPrompt,
    generateKnowledgeUpdatePrompt,
    generateActionPrompt,
    generateReflectionPrompt,
} from "./prompts";
import * as dotenv from "dotenv";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    PromptTemplate,
    SystemMessagePromptTemplate,
} from "langchain/prompts";
import { ConversationChain, ConversationalRetrievalQAChain  } from "langchain/chains";
import { BufferMemory, BufferWindowMemory } from "langchain/memory";
import * as readline from 'readline';
import { VectorStoreRetrieverMemory, ENTITY_MEMORY_CONVERSATION_TEMPLATE, EntityMemory } from "langchain/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Chroma } from "langchain/vectorstores/chroma";  
import { VectorStore } from "langchain/dist/vectorstores/base";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

dotenv.config();

const initChain = async () => {
    const chat = new ChatOpenAI({
        temperature: 0.9,
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-3.5-turbo",
    });
    const client = new PineconeClient();
    await client.init({
        apiKey: process.env.PINECONE_API_KEY || "",
        environment: "us-west4-gcp",
        });
    const pineconeIndex = client.Index("test-index");
    const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(),{pineconeIndex});
    //const vectorStore = new Chroma(new OpenAIEmbeddings(),{collectionName:"test-collection}", })
    
    //const vectorStore = await Chroma.fromDocuments([], new OpenAIEmbeddings(), {collectionName:"test-collection}"})
    
    const memory = new VectorStoreRetrieverMemory({
        // 1 is how many documents to return, you might want to return more, eg. 4
        vectorStoreRetriever: vectorStore.asRetriever(4),
        memoryKey: "history",
    });
    const chatPrompt =  PromptTemplate.fromTemplate(`The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

        Relevant pieces of previous conversation:
        {history}

        (You do not need to use these pieces of information if not relevant)

        Current conversation:
        Human: {input}
        AI:`);

    const chain = new ConversationChain({
        memory,
        prompt: chatPrompt,
        llm: chat,
        verbose: true,
    });
    return chain;
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(prompt, (input) => {
            resolve(input);
        });
    });
};

const main = async () => {
    const chain = await initChain();
    
    while (true) {
        const input = await question("What action would you like to take? ");
        const action = await chain.call({ input });
        console.log(`response: ${action.response}`);
        //const reflection = await chain.call({ input: generateReflectionPrompt() });
        // if (reflection.response === "done") {
        //     rl.close();
        //     return;
        // }
       
    }
};
main().catch(console.error);
