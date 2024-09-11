export type CachedWord = {
  data: {
    word: string;
    sequence: string;
    letters: string[];
    length: number;
  };
  timestamp: number;
};