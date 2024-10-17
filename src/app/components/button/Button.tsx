import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string; // Optional prop for styling
  ariaLabel?: string; // Optional prop for an accessible label
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  onClick,
  disabled = false,
  ariaLabel,
  ...props
}) => {
  return (
    <button
      type="button"
      className={[
        styles.button,
        className,
      ].filter(Boolean).join(' ')} // Filter out any falsey values} // Apply class based on variant
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel} // Provide an accessible label if passed
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
