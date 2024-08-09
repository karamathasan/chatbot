'use client'

import { useState } from "react";


import Link from "next/link";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function Login() {
  /* useStates for login info */
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [user, setUser] = useState('')

  const router = useRouter()

  const notifyLoginError = () => toast.error("Username or password is invalid. Please try again.");
  const notifyLoginSuccess = () => toast.success("Successful login!")

  /* password input box functionality */
  const [showPassword, setShowPassword] = useState(false)

  const togglePassword = () => { 
      setShowPassword(!showPassword)
  }

  onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      router.push('/')
    } else {
      setUser(currentUser)
    }
  })


  const login = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      notifyLoginSuccess()
      router.push("/")
    } catch (error) {
      notifyLoginError()
    }
  }

  return (
    <motion.main
      initial={{ y: -25, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeInOut", delay:0.25 ,duration: 0.75 }}
      className="w-screen h-screen flex items-center justify-center"
    >
      <Toaster position="top-center" />
      <div className="flex flex-col justify-center items-center w-full max-w-md shadow-md border p-4 rounded-[25px] space-y-[5rem] bg-[#f8f8ff]">
        <div className="w-full">
          <h1 className="text-[45px] text[#333] text-left w-full">Welcome Back!</h1>
          <p className="text[#333] text-left w-full">Enter Your Username & Password</p>
        </div>

        <div className="w-full flex flex-col justify-center items-center space-y-[1rem]">
          <form className="flex flex-col space-y-[1rem] w-full justify-center select-none" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Email" className="w-full border rounded-[25px] py-[0.5rem] px-[1rem]" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="flex">
              <input type={(showPassword) ? "text" : "password"} placeholder="Password" className="w-full border rounded-[25px] py-[0.5rem] px-[1rem]" value={password} onChange={(e) => setPassword(e.target.value)} />
              <span className={"flex justify-around items-center cursor-pointer"} onClick={togglePassword}>
                <FontAwesomeIcon icon={(showPassword) ? faEye : faEyeSlash } className="absolute mr-10" />
              </span>
            </div>
            <button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-[10px] p-2" onClick={login}>Sign In</button>
          </form>
          <Link href={"/signup"}>Or Create a New Account</Link>
        </div>
      </div>
    </motion.main>
  );
}
