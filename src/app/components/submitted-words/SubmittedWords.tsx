"use client";

import React from "react";

interface SubmittedWordsProps {
  words: string[];
}

export const SubmittedWords = React.memo(({
  words,
}: SubmittedWordsProps) => {
  console.log("🚀 ~ words:", words)
  return (
    <div>
      {words.map((word, index) => (
        <p key={index}>
          {word}
        </p>
      ))}
    </div>
  )
});