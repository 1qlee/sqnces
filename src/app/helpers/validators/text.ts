export function validateAlpha(char: string) {
  // if char is not an alpha character
  if (!/^[a-zA-Z]$/.test(char)) {
    return false;
  }

  return true;
}