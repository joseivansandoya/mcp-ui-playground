import { openai } from '@ai-sdk/openai';
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  stepCountIs,
  experimental_createMCPClient as createMCPClient
} from 'ai';
import { z } from 'zod';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

export const maxDuration = 30;

const mcpUiUrl = new URL('http://localhost:3005/mcp');
const mcpUiClient = await createMCPClient({
  transport: new StreamableHTTPClientTransport(mcpUiUrl),
});
const mcpUitools = await mcpUiClient.tools();

const tools = {
  weather: tool({
    description: 'Get the weather in a location (fahrenheit)',
    inputSchema: z.object({
      location: z.string().describe('The location to get the weather for'),
    }),
    execute: async ({ location }) => {
      const temperature = Math.round(Math.random() * (90 - 32) + 32);
      return {
        location,
        temperature,
      };
    },
  }),
  convertFahrenheitToCelsius: tool({
    description: 'Convert a temperature in fahrenheit to celsius',
    inputSchema: z.object({
      temperature: z
        .number()
        .describe('The temperature in fahrenheit to convert'),
    }),
    execute: async ({ temperature }) => {
      const celsius = Math.round((temperature - 32) * (5 / 9));
      return {
        celsius,
      };
    },
  }),
  ...mcpUitools,
};

console.log('>>> tools', tools);

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const stopOnMCPUITool = ({ steps }: { steps: any[] }) => {
    const last = steps[steps.length - 1];
    // Either inspect toolCalls or toolResults; both are available per step.
    const calls = last?.toolCalls ?? [];
    const results = last?.toolResults ?? [];
    const isUiCall =
      calls.some((c: any) => c.toolName?.startsWith('mcpUiTool-')) ||
      results.some((r: any) => r.toolName?.startsWith('mcpUiTool-'));
    return Boolean(isUiCall);
  };

  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToModelMessages(messages),
    tools,
    stopWhen: [stepCountIs(5), stopOnMCPUITool],
  });

  return result.toUIMessageStreamResponse();
}