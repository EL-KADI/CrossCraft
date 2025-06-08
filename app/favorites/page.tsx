"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Play, Download, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const savedFavorites = localStorage.getItem("crosscraft-favorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
    setIsLoaded(true)
  }, [])

  const removeFavorite = (id: string) => {
    const updatedFavorites = favorites.filter((puzzle: any) => puzzle.id !== id)
    setFavorites(updatedFavorites)
    localStorage.setItem("crosscraft-favorites", JSON.stringify(updatedFavorites))

    toast({
      title: "Removed from Favorites",
      description: "Puzzle has been removed from your collection",
    })
  }

  const exportPuzzle = (puzzle: any) => {
    const dataStr = JSON.stringify(puzzle, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${puzzle.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Exported Successfully",
      description: "Puzzle saved as JSON file",
    })
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600">Your saved crossword puzzles</p>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-96 text-gray-500">
              <div className="text-center">
                <Star className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Favorites Yet</h3>
                <p className="mb-4">Create and save your first crossword puzzle</p>
                <Link href="/create">
                  <Button>Create Puzzle</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((puzzle: any, index) => (
              <Card key={puzzle.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-1">{puzzle.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          {puzzle.gridSize}x{puzzle.gridSize}
                        </Badge>
                        <Badge variant="outline">{puzzle.clues.length} clues</Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => removeFavorite(puzzle.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      Created: {new Date(puzzle.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/solve/${puzzle.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <Play className="h-4 w-4 mr-1" />
                          Solve
                        </Button>
                      </Link>
                      <Button onClick={() => exportPuzzle(puzzle)} size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
