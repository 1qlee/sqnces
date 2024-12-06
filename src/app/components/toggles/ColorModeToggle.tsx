"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import flexStyles from "../styles/Flex.module.css";

import Toggle from "../toggle/Toggle";

export default function ColorModeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isLight = resolvedTheme === "dark" || !resolvedTheme || resolvedTheme === "system";

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Toggle
      className={className ? ` ${className}` : ""}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <div className={flexStyles.flexCentered}>
        {!mounted ? (
          <span>-</span>
        ) : (
          <>
            {isLight ? (
              <span>Dark</span>
            ) : (
              <span>Light</span>
            )}
          </>
        )}
      </div>
    </Toggle>
  )
}