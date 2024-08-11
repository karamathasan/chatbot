'use client'

/* COMPONENTS */
import Message from "./components/message";

import { useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { doc, query, collection, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import Background from "./components/background";

export default function Home() {
  const router = useRouter()
  const logoutSuccess = () => toast.success("Successfully logged out!")
  const [user,setUser] = useState({})
  const [name,setName] = useState('')
  const [loading, setLoading] = useState(true)

  onAuthStateChanged(auth, async (currentUser) => {
    if (!currentUser) {
      router.push('/login')
    } else {
      setUser(currentUser)
      await getName()
      
      const oldMessages = await loadPreviousMessages()
      setMessages(oldMessages)
      
      setLoading(false)
    }
  })

  const loadPreviousMessages = async()=>{
    const docRef = doc(collection(db, "users"), user.uid)
    const docSnap = await getDoc(docRef)
    const oldMessages = await docSnap.data().messages
    return oldMessages
  }

  const getName = async ()=>{
    const docRef = doc(collection(db, "users"), user.uid)
    const docSnap = await getDoc(docRef)
    const name = docSnap.data().name
    setName(name)
  }

  const updateGreeting = (message, index)=>{
    //TODO: very hardcoded solution, may need future changes
    if (index === 0 && !message.content.includes(name)){
      const newMessage = messages[0]
      newMessage.content = `Hi ${name}, I am your AI assistant. How can I help you today?`
      return newMessage
    }
    else return message
  }

  const [messages, setMessages] = useState(
    [{ role: "assistant", content: `Hi, I am your AI assistant. How can I help you today?` }],
  )
  
  const updateDBHistory = async ()=>{
    const docRef = doc(collection(db, "users"), user.uid)
    const docSnap = await getDoc(docRef)
    await setDoc(docRef,{...docSnap.data(), messages:messages})
  }

  const logout = async () => {
    logoutSuccess()
    signOut(auth)
    router.push('/login')
  }

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
        { role: 'assistant', content: finalResponse }
      ])
      

    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
    updateDBHistory()
  }

  return (
    <main className="relative">
      <Background />
      <div className="w-screen h-screen min-h-screen flex flex-col items-center justify-center absolute float-left clear-left z-[2] bg-none">
        <div className="w-full flex flex-row justify-end items-center p-[2rem]">
          <button className="border-blue-600 border-[3px] rounded-[20px] p-[1rem] text-[#333] bg-[#fff] hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white transition ease-in-out duration-250" onClick={logout}>Log out</button>
        </div>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeInOut", duration: 1 }}
          className="flex flex-col w-full h-[80vh] max-w-[80vw] shadow-md border p-4 rounded-[25px] space-y-3">
          <div className="flex flex-row justify-start items-center space-x-[0.5rem]">
            <div className="relative w-[24px] h-[24px]">
              <Image priority src={"sparkles.svg"} width={0} height={0} sizes="100vw" style={{ width: "100%", height: "auto" }} alt={""} quality={100} />
            </div>
            <h1>AI Chatbot</h1>
          </div>
          <div className="flex flex-col flex-grow space-y-2 overflow-auto max-h-full">
            {loading ? (<>. . . . .</>) : (
              messages.map((message, index) => { 
              message = updateGreeting(message, index)
              // console.log(message)
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
              })
            )}
          </div>

          <form className="flex flex-row space-x-2" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Message" className="w-full border rounded-[25px] py-[0.5rem] px-[1rem]" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-[10px] p-2 " onClick={sendMessage}>Send</button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
