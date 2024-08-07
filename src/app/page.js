'use client'
import { Box, Button, InputBase, TextField, Stack, Typography } from "@mui/material";
import { useState } from "react";

export default function Home() {
  const [messageHistory, setHistory] = useState(
    [{role:"assistant", content:"Hi, I am your __ assistant. How can I help you today?"}]
  )
  const [message, setMessage] = useState('')

  const sendMessage = async () => {
    if (!message.trim()) return;  // Don't send empty messages
  
    setMessage('')
    setHistory((messageHistory) => [
      ...messageHistory,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messageHistory, { role: 'user', content: message }]),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
  
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
  
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setHistory((messageHistory) => {
          let lastMessage = messageHistory[messageHistory.length - 1]
          let otherMessages = messageHistory.slice(0, messageHistory.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text},
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setHistory((messageHistory) => [
        ...messageHistory,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
  }
  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction={'column'}
        width="500px"
        height="100vh"
        border="1px solid black"
        p={4}
        borderRadius={4}
        spacing={3}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messageHistory.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                <Typography>
                  {message.content}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {/* <InputBase>
          </InputBase> */}
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
