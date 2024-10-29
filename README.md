**# sqnces**

sqnces is a word puzzle game where you are given a 3-letter sequence and must use it to guess a hidden word. Test your vocabulary, deduction skills, and pattern recognition as you try to identify the hidden word.

---

#### How to Play

1. \***\*Get a Sequence:\*\*** You start with a 3-letter sequence (e.g., `ENT`).
2. \***\*Form Guesses:\*\*** Use the sequence to form guess-words that may match the hidden word. Your guesses must follow these rules:
   - \***\*Include the Sequence:\*\*** Each guess-word must contain the 3-letter sequence in the exact order provided.
   - \***\*Word Length:\*\*** Guesses must be at least 4 letters long and cannot exceed the length of the hidden word.
3. \***\*Feedback on Guesses:\*\*** Each guess will provide clues:
   - \***\*Red Tile:\*\*** The letter does not exist in the hidden word.
   - \***\*Gray Tile:\*\*** The letter exists but is in the wrong position.
   - \***\*Green Tile:\*\*** The letter is in the correct position.
   - \***\*Out-of-Bounds Warning:\*\*** Letters that exceed the length of the hidden word are marked as out-of-bounds.
4. \***\*Guess Until Correct:\*\*** Use feedback from each guess to zero in on the hidden word.

---

#### Example Guesses (non hard mode)

For a 6-letter hidden word:

- **🟥** Letter does not exist in the hidden word.
- **🟨** Letter is in the hidden word but in the wrong position.
- **🟩** Letter is in the correct position.
- **⬜** Letter exceeds the length of the hidden word.

#### Guess Breakdown

**🟥 V ⬛ E ⬛ N ⬛ T**  
_V does not exist in the hidden word, however a letter does exist in that position._

**⬛ E ⬛ N ⬛ T ⬜ E 🟨 R**  
_E and R are in positions where there are no letters - they exceed the length of the hidden word. Also, R exists elsewhere in the hidden word._

**🟥 S 🟨 P ⬛ E ⬛ N ⬛ T**  
_P exists in the hidden word but is in the wrong position._

**🟩 P 🟥 O 🟥 T ⬛ E ⬛ N ⬛ T**  
_P is in the correct position._

**🟩 P 🟩 A 🟩 R 🟩 E 🟩 N 🟩 T**  
_The correct word was **PARENT**!_

---

#### Game Rules and Word List

- Only singular, non-proper nouns are included.
- Simple plurals (adding 'S' or 'ES') are excluded.
- Simple past-tense forms (adding 'D' or 'ED') are excluded.
- Words ending in `ING` only appear in the 6-letter word list.

---

#### Keyboard Shortcuts

- \***\*Backspace:\*\*** Delete the last letter in your current guess.
- \***\*Shift + Backspace:\*\*** Delete the entire guess.
- \***\*Space:\*\*** Add a blank placeholder tile.
- \***\*Enter:\*\*** Submit your guess.
- \***\*Tile Navigation:\*\*** Click any tile in a previous guess to copy it to your current guess. This action also enables edit mode for the selected tile.

---

#### Beta Information

sqnces is currently in beta. If you find any issues or have suggestions, please reach out!
