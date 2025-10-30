"use client";

function ws()
{
    const socket = new WebSocket("ws://localhost:4000/ws");
    
}

export default function test()
{
    return <button onClick={ws}>Click me lmao</button>;
}