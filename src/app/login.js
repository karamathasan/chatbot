'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut} from "firebase/auth";
import { auth } from "./firebase";
import { collection, doc } from "firebase/firestore";
import { db } from "./firebase";


export default function Home() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [user,setUser] = useState('')

    onAuthStateChanged(auth, (currentUser)=>{
        setUser(currentUser)
    })
    
    const register = async ()=>{
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("User signed up:", user);

            const docRef = doc(db,'users',email)
          } catch (error) {
            console.error("Error signing up:", error);
          }
    }

    const login = async ()=>{
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("User logged in:", user);
          } catch (error) {
            console.error("Error logging in:", error);
          }
    }

    const logout = async ()=>{
        signOut(auth)
    }

    return (
    <motion.main
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeInOut", duration: 1 }}
      className="w-screen h-screen flex items-center justify-center"
    >
      <div className="flex flex-col w-full h-[80vh] max-w-md shadow-md border p-4 rounded-[25px] space-y-3 bg-[#f8f8ff]">

        <form className="flex flex-row space-x-2" onSubmit={(e) => e.preventDefault()}>
          <input type="text" placeholder="Message" className="w-full border rounded-[25px] py-[0.5rem] px-[1rem]" value={message} onChange={(e) => setMessage(e.target.value)} />
          <button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-[10px] p-2 " onClick={sendMessage}>Send</button>
        </form>
      </div>
    </motion.main>
  );
}
