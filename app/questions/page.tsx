"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

type Question = {
  id: string
  question_text: string
}

export default function QuestionListPage() {
  const [questions, setQuestions] = useState<Question[]>([])

  const loadQuestions = async () => {
    const res = await fetch("http://localhost:8080/questions")
    const data = await res.json()
    setQuestions(data)
  }

  const handleDelete = async (id: string) => {
    await fetch(`http://localhost:8080/questions/${id}`, {
      method: "DELETE",
    })
    loadQuestions()
  }

  useEffect(() => {
    loadQuestions()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">รายการคำถาม</h1>
      <ul className="space-y-4">
        {questions.map((q, idx) => (
          <li key={q.id} className="flex justify-between items-center border-b pb-2">
            <span>{idx + 1}. {q.question_text}</span>
            <Button variant="destructive" onClick={() => handleDelete(q.id)}>ลบ</Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
