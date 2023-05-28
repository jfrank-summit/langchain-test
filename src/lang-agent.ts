import { Calculator } from "langchain/tools/calculator";
import { SerpAPI } from "langchain/tools";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PlanAndExecuteAgentExecutor } from "langchain/experimental/plan_and_execute";
import * as dotenv from "dotenv";
dotenv.config()


const main = async () => {
    const tools = [new Calculator(), new SerpAPI(process.env.SERPAPI_API_KEY)];
    const model = new ChatOpenAI({
        temperature: 0,
        modelName: "gpt-3.5-turbo",
        verbose: true,
        openAIApiKey: process.env.OPENAI_API_KEY,
    });
    const executor = PlanAndExecuteAgentExecutor.fromLLMAndTools({
      llm: model,
      tools,
    });
    
    const result = await executor.call({
      input: `Who is the current president of the United States? What is their current age raised to the second power?`,
    });
    console.log({ result });
}

main().catch(console.error);