"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function FormPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    question: "",
    answers: ["", "", "", ""],
    correctIndex: 0
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const { name, value } = e.target
    if (name === "question") {
      setFormData((prev) => ({ ...prev, question: value }))
    } else if (typeof index === "number") {
      const updated = [...formData.answers]
      updated[index] = value
      setFormData((prev) => ({ ...prev, answers: updated }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { question, answers, correctIndex } = formData
    if (!question || answers.some((a) => !a)) {
      toast.error("กรุณากรอกคำถามและคำตอบให้ครบ")
      return
    }

    try {
      const qRes = await fetch("http://localhost:8080/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_text: question })
      })
      const qData = await qRes.json()
      const question_id = qData.question_id

      for (let i = 0; i < answers.length; i++) {
        await fetch(`http://localhost:8080/questions/${question_id}/choices`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            choice_text: answers[i],
            is_correct: i === correctIndex
          })
        })
      }

      toast.success("เพิ่มคำถามและคำตอบเรียบร้อยแล้ว")
      setFormData({ question: "", answers: ["", "", "", ""], correctIndex: 0 })
      router.push("/quiz") 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด")
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="bg-emerald-500 text-white">
          <CardTitle className="text-xl">เพิ่มคำถาม</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="question">คำถาม</Label>
              <Input id="question" name="question" value={formData.question} onChange={handleChange} />
              {formData.answers.map((ans, idx) => (
                <div key={idx}>
                  <Label htmlFor={`answer${idx}`}>คำตอบ {idx + 1}</Label>
                  <Input
                    id={`answer${idx}`}
                    name={`answer${idx}`}
                    value={ans}
                    onChange={(e) => handleChange(e, idx)}
                  />
                </div>
              ))}

              <div>
                <Label htmlFor="correct">เฉลย</Label>
                <select
                  id="correct"
                  value={formData.correctIndex}
                  onChange={(e) => setFormData((prev) => ({ ...prev, correctIndex: parseInt(e.target.value) }))}
                  className="border rounded px-2 py-1"
                >
                  {[0, 1, 2, 3].map((i) => (
                    <option key={i} value={i}>ข้อ {i + 1}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="submit">บันทึก</Button>
              <Button type="button" variant="destructive" onClick={() => router.push("/quiz")}>
                ยกเลิก
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}