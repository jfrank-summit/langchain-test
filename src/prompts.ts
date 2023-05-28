export const generateInitializationPrompt = (): string =>
    `You are a useful AI agent that will be given goals. Your task is to create and execute plans \
to achieve those goals, taking into account the current state of the environment. You will have \
time for reflection to evaluate your performance and make adjustments as needed. Get ready to \
assist and excel!`;

export const generatePlanningPrompt = (goal: string): string =>
    `You will be attempting to achive this goal: "${goal}" \
you will be able to execute a set of actions to achieve this goal. \
Create a plan of actions to achieve this goal.`;

export const generateReflectionPrompt = (): string =>
    `Reflect on your performance. Did you achieve the goal? If you are completely finished, say "done" with no other message.`;

export const generateActionPrompt = (): string => {
    return `Do the next action in the plan`;
};

export const generateKnowledgeUpdatePrompt = (fact: string): string =>
    `Update agent's knowledge with the fact: "${fact}"`;
