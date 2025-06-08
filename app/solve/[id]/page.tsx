"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CrosswordGrid } from "@/components/crossword-grid"
import { CluesList } from "@/components/clues-list"

export default function SolvePage() {
  const params = useParams()
  const [puzzle, setPuzzle] = useState(null)
  const [userGrid, setUserGrid] = useState(null)
  const [selectedCell, setSelectedCell] = useState(null)
  const [selectedDirection, setSelectedDirection] = useState("across")
  const [completedWords, setCompletedWords] = useState(new Set())
  const [isComplete, setIsComplete] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("crosscraft-favorites") || "[]")
    const foundPuzzle = favorites.find((p: any) => p.id === params.id)

    if (foundPuzzle) {
      setPuzzle(foundPuzzle)
      initializeUserGrid(foundPuzzle.grid, foundPuzzle.gridSize)
    }
  }, [params.id])

  const initializeUserGrid = (grid: any, size: number) => {
    const newUserGrid = Array(size)
      .fill(null)
      .map(() => Array(size).fill(""))
    setUserGrid(newUserGrid)
  }

  const handleCellInput = (row: number, col: number, value: string) => {
    if (!userGrid || !puzzle) return

    const newGrid = [...userGrid]
    newGrid[row][col] = value.toUpperCase()
    setUserGrid(newGrid)

    checkWordCompletion(newGrid)
  }

  const checkWordCompletion = (grid: any) => {
    if (!puzzle) return

    const newCompletedWords = new Set()
    let totalCorrect = 0
    let totalCells = 0

    puzzle.grid.words.forEach((word: any) => {
      let isComplete = true
      let correctLetters = 0

      for (let i = 0; i < word.answer.length; i++) {
        const row = word.direction === "across" ? word.row : word.row + i
        const col = word.direction === "across" ? word.col + i : word.col

        totalCells++

        if (grid[row][col] === word.answer[i]) {
          correctLetters++
          totalCorrect++
        } else {
          isComplete = false
        }
      }

      if (isComplete) {
        newCompletedWords.add(word.number)
        if (!completedWords.has(word.number)) {
          triggerWordCompleteAnimation(word)
        }
      }
    })

    setCompletedWords(newCompletedWords)

    if (totalCorrect === totalCells && totalCells > 0) {
      setIsComplete(true)
      triggerPuzzleCompleteAnimation()
    }
  }

  const triggerWordCompleteAnimation = (word: any) => {
    toast({
      title: "Word Complete!",
      description: `${word.answer} - ${word.clue}`,
    })
  }

  const triggerPuzzleCompleteAnimation = () => {
    toast({
      title: "Puzzle Complete!",
      description: "Congratulations! You've solved the entire crossword!",
    })
  }

  const resetPuzzle = () => {
    if (puzzle) {
      initializeUserGrid(puzzle.grid, puzzle.gridSize)
      setCompletedWords(new Set())
      setIsComplete(false)
      toast({
        title: "Puzzle Reset",
        description: "Grid cleared and ready to solve again",
      })
    }
  }

  const checkSolution = () => {
    if (!puzzle || !userGrid) return

    let correct = 0
    let total = 0

    puzzle.grid.words.forEach((word: any) => {
      for (let i = 0; i < word.answer.length; i++) {
        const row = word.direction === "across" ? word.row : word.row + i
        const col = word.direction === "across" ? word.col + i : word.col

        total++
        if (userGrid[row][col] === word.answer[i]) {
          correct++
        }
      }
    })

    const percentage = Math.round((correct / total) * 100)
    toast({
      title: "Solution Check",
      description: `${correct}/${total} letters correct (${percentage}%)`,
    })
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading puzzle...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{puzzle.title}</h1>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary">
                  {puzzle.gridSize}x{puzzle.gridSize}
                </Badge>
                <Badge variant="outline">{puzzle.clues.length} clues</Badge>
                {isComplete && (
                  <Badge className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={checkSolution} variant="outline">
                <CheckCircle className="h-4 w-4 mr-1" />
                Check
              </Button>
              <Button onClick={resetPuzzle} variant="outline">
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Crossword Grid</CardTitle>
              </CardHeader>
              <CardContent>
                <CrosswordGrid
                  grid={puzzle.grid}
                  size={puzzle.gridSize}
                  userGrid={userGrid}
                  onCellInput={handleCellInput}
                  selectedCell={selectedCell}
                  onCellSelect={setSelectedCell}
                  completedWords={completedWords}
                  interactive={true}
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <CluesList
              clues={puzzle.clues}
              grid={puzzle.grid}
              selectedCell={selectedCell}
              onClueSelect={(word) => {
                setSelectedCell({ row: word.row, col: word.col })
                setSelectedDirection(word.direction)
              }}
              completedWords={completedWords}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
