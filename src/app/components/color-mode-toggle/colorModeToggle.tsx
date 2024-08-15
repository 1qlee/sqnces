"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

import styles from "./colorModeToggle.module.css";
import * as Toggle from "@radix-ui/react-toggle";
import { Sun, Moon, Dot } from "@phosphor-icons/react";

export default function ColorModeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isLight = resolvedTheme === "dark" || !resolvedTheme || resolvedTheme === "system";

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Toggle.Root
      className={styles.toggle + (className ? ` ${className}` : "")}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {!mounted ? (
        <Dot size={18} />
      ) : (
        <>
          {isLight ? (
            <Moon size={18} />
          ) : (
            <Sun size={18} />
          )}
        </>
      )}
    </Toggle.Root>
  )
}