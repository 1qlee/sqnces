import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "@phosphor-icons/react";
import styles from "./Checkbox.module.css";
import type { Dispatch, SetStateAction } from "react";

type CheckboxProps = {
  checked: boolean | "indeterminate";
  text: string;
  setChecked: Dispatch<SetStateAction<boolean | "indeterminate">>
}

export default function CheckboxComponent({ text, checked, setChecked }: CheckboxProps) {
  return (
    <div className={styles.wrapper}>
      <Checkbox.Root 
        className={styles.checkbox} 
        defaultChecked 
        id="c1"
        checked={checked}
        onCheckedChange={(checked) => setChecked(checked)}
      >
        <Checkbox.Indicator>
          <Check 
            size={12}
            weight="bold"
            color="var(--foreground)"
          />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label className={styles.label} htmlFor="c1">
        {text}
      </label>
    </div>
  )
}