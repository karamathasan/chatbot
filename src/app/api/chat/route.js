import { NextResponse } from "next/server";
import OpenAI from "openai";
require("dotenv").config()

const systemContent = "You are a helpful assistant."

export async function POST(req) {
    const openai = new OpenAI(process.env.OPENAI_API_KEY)
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [ { role: 'system', content: systemContent }, ...data ],
        model: 'gpt-3.5-turbo', 
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextDecoder()
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch (err) {
                controller.error(err)
            } finally {
                controller.close()
            }

        }
    })
    // const response = completion.choices[0].message.content
    // return NextResponse.json({message:response})
    return NextResponse.json(stream)
    // return NextResponse.json({message:"test"})
}