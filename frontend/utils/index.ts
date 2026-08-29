export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function uid() {
  return Math.random().toString(36).slice(2);
}
