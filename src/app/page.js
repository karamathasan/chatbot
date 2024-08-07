'use client'

import { useState } from "react";
import Message from "./components/message";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
  const [messages, setMessages] = useState(
    [{ role: "assistant", content: "Hi, I am your AI assistant. How can I help you today?" }]
  )

  const [message, setMessage] = useState('')
  const sendMessage = async () => {
    if (!message.trim()) return;  // Don't send empty messages

    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message }
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let finalResponse = "";
      while (true) { // reader loads text in chunks (per word); this loop appends these chunks into one string, then we use setMessages
        const { done, value } = await reader.read()
        if (done) break
        finalResponse += decoder.decode(value, { stream: true })
      }

      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: finalResponse}
      ])

    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
  }

  return (
    <motion.main
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeInOut", duration: 1 }}
      className="w-screen h-screen flex items-center justify-center"
    >
      <div className="flex flex-col w-full h-[80vh] max-w-md shadow-md border p-4 rounded-[25px] space-y-3 bg-[#f8f8ff]">
        <div className="flex flex-row justify-start items-center space-x-[0.5rem]">
          <div className="relative w-[24px] h-[24px]">
            <Image priority src={"sparkles.svg"} width={0} height={0} sizes="100vw" style={{ width: "100%", height: "auto" }} alt={""} quality={100} />
          </div>
          <h1>AI Chatbot</h1>
        </div>
        <div className="flex flex-col flex-grow space-y-2 overflow-auto max-h-full">
          {messages.map((message, index) => {
            return (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ease: "easeInOut", duration: 0.5, delay: 0.3 }}
              >
                <Message key={index} message={message} />
              </motion.div>
            );
          })}
        </div>

        <form className="flex flex-row space-x-2" onSubmit={(e) => e.preventDefault()}>
          <input type="text" placeholder="Message" className="w-full border rounded-[25px] py-[0.5rem] px-[1rem]" value={message} onChange={(e) => setMessage(e.target.value)} />
          <button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-[10px] p-2 " onClick={sendMessage}>Send</button>
        </form>
      </div>
    </motion.main>
  );
}
