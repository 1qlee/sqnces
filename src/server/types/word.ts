export type Word = {
  data: {
    word: string;
    sequence: {
      string: string;
      index: number;
      letters: string[];
    };
    letters: string[];
    length: number;
  };
  timestamp: number;
};