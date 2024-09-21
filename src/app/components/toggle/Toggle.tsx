import * as RadixToggle from "@radix-ui/react-toggle";
import styles from "./Toggle.module.css";

type ToggleProps = {
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
}

export default function Toggle({ 
  children, 
  className,
  onClick,
}: ToggleProps) {
  return (
    <RadixToggle.Root
      className={styles.toggle + (className ? ` ${className}` : '')}
      onClick={onClick}
    >
      {children}
    </RadixToggle.Root>
  )
}