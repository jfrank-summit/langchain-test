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
    SystemMessagePromptTemplate,
} from "langchain/prompts";
import { ConversationChain } from "langchain/chains";
import { BufferMemory, BufferWindowMemory } from "langchain/memory";
import * as readline from 'readline';
import { VectorStoreRetrieverMemory, ENTITY_MEMORY_CONVERSATION_TEMPLATE, EntityMemory } from "langchain/memory";

dotenv.config();

const initChain = async () => {
    const chat = new ChatOpenAI({
        temperature: 0,
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-3.5-turbo",
    });

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
        SystemMessagePromptTemplate.fromTemplate(generateInitializationPrompt()),
        new MessagesPlaceholder("history"),
        HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);
    const chain = new ConversationChain({
        memory: new BufferWindowMemory({ returnMessages: true, memoryKey: "history", k:10 }),
        prompt: chatPrompt,
        llm: chat,
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
        const reflection = await chain.call({ input: generateReflectionPrompt() });
        if (reflection.response === "done") {
            rl.close();
            return;
        }
       
    }
};
main().catch(console.error);
