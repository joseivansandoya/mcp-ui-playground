'use client';

import React, { useState } from 'react';

interface InputProps {
  onInputChange: (input: string) => void;
  isStreaming: boolean;
}

export default function Input ({onInputChange, isStreaming}: InputProps) {
  const [input, setInput] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!input.trim() || isStreaming) return;
        onInputChange(input);
        setInput('');
      }}
    >
      <input
        className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
        value={input}
        placeholder="Say something..."
        onChange={(e) => setInput(e.currentTarget.value)}
      />
    </form>
  );
}
