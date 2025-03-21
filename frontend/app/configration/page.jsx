'use client'

import { useCallback, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'


const images = [
  '/placeholder.svg?height=400&width=600',
  '/placeholder.svg?height=400&width=600',
  '/placeholder.svg?height=400&width=600',
]

export default function Home() {
  const [selectedModel, setSelectedModel] = useState('openai');
  const [prompt, setPrompt] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams();
  const model = searchParams.get('model');

  const nextSlide = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevSlide = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  const handleCLick = useCallback(() => {
    router.push(`/${model}?llm=${selectedModel}&prompt=${prompt}`)
  },[selectedModel,model,prompt])

  return (
    
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">AI Model Showcase</h1>
      
      <div className="mb-8">
        <Select onValueChange={(value) => setSelectedModel(value)}>
          <SelectTrigger className="w-[30rem] max-w-[30rem]">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gemini">Gemini</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="playai">PlayAI</SelectItem>
          </SelectContent>
        </Select>
      </div>



      <div className="mb-8">
        <label>Prompt</label>
        <Textarea type='text' placeholder="Prompt" className="w-[30rem] max-w-[30rem] h-[10rem]" value={prompt} onChange={(e) => setPrompt(e.target.value)}/>
      </div>

      
      {selectedModel && (
        <div className="text-center mb-8">
          <p className="text-xl">Selected Model: <span className="font-semibold">{selectedModel}</span></p>
        </div>
      )}

      <Button onClick={handleCLick}>Connect</Button>

    </main>
  )
}

