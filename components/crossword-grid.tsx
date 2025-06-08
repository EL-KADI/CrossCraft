"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"

interface CrosswordGridProps {
  grid: any
  size: number
  userGrid?: string[][]
  onCellInput?: (row: number, col: number, value: string) => void
  selectedCell?: { row: number; col: number } | null
  onCellSelect?: (cell: { row: number; col: number } | null) => void
  completedWords?: Set<number>
  interactive?: boolean
}

export function CrosswordGrid({
  grid,
  size,
  userGrid,
  onCellInput,
  selectedCell,
  onCellSelect,
  completedWords = new Set(),
  interactive = false,
}: CrosswordGridProps) {
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null)
  const cellRefs = useRef<(HTMLInputElement | null)[][]>([])

  useEffect(() => {
    cellRefs.current = Array(size)
      .fill(null)
      .map(() => Array(size).fill(null))
  }, [size])

  const getCellNumber = (row: number, col: number) => {
    if (!grid?.words) return null

    const word = grid.words.find(
      (w: any) =>
        (w.direction === "across" && w.row === row && w.col === col) ||
        (w.direction === "down" && w.row === row && w.col === col),
    )

    return word?.number || null
  }

  const isCellActive = (row: number, col: number) => {
    if (!grid?.words) return false

    return grid.words.some((word: any) => {
      if (word.direction === "across") {
        return word.row === row && col >= word.col && col < word.col + word.answer.length
      } else {
        return word.col === col && row >= word.row && row < word.row + word.answer.length
      }
    })
  }

  const isCellInCompletedWord = (row: number, col: number) => {
    if (!grid?.words) return false

    return grid.words.some((word: any) => {
      if (!completedWords.has(word.number)) return false

      if (word.direction === "across") {
        return word.row === row && col >= word.col && col < word.col + word.answer.length
      } else {
        return word.col === col && row >= word.row && row < word.row + word.answer.length
      }
    })
  }

  const handleCellClick = (row: number, col: number) => {
    if (!interactive || !isCellActive(row, col)) return

    setFocusedCell({ row, col })
    onCellSelect?.({ row, col })

    setTimeout(() => {
      cellRefs.current[row][col]?.focus()
    }, 0)
  }

  const handleCellInput = (row: number, col: number, value: string) => {
    if (!interactive) return

    const letter = value.replace(/[^A-Za-z]/g, "").toUpperCase()
    onCellInput?.(row, col, letter)

    if (letter && letter.length === 1) {
      moveToNextCell(row, col)
    }
  }

  const moveToNextCell = (row: number, col: number) => {
    const nextCol = col + 1
    const nextRow = row + 1

    if (nextCol < size && isCellActive(row, nextCol)) {
      cellRefs.current[row][nextCol]?.focus()
      setFocusedCell({ row, col: nextCol })
    } else if (nextRow < size && isCellActive(nextRow, 0)) {
      cellRefs.current[nextRow][0]?.focus()
      setFocusedCell({ row: nextRow, col: 0 })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (!interactive) return

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault()
        if (row > 0 && isCellActive(row - 1, col)) {
          cellRefs.current[row - 1][col]?.focus()
          setFocusedCell({ row: row - 1, col })
        }
        break
      case "ArrowDown":
        e.preventDefault()
        if (row < size - 1 && isCellActive(row + 1, col)) {
          cellRefs.current[row + 1][col]?.focus()
          setFocusedCell({ row: row + 1, col })
        }
        break
      case "ArrowLeft":
        e.preventDefault()
        if (col > 0 && isCellActive(row, col - 1)) {
          cellRefs.current[row][col - 1]?.focus()
          setFocusedCell({ row, col: col - 1 })
        }
        break
      case "ArrowRight":
        e.preventDefault()
        if (col < size - 1 && isCellActive(row, col + 1)) {
          cellRefs.current[row][col + 1]?.focus()
          setFocusedCell({ row, col: col + 1 })
        }
        break
      case "Backspace":
        if (!userGrid?.[row][col]) {
          e.preventDefault()
          const prevCol = col - 1
          if (prevCol >= 0 && isCellActive(row, prevCol)) {
            cellRefs.current[row][prevCol]?.focus()
            setFocusedCell({ row, col: prevCol })
            onCellInput?.(row, prevCol, "")
          }
        }
        break
    }
  }

  return (
    <div className="inline-block bg-white border-2 border-gray-800 p-2">
      <div
        className="grid gap-0"
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          width: "fit-content",
        }}
      >
        {Array(size)
          .fill(null)
          .map((_, row) =>
            Array(size)
              .fill(null)
              .map((_, col) => {
                const isActive = isCellActive(row, col)
                const cellNumber = getCellNumber(row, col)
                const isCompleted = isCellInCompletedWord(row, col)
                const isSelected = selectedCell?.row === row && selectedCell?.col === col
                const isFocused = focusedCell?.row === row && focusedCell?.col === col

                return (
                  <div
                    key={`${row}-${col}`}
                    className={`
                  relative w-8 h-8 border border-gray-400 flex items-center justify-center text-sm font-bold
                  ${isActive ? "bg-white cursor-pointer" : "bg-gray-800"}
                  ${isCompleted ? "bg-green-100" : ""}
                  ${isSelected ? "ring-2 ring-blue-500" : ""}
                  ${isFocused ? "ring-2 ring-indigo-500" : ""}
                `}
                    onClick={() => handleCellClick(row, col)}
                  >
                    {cellNumber && (
                      <span className="absolute top-0 left-0 text-xs leading-none p-0.5 text-gray-600">
                        {cellNumber}
                      </span>
                    )}
                    {isActive && interactive ? (
                      <input
                        ref={(el) => {
                          if (cellRefs.current[row]) {
                            cellRefs.current[row][col] = el
                          }
                        }}
                        type="text"
                        maxLength={1}
                        value={userGrid?.[row][col] || ""}
                        onChange={(e) => handleCellInput(row, col, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, row, col)}
                        className="w-full h-full text-center border-none outline-none bg-transparent text-gray-900 font-bold"
                        style={{ fontSize: "14px" }}
                      />
                    ) : isActive ? (
                      <span className="text-gray-900">{userGrid?.[row][col] || ""}</span>
                    ) : null}
                  </div>
                )
              }),
          )}
      </div>
    </div>
  )
}
