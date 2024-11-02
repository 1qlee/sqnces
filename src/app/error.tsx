"use client"

// app/dashboard/error.js
export default function Error({ error }: { error: unknown}) {
  console.log(error);
  return (
    <div>
      <h1>An error occurred</h1>    </div>
  );
}