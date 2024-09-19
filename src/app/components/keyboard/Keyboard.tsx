"use client"

import "~/styles/toast.css";
import styles from "./Keyboard.module.css";
import toast from "react-hot-toast";
import type { Status, KeysStatus, Key, KeyStyleOrIcon, LettersMap } from "../keyboard/Keyboard.types";
import { X, Check, Swap, KeyReturn, Square } from "@phosphor-icons/react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { type LetterData, type GameState, type SplitWordLetter } from "../game/Game.types";
import type { Guess, GuessData } from "../guess-area/Guess.types";
import type { Word } from "~/server/types/word";
import { useRef } from "react";
import { validateGuess } from "~/app/actions/validateGuess";


const KeyboardRows: Key[][] = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ''],
  ['', '', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace', '']
]

interface KeyboardProps {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  guess: Guess;
  setGuess: Dispatch<SetStateAction<{
    string: string;
    letters: Key[];
  }>>;
  wordData: Word;
}

export default function Keyboard({ 
  gameState,
  guess,
  setGameState,
  setGuess,
  wordData,
}: KeyboardProps) {
  const { data } = wordData;
  const isGameOver = gameState.status === "won" || gameState.status === "lost";
  const [keysStatus, setKeysStatus] = useState<KeysStatus>({
    [String(data.sequence.letters[0])]: "",
    [String(data.sequence.letters[1])]: "",
    [String(data.sequence.letters[2])]: "",
  });
  const [loading, setLoading] = useState(false);
  const [activeKeys, setActiveKeys] = useState<Key[]>([]);
  const guessRef = useRef(guess); // Create a ref to store the guess value
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  function handleKeyInput(key: Key) {
    const capitalizedKey = key !== "Blank" ? key.toUpperCase() as Key : key;

    if (validateAlpha(key)) {
      if (gameState.editing.toggled) {
        setGuess(prev => ({
          string: prev.string.slice(0, gameState.editing.key) + capitalizedKey + prev.string.slice(gameState.editing.key + 1),
          letters: prev.letters.map((letter, i) => (i === gameState.editing.key ? capitalizedKey : letter)),
        }));
        setGameState({
          ...gameState,
          editing: {
            toggled: false,
            key: 0,
          }
        });
      }
      else if (guessRef.current.letters.includes("Blank") && guessRef.current.letters.length === wordData.data.length) {
        const newString = guessRef.current.string.replace(" ", capitalizedKey);
        const blankIndex = guessRef.current.letters.indexOf("Blank");
        const newLetters = [
          ...guessRef.current.letters.slice(0, blankIndex),
          capitalizedKey,
          ...guessRef.current.letters.slice(blankIndex + 1),
        ]

        setGuess({
          string: newString,
          letters: newLetters,
        });
      }
      else {
        if (guessRef.current.letters.length < wordData.data.length) {
          setGuess(prev => ({
            string: prev.string + key.toUpperCase(),
            letters: [...prev.letters, capitalizedKey],
          }));
        }
      }
    }
    else if (key === ' ' || key === "Blank") {
      if (gameState.editing.toggled) {
        setGuess(prev => ({
          string: prev.string.slice(0, gameState.editing.key) + " " + prev.string.slice(gameState.editing.key + 1),
          letters: prev.letters.map((letter, i) => (i === gameState.editing.key ? "Blank" : letter)),
        }));
        setGameState({
          ...gameState,
          editing: {
            toggled: false,
            key: 0,
          }
        });
      }
      else {
        if (guessRef.current.letters.length < wordData.data.length) {
          setGuess(prev => ({
            string: prev.string + " ",
            letters: [...prev.letters, "Blank"],
          }));
        }
      }
    }
  }

  function handleBackspace(event: KeyboardEvent | React.PointerEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) {
    const modifierPressed = event.shiftKey || event.ctrlKey || event.metaKey;

    if (gameState.editing.toggled) {
      setGuess(prev => ({
        string: prev.string.slice(0, gameState.editing.key) + prev.string.slice(gameState.editing.key + 1),
        letters: prev.letters.filter((_, i) => i !== gameState.editing.key),
      }));
      setGameState({
        ...gameState,
        editing: {
          toggled: false,
          key: 0,
        }
      });
    }
    else if (modifierPressed) {
      setGuess({
        string: "",
        letters: [],
      });
    } else {
      deleteChar();
    }
  }

  // Sync the ref with the state whenever it updates
  useEffect(() => {
    guessRef.current = guess;
  }, [guess]);

  useEffect(() => {
    function handleKeyTyping(event: KeyboardEvent) {
      if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
        return;
      }

      if (!loading) {
        const specialKeys = ['Backspace', 'Enter', 'Tab', 'Escape'];
        const key = specialKeys.includes(event.key) ? event.key as Key : event.key.toUpperCase() as Key;
        updateActiveKeys(key);

        if (key === 'Backspace') {
          handleBackspace(event);
        } 
        else if (key === 'Escape') {
          setGameState({
            ...gameState,
            editing: {
              toggled: false,
              key: 0,
            }
          })
        }
        else if (key !== 'Tab' && key !== 'Enter') {
          handleKeyInput(key);
        }
        else if (key === 'Enter') {
          void handleGuessSubmit();
        } 
        else {
          event.preventDefault();
        }
      }
    }

    if (!isGameOver) {
      document.addEventListener('keydown', handleKeyTyping);
      document.addEventListener('keyup', () => setActiveKeys([]));
    }

    return () => {
      document.removeEventListener('keydown', handleKeyTyping);
      document.removeEventListener('keyup', () => setActiveKeys([]));
    }
  }, [loading, gameState.status, gameState.editing])
  
  // ***** HELPERS ***** //\
  function validateAlpha(char: string) {
    // if char is not an alpha character
    if (!/^[a-zA-Z]$/.test(char)) {
      return false;
    }

    return true;
  }

  function isKeyActive(key: Key) {
    if (key.length > 0) {
      return activeKeys.includes(key);
    }
  };

  function getKeyStyleOrIcon(
    status: Status | "" = "",
    type: "style" | "icon",
  ) {
    const keyStyleOrIcon: KeyStyleOrIcon = {
      "": { style: "" },
      correct: { style: styles.isCorrect, component: <Check size={12} weight="bold" /> },
      incorrect: { style: styles.isIncorrect, component: <X size={12} weight="bold" /> },
      misplaced: { style: styles.isMisplaced, component: <Swap size={12} weight="bold" /> },
    };

    const result = keyStyleOrIcon[status];

    if (result) {
      return type === "style" ? result.style : result.component;
    }

    return "";
  }

  function clearTimers() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    if (repeatInterval.current) {
      clearInterval(repeatInterval.current);
    }
  }

  function deleteChar() {
    setGuess(prev => ({
      string: prev.string.slice(0, -1),
      letters: prev.letters.slice(0, -1),
    }));
  }

  function updateActiveKeys(key: Key) {
    setActiveKeys(prev => [...prev, key]);
  }

  function createValidationMap(guessedWord: string) {
    const { word, sequence, letters } = data;
    const lettersMap: LettersMap = letters.map((letter) => ({ letter, used: false }));
    const splitWord: SplitWordLetter[] = [];
    const validationMap: LetterData[] = []; // returned variable
    const keys: KeysStatus = {};
    // guess variables
    const guessLength = guessedWord.length; // length of the guess
    const charsBefore = guessedWord.indexOf(sequence.string); // number of characters before the sequence begins 
    const charsAfter = guessLength - charsBefore - 3; // number of characters after the sequence ends 
    // word variables
    const wordLength = word.length; // length of the word 
    const startIndex = sequence.index - charsBefore; // can be a negative number 
    const endIndex = sequence.index + 3 + charsAfter;

    // we need to generate an array of letters that compares respectively to the letters in guess
    for (let n = startIndex; n < endIndex; n++) {
      // if the index is out of bounds (aka the guess has more characters on either side of the sequence than the word)
      if (n < 0 || n > wordLength) {
        splitWord.push({ letter: "", sequence: false, index: n, });
     }
      // mark the sequence letters
      else if (n >= sequence.index && n < sequence.index + 3) {
        splitWord.push({ letter: word.charAt(n), sequence: true, index: n });
      }
      else {
        splitWord.push({ letter: word.charAt(n), sequence: false, index: n });
      }
    }

    // pass through the guess once first to check for correct letters
    for (let i = 0; i < guessLength; i++) {
      const letterGuessed = guessedWord.charAt(i);
      const letterToCompare = splitWord[i] ?? { letter: "", sequence: false, index: i };

      if (letterToCompare.letter === letterGuessed && !letterToCompare.sequence) {
        lettersMap[letterToCompare.index] = {
          letter: letterGuessed,
          used: true,
        };
        keys[letterGuessed] = "correct";
        validationMap[i] = { letter: letterGuessed, type: "correct", sequence: false };
      }
    }

    // compare the guess to the split word (the word that accurately corresponds to the same letter positions as the guess)
    for (let i = 0; i < guessLength; i++) {
      const letterGuessed = guessedWord.charAt(i);
      const letterToCompare = splitWord[i]!.letter;
      const letterIsSequence = splitWord[i]!.sequence;
      // check to see if the guessed letter is already marked as correct
      const correctLetterExists = validationMap.length > 0 && validationMap.find(l => l?.letter === letterGuessed && l.type === "correct");
      const misplacedLetterExists = lettersMap.find(l => l.letter === letterGuessed && !l.used);

      // never override an existing letter
      if (validationMap[i]) continue;

      if (letterIsSequence) {
        validationMap[i] = { letter: letterGuessed, type: "sequence", sequence: true };
      }
      else if (letterToCompare === "") {
        validationMap[i] = { letter: letterGuessed, type: "empty", sequence: false };
      }
      else if (misplacedLetterExists) {
        if (!correctLetterExists) {
          keys[letterGuessed] = "misplaced";
        };

        validationMap[i] = { letter: letterGuessed, type: "misplaced", sequence: false };
        misplacedLetterExists.used = true;
      }
      else {
        if (!correctLetterExists) {
          keys[letterGuessed] = "incorrect";
        };

        validationMap[i] = { letter: letterGuessed, type: "incorrect", sequence: false };
      }
    }

    setKeysStatus(prev => ({ ...prev, ...keys }));

    return validationMap
  }

  async function handleGuessSubmit() {
    const guessedWord = guessRef.current.string;

    if (gameState.editing.toggled) {
      return setGameState({
        ...gameState,
        editing: {
          toggled: false,
          key: 0,
        }
      });
    }

    if (guessRef.current.letters.includes("Blank")) {
      toast.dismiss();
      return toast.error("Remove blank tiles.");
    }

    if (guessedWord.length < 4) {
      toast.dismiss();
      return toast.error("Minimum 4-letter word.");
    }

    // if the guess doesn't include the sequence
    if (!guessedWord.includes(wordData.data.sequence.string)) {
      toast.dismiss();
      toast.error("Word must include the sequence");
    }
    else {
      setLoading(true);
      // check if guess is a valid word
      const validateData = await validateGuess(guessedWord);
      const newGuessIndex = gameState.currentGuessIndex + 1

      if (validateData.isValid) {
        const newGuess: GuessData = {
          number: newGuessIndex,
          validationMap: createValidationMap(guessedWord),
          word: guessedWord,
          length: guessedWord.length,
        }

        setGameState({
          ...gameState,
          guesses: [
            ...gameState?.guesses,
            newGuess,
          ],
          currentGuessIndex: newGuessIndex,
        })
        setGuess({
          string: "",
          letters: [],
        });
        return setLoading(false);;
      }
      else {
        setLoading(false);
        toast.dismiss();
        return toast.error("Invalid word");
      }
    }
  }

  // ***** EVENT HANDLERS ***** //
  function handleKeyPress(event: React.PointerEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>, key: Key) {
    if ("pointerType" in event && event.button !== 0) {
      return 
    }

    if (!loading && !isGameOver) {
      event.preventDefault();
      updateActiveKeys(key);

      // deleting
      if (key === 'Backspace') {

        // check for non-keyboard event
        if (!('key' in event)) {
          // detect long press
          longPressTimer.current = setTimeout(() => {
            repeatInterval.current = setInterval(() => {
              deleteChar();
            }, 100);
          }, 500);

          handleBackspace(event);
        }
        else {
          console.log("GISOY")
          handleBackspace(event);
        }
      }
      // submitting
      else if (key === 'Enter') {
        void handleGuessSubmit();
      }
      // inputting
      else {
        handleKeyInput(key)
      }
    }
  }

  // when keys are focused, we need to handle inputting keys via the "Enter" key
  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, key: Key) {
    event.currentTarget.focus();
    const char = event.key;

    if (char === "Enter") {
      handleKeyPress(event, key)
    }
  }

  // handles both keyup and mouseup events
  function handleKeyUp(key: string) {
    clearTimers()
    setActiveKeys(prev => prev.filter(k => k !== key));
  }

  function handlePointerLeave() {
    clearTimers()

    if (activeKeys.length > 0) {
      setActiveKeys([]);
    }
  }

  // handle long press
  function handleContextMenu(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, key: string) {
    event.preventDefault();
    return false;
  }

  return (
    <div 
      className={styles.keyboard}
    >
      {KeyboardRows.map((row, i) => (
        <div 
          className={styles.row}
          key={i}
        >
          {row.map((key, index) => (
            <button
              key={key + index}
              disabled={loading}
              className={[
                key.length > 0 ? styles.key : styles.keySpacer,
                isKeyActive(key) ? styles.active : "",
                key === "Backspace" ? styles.largeKey : "",
                getKeyStyleOrIcon(keysStatus[key], "style"),
                data.sequence.letters.includes(key) ? styles.isSequence : "",
              ].filter(Boolean).join(" ")}
              {...(!isGameOver && { 
                onPointerDown: (event) => handleKeyPress(event, key),
                onPointerUp: () => handleKeyUp(key),
                onPointerLeave: handlePointerLeave,
                onKeyDown: (event) => handleKeyDown(event, key),
                onKeyUp: () => handleKeyUp(key),
                onContextMenu: (event) => handleContextMenu(event, key),
              })}
            >
              {key === "Backspace" ? "⌫" : key.toUpperCase()}
              <span className={styles.icon}>{getKeyStyleOrIcon(keysStatus[key], "icon")}</span>
            </button>
          ))}
        </div>
      ))}
      <div
        className={styles.buttonWrapper}
      >
        <button
          disabled={loading}
          className={[
            isKeyActive("Blank") ? styles.active : "",
            styles.button,
          ].filter(Boolean).join(" ")}
          {...(!isGameOver && {
            onPointerDown: (event) => handleKeyPress(event, "Blank"),
            onPointerUp: () => handleKeyUp("Blank"),
            onPointerLeave: handlePointerLeave,
            onKeyDown: (event) => handleKeyDown(event, "Blank"),
            onKeyUp: () => handleKeyUp("Blank"),
            onContextMenu: (event) => handleContextMenu(event, "Blank"),
          })}
        >
          <span>Space</span>
          <Square size={18} />
        </button>
        <button
          disabled={loading}
          className={[
            isKeyActive("Enter") ? styles.active : "",
            styles.button,
          ].filter(Boolean).join(" ")}
          {...(!isGameOver && {
            onPointerDown: (event) => handleKeyPress(event, "Enter"),
            onPointerUp: () => handleKeyUp("Enter"),
            onPointerLeave: handlePointerLeave,
            onKeyDown: (event) => handleKeyDown(event, "Enter"),
            onKeyUp: () => handleKeyUp("Enter"),
            onContextMenu: (event) => handleContextMenu(event, "Enter"),
          })}
        >
          <span>Enter</span>
          <KeyReturn size={18} />
        </button>
      </div>
    </div>
  )
}