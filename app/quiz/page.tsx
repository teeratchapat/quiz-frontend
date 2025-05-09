"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { toast } from "sonner"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"

type Choice = {
  id: string
  choice_text: string
  is_correct?: boolean
}

type Question = {
  id: string
  question_text: string
  choices: Choice[]
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const fetchQuestions = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("http://localhost:8080/questions")
      if (!res.ok) throw new Error("โหลดคำถามล้มเหลว")
      const data = await res.json()

      const enriched = await Promise.all(
        data.map(async (q: Question) => {
          try {
            const cRes = await fetch(`http://localhost:8080/questions/${q.id}/choices`)
            if (!cRes.ok) throw new Error()
            const choices = await cRes.json()
            return { ...q, choices: choices ?? [] }
          } catch {
            return { ...q, choices: [] }
          }
        })
      )

      setQuestions(enriched)
    } catch {
      toast.error("เกิดข้อผิดพลาดในการโหลดคำถาม")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    const res = await fetch(`http://localhost:8080/questions/${deleteTarget}`, {
      method: "DELETE",
    })
    if (res.ok) {
      toast.success("ลบคำถามเรียบร้อยแล้ว")
      fetchQuestions()
    } else {
      toast.error("ไม่สามารถลบคำถามได้")
    }
    setDeleteTarget(null)
  }

  const handleSubmit = () => {
    const unanswered = questions.filter((q) => !answers[q.id])
    if (unanswered.length > 0) {
      toast.error("กรุณาตอบคำถามให้ครบทุกข้อ")
      return
    }

    let correct = 0
    for (const q of questions) {
      const selected = q.choices.find((c) => c.choice_text === answers[q.id])
      if (selected?.is_correct) correct++
    }

    alert(`คุณตอบถูก ${correct} ข้อจากทั้งหมด ${questions.length} ข้อ`)
    setAnswers({})
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="bg-emerald-500 text-white flex justify-between items-center px-6 py-4 rounded-t-md">
          <CardTitle className="text-lg sm:text-xl">คำถามทั้งหมด</CardTitle>
          <Link href="/form">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              เพิ่มข้อสอบ
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {isLoading ? (
            <p className="text-center text-muted-foreground">กำลังโหลดคำถาม...</p>
          ) : questions.length === 0 ? (
            <p className="text-center text-muted-foreground">ยังไม่มีคำถาม</p>
          ) : (
            <>
              {questions.map((q, idx) => (
                <div key={q.id} className="border-b pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{idx + 1}. {q.question_text}</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteTarget(q.id)}
                        >
                          ลบ
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>ยืนยันการลบคำถาม</DialogTitle>
                        </DialogHeader>
                        <p>คุณแน่ใจว่าต้องการลบคำถามข้อนี้?</p>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteTarget(null)}>ยกเลิก</Button>
                          <Button variant="destructive" onClick={handleConfirmDelete}>ลบ</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <RadioGroup
                    className="pl-6 space-y-2"
                    value={answers[q.id] || ""}
                    onValueChange={(val) => setAnswers({ ...answers, [q.id]: val })}
                  >
                    {q.choices.length > 0 ? (
                      q.choices.map((c) => (
                        <div key={c.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={c.choice_text} id={`${q.id}-${c.id}`} />
                          <Label htmlFor={`${q.id}-${c.id}`}>{c.choice_text}</Label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground ml-2">ไม่มีตัวเลือก</p>
                    )}
                  </RadioGroup>
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                  ส่งคำตอบ
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
