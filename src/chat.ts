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
import { ConversationChain } from "langchain/chains";
import { BufferMemory, BufferWindowMemory } from "langchain/memory";
import * as readline from 'readline';
import { VectorStoreRetrieverMemory, ENTITY_MEMORY_CONVERSATION_TEMPLATE, EntityMemory } from "langchain/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

dotenv.config();

const initChain = async () => {
    const chat = new ChatOpenAI({
        temperature: 0,
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-3.5-turbo",
    });
    const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
    const memory = new VectorStoreRetrieverMemory({
        // 1 is how many documents to return, you might want to return more, eg. 4
        vectorStoreRetriever: vectorStore.asRetriever(1),
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
    // const goal = "create a simple product requirement document for a tic tac toe game";

    const chain = await initChain();
    // const { response: plan } = await chain.call({ input: generatePlanningPrompt(goal) });
    // console.log(`plan: ${JSON.stringify(plan)}`);

    while (true) {
        const input = await question("What action would you like to take? ");
        const action = await chain.call({ input });
        console.log(`action: ${JSON.stringify(action)}`);
        //const reflection = await chain.call({ input: generateReflectionPrompt() });
        // if (reflection.response === "done") {
        //     rl.close();
        //     return;
        // }
       
    }
};
main().catch(console.error);
