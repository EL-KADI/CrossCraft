"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Grid3X3, Save, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CrosswordGrid } from "@/components/crossword-grid"
import { generateCrosswordGrid } from "@/lib/crossword-generator"

interface ClueAnswer {
  id: string
  clue: string
  answer: string
  error?: string
}

export default function CreatePage() {
  const [clues, setClues] = useState<ClueAnswer[]>([{ id: "1", clue: "", answer: "" }])
  const [gridSize, setGridSize] = useState(15)
  const [puzzleTitle, setPuzzleTitle] = useState("")
  const [generatedGrid, setGeneratedGrid] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const addClue = () => {
    const newId = (clues.length + 1).toString()
    setClues([...clues, { id: newId, clue: "", answer: "" }])
  }

  const removeClue = (id: string) => {
    if (clues.length > 1) {
      setClues(clues.filter((clue) => clue.id !== id))
    }
  }

  const updateClue = (id: string, field: "clue" | "answer", value: string) => {
    setClues(
      clues.map((clue) => {
        if (clue.id === id) {
          const updated = { ...clue, [field]: value }
          if (field === "answer") {
            updated.answer = value.toUpperCase().replace(/[^A-Z]/g, "")
            updated.error = updated.answer.length < 2 ? "Answer must be at least 2 letters" : ""
          } else {
            updated.error = value.trim() === "" ? "Clue cannot be empty" : ""
          }
          return updated
        }
        return clue
      }),
    )
  }

  const validateClues = () => {
    const validClues = clues.filter(
      (clue) => clue.clue.trim() !== "" && clue.answer.length >= 2 && /^[A-Z]+$/.test(clue.answer),
    )
    return validClues.length >= 2
  }

  const generateGrid = async () => {
    if (!validateClues()) {
      toast({
        title: "Invalid Input",
        description: "Please provide at least 2 valid clue-answer pairs",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    setTimeout(() => {
      const validClues = clues.filter((clue) => clue.clue.trim() !== "" && clue.answer.length >= 2)

      const grid = generateCrosswordGrid(validClues, gridSize)
      setGeneratedGrid(grid)
      setIsGenerating(false)

      toast({
        title: "Grid Generated!",
        description: `Successfully created a ${gridSize}x${gridSize} crossword grid`,
      })
    }, 1500)
  }

  const savePuzzle = () => {
    if (!generatedGrid || !puzzleTitle.trim()) {
      toast({
        title: "Cannot Save",
        description: "Please provide a title and generate a grid first",
        variant: "destructive",
      })
      return
    }

    const puzzle = {
      id: Date.now().toString(),
      title: puzzleTitle,
      clues: clues.filter((clue) => clue.clue.trim() !== "" && clue.answer.length >= 2),
      grid: generatedGrid,
      gridSize,
      createdAt: new Date().toISOString(),
    }

    const favorites = JSON.parse(localStorage.getItem("crosscraft-favorites") || "[]")
    favorites.push(puzzle)
    localStorage.setItem("crosscraft-favorites", JSON.stringify(favorites))

    toast({
      title: "Puzzle Saved!",
      description: "Your puzzle has been added to favorites",
    })
  }

  const exportAsJSON = () => {
    if (!generatedGrid) {
      toast({
        title: "No Grid to Export",
        description: "Please generate a grid first",
        variant: "destructive",
      })
      return
    }

    const puzzle = {
      title: puzzleTitle || "Untitled Puzzle",
      clues: clues.filter((clue) => clue.clue.trim() !== "" && clue.answer.length >= 2),
      grid: generatedGrid,
      gridSize,
      exportedAt: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(puzzle, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${puzzleTitle || "crossword"}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Exported Successfully",
      description: "Puzzle saved as JSON file",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Crossword Puzzle</h1>
          <p className="text-gray-600">Design your custom crossword puzzle with clues and answers</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Puzzle Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Puzzle Title</Label>
                  <Input
                    id="title"
                    value={puzzleTitle}
                    onChange={(e) => setPuzzleTitle(e.target.value)}
                    placeholder="Enter puzzle title"
                  />
                </div>
                <div>
                  <Label htmlFor="gridSize">Grid Size</Label>
                  <Select value={gridSize.toString()} onValueChange={(value) => setGridSize(Number.parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10x10</SelectItem>
                      <SelectItem value="15">15x15</SelectItem>
                      <SelectItem value="20">20x20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Clues & Answers</CardTitle>
                  <Button onClick={addClue} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Clue
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {clues.map((clue, index) => (
                  <div key={clue.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{index + 1}</Badge>
                      {clues.length > 1 && (
                        <Button onClick={() => removeClue(clue.id)} size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <Label>Clue</Label>
                      <Textarea
                        value={clue.clue}
                        onChange={(e) => updateClue(clue.id, "clue", e.target.value)}
                        placeholder="Enter your clue"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Answer</Label>
                      <Input
                        value={clue.answer}
                        onChange={(e) => updateClue(clue.id, "answer", e.target.value)}
                        placeholder="ANSWER"
                        className={clue.error ? "border-red-500" : ""}
                      />
                      {clue.error && <p className="text-sm text-red-500 mt-1">{clue.error}</p>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Button onClick={generateGrid} disabled={isGenerating || !validateClues()} className="flex-1">
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Generate Grid
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {generatedGrid ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Grid</CardTitle>
                    <div className="flex space-x-2">
                      <Button onClick={savePuzzle} size="sm">
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button onClick={exportAsJSON} size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        JSON
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CrosswordGrid grid={generatedGrid} size={gridSize} interactive={false} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96 text-gray-500">
                  <div className="text-center">
                    <Grid3X3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Generate a grid to see your crossword puzzle</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
