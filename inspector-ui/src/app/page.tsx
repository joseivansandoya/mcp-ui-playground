'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { UIResourceRenderer, isUIResource } from '@mcp-ui/client';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(message => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) => {
            const partKey = uuidv4(); // Generate unique key for each part
            switch (part.type) {
              case 'text':
                return <div key={partKey}>{part.text}</div>;
              // case 'dynamic-tool':
              default:
                // @ts-ignore
                const content = part.output?.content?.[0];
                if (content) {
                  console.log('>>> isUIResource', isUIResource(content));
                  if (isUIResource(content)) {
                    return (
                      <div key={partKey}>
                        <pre>
                          {JSON.stringify(part, null, 2)}
                        </pre>
                        <UIResourceRenderer resource={content.resource} />
                      </div>
                    );
                  }
                }
                return (
                  <pre key={partKey}>
                    {JSON.stringify(part, null, 2)}
                  </pre>
                );
            }
          })}
        </div>
      ))}

      <form
        onSubmit={e => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput('');
        }}
      >
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={e => setInput(e.currentTarget.value)}
        />
      </form>
    </div>
  );
}