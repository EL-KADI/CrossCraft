"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Puzzle, Star, Download, Printer, Grid3X3, Sparkles } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [favorites, setFavorites] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedFavorites = localStorage.getItem("crosscraft-favorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
    setIsLoaded(true)
  }, [])

  const features = [
    {
      icon: <Puzzle className="h-8 w-8" />,
      title: "Create Custom Puzzles",
      description: "Design your own crossword puzzles with our intuitive clue and answer input system",
    },
    {
      icon: <Grid3X3 className="h-8 w-8" />,
      title: "Smart Grid Generation",
      description: "Advanced algorithm automatically arranges your words into a perfect crossword grid",
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Interactive Solving",
      description: "Solve puzzles with smooth animations, real-time validation, and celebration effects",
    },
    {
      icon: <Download className="h-8 w-8" />,
      title: "Export & Share",
      description: "Save puzzles as PNG images or JSON files for sharing and future editing",
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Favorites System",
      description: "Save your best puzzles and access them quickly from your personal collection",
    },
    {
      icon: <Printer className="h-8 w-8" />,
      title: "Print Ready",
      description: "Generate print-friendly versions of your crosswords for offline solving",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <Puzzle className="h-12 w-12 text-indigo-600 mr-3" />
            <h1 className="text-5xl font-bold text-gray-900">CrossCraft</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create, solve, and share custom crossword puzzles with our powerful and intuitive puzzle creator
          </p>
          <div className="mt-8 space-x-4">
            <Link href="/create">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                Create Puzzle
              </Button>
            </Link>
            <Link href="/favorites">
              <Button size="lg" variant="outline">
                View Favorites
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="text-indigo-600">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoaded && favorites.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Favorites</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.slice(0, 3).map((puzzle: any, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{puzzle.title}</CardTitle>
                      <Badge variant="secondary">
                        {puzzle.gridSize}x{puzzle.gridSize}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{puzzle.clues.length} clues</p>
                    <Link href={`/solve/${puzzle.id}`}>
                      <Button size="sm" className="w-full">
                        Solve Puzzle
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of puzzle creators and start building your first crossword today
          </p>
          <Link href="/create">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Create Your First Puzzle
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
