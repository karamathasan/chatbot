'use client'
import React, { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { createUserWithEmailAndPassword, onAuthStateChanged, getAuth, FirebaseAuthException } from "firebase/auth";
import { auth } from "../firebase";
import { collection, doc } from "firebase/firestore";
import { db } from "../firebase";

import toast, { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import { motion } from "framer-motion";
import { FirebaseError } from "firebase/app";
import { errorPrefix } from "@firebase/util";
import Background from "../components/background";

export default function Login() {
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [user, setUser] = useState('')

    const [showPassword, setShowPassword] = useState(false)

    const router = useRouter()

    const emailExists = () => toast.error(`"${email}"` + " has already been taken. Please enter a different email.")
    const invalidPassword = () => toast.error("Your password has to be at least 6 characters long. Please try again.")
    const invalidEmail = () => toast.error("Your email is invalid. Please try again.")

    const createAccountSuccess = () => toast.success("Account successfully created!")

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

    const register = async () => {
        const userCredential = createUserWithEmailAndPassword(auth, email, password).then(() => {
            const user = userCredential.user;
            const docRef = doc(db, 'users', email)
            createAccountSuccess()
            router.push('/login')
        }).catch(err => {
            switch (err.code) {
                case "auth/email-already-in-use":
                    emailExists()
                    break
                case "auth/weak-password":
                    invalidPassword()
                    break
                case "auth/invalid-email":
                    invalidEmail()
                    break
            }
        })
    }

    return (
        <main className="relative">
            <Toaster position="top-center" />
            <Background />
            <div className="w-screen h-screen min-h-screen flex items-center justify-center absolute float-left clear-left z-[2] bg-none">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ ease: "easeInOut", delay: 0.5, duration: 0.75 }}
                    className="flex flex-col justify-center items-center w-full max-w-md shadow-md border p-4 rounded-[25px] space-y-[5rem] bg-[#f8f8ff]">
                    <h1 className="text-[45px] text[#333] text-left w-full">Create an Account</h1>

                    <div className="w-full flex flex-col justify-center items-center space-y-[1rem] select-none">
                        <form className="flex flex-col space-y-[1rem] w-full justify-center" onSubmit={(e) => e.preventDefault()}>
                            <input type="text" placeholder="Name" className="w-full border rounded-[25px] py-[0.5rem] px-[1rem]" value={name} onChange={(e) => setName(e.target.value)} />
                            <input type="text" placeholder="Email" className="w-full border rounded-[25px] py-[0.5rem] px-[1rem]" value={email} onChange={(e) => setEmail(e.target.value)} />
                            <div className="flex">
                                <input type={(showPassword) ? "text" : "password"} placeholder="Password" className="w-full border rounded-[25px] py-[0.5rem] px-[1rem]" value={password} onChange={(e) => setPassword(e.target.value)} />
                                <span className={"flex justify-around items-center cursor-pointer"} onClick={togglePassword}>
                                    <FontAwesomeIcon icon={(showPassword) ? faEye : faEyeSlash} className="absolute mr-10" />
                                </span>
                            </div>
                            <button
                                disabled={password.length === 0 || email.length === 0 || name.length === 0}
                                type="submit"
                                className={((password.length === 0 || email.length === 0 || name.length === 0) ? "cursor-not-allowed opacity-45" : "cursor-pointer opacity-100") + " bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-[10px] p-2"}
                                onClick={register}
                            >
                                Sign Up
                            </button>
                        </form>
                        <Link href={"/login"}>Or Login into Existing Account</Link>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}