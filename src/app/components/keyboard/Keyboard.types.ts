export type Status = "misplaced" | "incorrect" | "correct" | "";

export type KeysStatus = Record<string, Status>;

export type Key = 'Q' | 'W' | 'E' | 'R' | 'T' | 'Y' | 'U' | 'I' | 'O' | 'P' | 'A' | 'S' | 'D' | 'F' | 'G' | 'H' | 'J' | 'K' | 'L' | 'Z' | 'X' | 'C' | 'V' | 'B' | 'N' | 'M' | 'Backspace' | 'Enter' | 'Blank' | 'Tab' | 'Escape' | ' ' | '';

export type KeyStyleOrIcon = Record<string, { style: string | undefined; component?: JSX.Element }>;

export type LettersMap = { letter: string, used: boolean }[]