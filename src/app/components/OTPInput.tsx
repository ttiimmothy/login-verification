'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert"

export function OTPInput() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [touched, setTouched] = useState([false, false, false, false, false, false])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6)
  }, [])

  const handleChange = (element: HTMLInputElement, index: number) => {
    // the input is not a number
    if (isNaN(Number(element.value))) return false

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))])
    setTouched([...touched.map((t, idx) => (idx === index ? true : t))])

    if (element.nextSibling && element.value !== '') {
      (element.nextSibling as HTMLInputElement).focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const pastedArray = pastedData.slice(0, 6).split('')
    if (pastedArray.some(char => isNaN(Number(char)))) return
    setOtp(pastedArray.concat(Array(6 - pastedArray.length).fill('')))
    setTouched(Array(6).fill(true))
    if (inputRefs.current[5]) inputRefs.current[5].focus()
  }

  const handleSubmit = async () => {
    setError('')
    const code = otp.join('')
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Verification failed')
      }
      router.push('/success')
    } catch (err) {
      setError('Verification Error')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Enter Verification Code</h1>
        <div className="flex justify-center mb-4">
          {otp.map((data, index) => (
            <Input
              key={index}
              type="text"
              maxLength={1}
              onKeyDown={handleKeyDown}
              value={data}
              ref={el => {
                if (el) {
                  inputRefs.current[index] = el;
                }
              }}
              onChange={e => handleChange(e.target, index)}
              onPaste={handlePaste}
              className={`w-12 h-12 text-2xl text-center mx-1 ${
                touched[index] && (data === '' || isNaN(Number(data))) ? 'border-red-500' : ''
              }`}
            />
          ))}
        </div>
        <Button onClick={handleSubmit} className="w-full">Verify</Button>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}