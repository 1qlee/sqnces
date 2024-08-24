import styles from "./Sequence.module.css";

async function getWord() {
  const res = await fetch(
    `https://random-word-api.herokuapp.com/word?length=${Math.floor(Math.random() * 11) + 5}`,
    {
      next: {
        revalidate: 15,
      }
    }
  );
  return res.json();
}

function generateSequence(str: string) {
  const substrings = [];

  // Loop through the string and extract 3-letter substrings
  for (let i = 0; i <= str.length - 3; i++) {
    const substring = str.substring(i, i + 3);

    // Check if the substring contains any spaces
    if (!substring.includes(' ')) {
      substrings.push(substring);
    }
  }

  // Return a random substring from the list, if any are found
  if (substrings.length > 0) {
    const randomIndex = Math.floor(Math.random() * substrings.length);
    return substrings[randomIndex];
  } else {
    return null; // Return null if no valid substrings are found
  }
}

export default async function Sequence() {
  const data = await getWord();
  const sqnce = generateSequence(data[0]);

  return (
    <div className={styles.sequence}>
      <h1>{sqnce}</h1>
    </div>
  )
}