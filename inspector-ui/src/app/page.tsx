'use client';

import React, { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { UIResourceRenderer, isUIResource } from '@mcp-ui/client';
import Input from '@/components/Input';

export default function Chat() {
  const { messages, sendMessage, status } = useChat({
    experimental_throttle: 50, // smooth out streaming renders
  });

  const onInputChange = (input: string) => sendMessage({ text: input });
  const isStreaming = status === "streaming";

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((message) => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) => (
            <Part key={`${message.id}-${i}`} part={part} />
          ))}
        </div>
      ))}

      <Input onInputChange={onInputChange} isStreaming={isStreaming} />
    </div>
  );
}

const Part = React.memo(function Part({ part }: { part: any }) {
  switch (part.type) {
    case 'text':
      return <div>{part.text}</div>;
    case 'dynamic-tool': {
      // @ts-ignore – adjust to your exact shape
      const content = part.output?.content?.[0];
      if (content && isUIResource(content)) {
        return <UIResourceRenderer resource={content.resource} />;
      }
      return null;
    }
    default:
      return null;
  }
});