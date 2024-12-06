import type { Dispatch } from "react";

export type GameAction = 
  | { type: "editKey"; toggled?: boolean; key: number; }
  | { type: "loading"; loading: boolean; };

export type GameContextState = {
  editing: {
    toggled: boolean;
    key: number;
  },
  loading: boolean;
}

export type GameContextDispatch = Dispatch<GameAction>;