import * as RadixSelect from '@radix-ui/react-select';
import { CaretDown, CaretUp, Check } from '@phosphor-icons/react';
import styles from "./Select.module.css";

interface Option {
  value: string;
  label: string;
  status?: string;
}

interface SelectProps {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  disabled?: boolean;
  placeholder?: string;
  label?: string;
}

const Select: React.FC<SelectProps> = ({
  defaultValue,
  value,
  onChange,
  options,
  disabled = false,
  placeholder = 'Select an option',
  label = 'Select',
}) => {
  return (
    <RadixSelect.Root defaultValue={defaultValue} value={value} onValueChange={onChange} disabled={disabled}>
      <RadixSelect.Trigger className={styles.trigger} aria-label={label}>
        <RadixSelect.Value style={{ whiteSpace: 'nowrap' }} placeholder={placeholder}>
          {value}
        </RadixSelect.Value>
        <RadixSelect.Icon className={styles.icon}>
          <CaretDown weight="bold" size={14} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          align="center"
          sideOffset={2}
          className={styles.content}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <RadixSelect.ScrollUpButton className={styles.scrollUp}>
            <CaretUp />
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport>
            {options.map((option) => (
              <RadixSelect.Item key={option.value} value={option.value} className={styles.item}>
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <Check />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};

export default Select;
