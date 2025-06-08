interface ClueAnswer {
  id: string
  clue: string
  answer: string
}

interface WordPlacement {
  answer: string
  clue: string
  row: number
  col: number
  direction: "across" | "down"
  number: number
}

interface CrosswordGrid {
  words: WordPlacement[]
  grid: string[][]
}

export function generateCrosswordGrid(clues: ClueAnswer[], size: number): CrosswordGrid {
  const words: WordPlacement[] = []
  const grid: string[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(""))

  const validClues = clues.filter((clue) => clue.answer.length >= 2 && clue.answer.length <= size - 2)

  if (validClues.length === 0) {
    return { words: [], grid }
  }

  validClues.sort((a, b) => b.answer.length - a.answer.length)

  let wordNumber = 1

  const firstWord = validClues[0]
  const startRow = Math.floor(size / 2)
  const startCol = Math.floor((size - firstWord.answer.length) / 2)

  words.push({
    answer: firstWord.answer,
    clue: firstWord.clue,
    row: startRow,
    col: startCol,
    direction: "across",
    number: wordNumber++,
  })

  placeWordInGrid(grid, firstWord.answer, startRow, startCol, "across")

  for (let i = 1; i < validClues.length && words.length < 10; i++) {
    const currentClue = validClues[i]
    const placement = findBestPlacement(grid, currentClue.answer, words, size)

    if (placement) {
      words.push({
        answer: currentClue.answer,
        clue: currentClue.clue,
        row: placement.row,
        col: placement.col,
        direction: placement.direction,
        number: wordNumber++,
      })

      placeWordInGrid(grid, currentClue.answer, placement.row, placement.col, placement.direction)
    }
  }

  return { words, grid }
}

function findBestPlacement(
  grid: string[][],
  word: string,
  existingWords: WordPlacement[],
  size: number,
): { row: number; col: number; direction: "across" | "down" } | null {
  const possiblePlacements = []

  for (const existingWord of existingWords) {
    for (let i = 0; i < existingWord.answer.length; i++) {
      for (let j = 0; j < word.length; j++) {
        if (existingWord.answer[i] === word[j]) {
          if (existingWord.direction === "across") {
            const newRow = existingWord.row - j
            const newCol = existingWord.col + i

            if (canPlaceWord(grid, word, newRow, newCol, "down", size)) {
              possiblePlacements.push({
                row: newRow,
                col: newCol,
                direction: "down" as const,
                intersections: 1,
              })
            }
          } else {
            const newRow = existingWord.row + i
            const newCol = existingWord.col - j

            if (canPlaceWord(grid, word, newRow, newCol, "across", size)) {
              possiblePlacements.push({
                row: newRow,
                col: newCol,
                direction: "across" as const,
                intersections: 1,
              })
            }
          }
        }
      }
    }
  }

  if (possiblePlacements.length === 0) {
    for (let attempts = 0; attempts < 50; attempts++) {
      const direction = Math.random() < 0.5 ? "across" : "down"
      const row = Math.floor(Math.random() * (size - (direction === "down" ? word.length : 1)))
      const col = Math.floor(Math.random() * (size - (direction === "across" ? word.length : 1)))

      if (canPlaceWord(grid, word, row, col, direction, size)) {
        return { row, col, direction }
      }
    }
    return null
  }

  possiblePlacements.sort((a, b) => b.intersections - a.intersections)
  return possiblePlacements[0]
}

function canPlaceWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: "across" | "down",
  size: number,
): boolean {
  if (direction === "across") {
    if (col + word.length > size) return false

    for (let i = 0; i < word.length; i++) {
      const currentCell = grid[row][col + i]
      if (currentCell !== "" && currentCell !== word[i]) {
        return false
      }
    }

    if (col > 0 && grid[row][col - 1] !== "") return false
    if (col + word.length < size && grid[row][col + word.length] !== "") return false
  } else {
    if (row + word.length > size) return false

    for (let i = 0; i < word.length; i++) {
      const currentCell = grid[row + i][col]
      if (currentCell !== "" && currentCell !== word[i]) {
        return false
      }
    }

    if (row > 0 && grid[row - 1][col] !== "") return false
    if (row + word.length < size && grid[row + word.length][col] !== "") return false
  }

  return true
}

function placeWordInGrid(grid: string[][], word: string, row: number, col: number, direction: "across" | "down"): void {
  for (let i = 0; i < word.length; i++) {
    if (direction === "across") {
      grid[row][col + i] = word[i]
    } else {
      grid[row + i][col] = word[i]
    }
  }
}
