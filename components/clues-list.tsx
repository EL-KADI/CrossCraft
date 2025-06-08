"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

interface CluesListProps {
  clues: any[]
  grid: any
  selectedCell?: { row: number; col: number } | null
  onClueSelect?: (word: any) => void
  completedWords?: Set<number>
}

export function CluesList({ clues, grid, selectedCell, onClueSelect, completedWords = new Set() }: CluesListProps) {
  const acrossWords = grid?.words?.filter((w: any) => w.direction === "across") || []
  const downWords = grid?.words?.filter((w: any) => w.direction === "down") || []

  const getClueForWord = (word: any) => {
    return clues.find((clue) => clue.answer === word.answer)
  }

  const isWordSelected = (word: any) => {
    if (!selectedCell) return false

    if (word.direction === "across") {
      return (
        word.row === selectedCell.row &&
        selectedCell.col >= word.col &&
        selectedCell.col < word.col + word.answer.length
      )
    } else {
      return (
        word.col === selectedCell.col &&
        selectedCell.row >= word.row &&
        selectedCell.row < word.row + word.answer.length
      )
    }
  }

  const WordList = ({ words, title }: { words: any[]; title: string }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {words.map((word) => {
          const clue = getClueForWord(word)
          const isCompleted = completedWords.has(word.number)
          const isSelected = isWordSelected(word)

          return (
            <div
              key={`${word.direction}-${word.number}`}
              className={`
                p-3 rounded-lg border cursor-pointer transition-colors
                ${isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"}
                ${isCompleted ? "bg-green-50 border-green-200" : ""}
              `}
              onClick={() => onClueSelect?.(word)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {word.number}
                    </Badge>
                    <span className="text-sm font-medium">{word.answer}</span>
                    {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                  <p className="text-sm text-gray-600">{clue?.clue || "No clue available"}</p>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )

  return (
    <div>
      <WordList words={acrossWords} title="Across" />
      <WordList words={downWords} title="Down" />
    </div>
  )
}
