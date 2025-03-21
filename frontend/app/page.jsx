'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from 'next/navigation'
import { useStateContext } from '@/contexts/StateContext'

export default function Page() {
  const { sections, setSections, candidateName, setCandidateName, prompt, setPrompt, finalPrompt } = useStateContext();
  const router = useRouter();

  const addSection = () => {
    setSections([...sections, { id: Date.now(), name: "", priority: "", time: "", questions: [] }]);
  };

  const addQuestion = (sectionId) => {
    setSections(sections.map(section =>
      section.id === sectionId ? { ...section, questions: [...section.questions, ""] } : section
    ));
  };

  const updateSection = (sectionId, key, value) => {
    setSections(sections.map(section =>
      section.id === sectionId ? { ...section, [key]: value } : section
    ));
  };

  const updateQuestion = (sectionId, index, value) => {
    setSections(sections.map(section =>
      section.id === sectionId ? {
        ...section,
        questions: section.questions.map((q, i) => (i === index ? value : q))
      } : section
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Meeting Interview
        </h1>

        <main className="flex flex-col items-center justify-center p-4 md:p-8 space-y-8 bg-white rounded-md max-w-3xl mx-auto shadow-lg">
          <div className="flex items-center justify-end w-full">
            <Button onClick={addSection}>Add Section</Button>
          </div>
          {sections.map((section) => (
            <div key={section.id} className="p-4 border rounded w-full bg-gray-50">
              <Input
                placeholder="Section Name"
                value={section.name}
                onChange={(e) => updateSection(section.id, "name", e.target.value)}
                className="mb-2"
              />
              <Select onValueChange={(value) => updateSection(section.id, "priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Time (minutes)"
                value={section.time}
                onChange={(e) => updateSection(section.id, "time", e.target.value)}
                className="mt-2"
              />
              <div className="mt-4 space-y-2">
                {section.questions.map((question, index) => (
                  <Textarea
                    key={index}
                    placeholder="Enter question"
                    value={question}
                    onChange={(e) => updateQuestion(section.id, index, e.target.value)}
                  />
                ))}
                <Button className="mt-2" onClick={() => addQuestion(section.id)}>Add Question</Button>
              </div>
            </div>
          ))}

          <div className="p-4 border rounded w-full bg-gray-50">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700">Candidate Name</label>

              <Input
                placeholder="Candidate Name"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Prompt</label>


              <Textarea
                placeholder="Prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                 className="h-[10rem]"
              />
            </div>


            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Final Prompt</label>


              <Textarea
                placeholder="Final Prompt"
                value={finalPrompt}
                readOnly
                className="h-[10rem]"
              />
            </div>
          </div>




          <Button onClick={() => router.push("/interview")} className="w-full">Start</Button>
        </main>
      </div>
    </div>
  )
}
