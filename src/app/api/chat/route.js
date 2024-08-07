import { NextResponse } from "next/server";
import {OpenAI} from "openai";
require("dotenv").config()

const systemContent = "You are a helpful assistant."

export async function POST(req){
    const data = await req.data()
    const openai = new OpenAI({apiKey:process.env.OPENAI_API_KEY})
    const completion = await openai.chat.completions.create({
        messages: [
            {role: 'system', content: systemContent}, ...data ],
        model: 'gpt-3.5-turbo',
    })
    const response = completion.choices[0].message.content
    return NextResponse.json({message:response})

    // return NextResponse.json({message:"test"})
}