export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return <p className="py-10 text-center text-sm text-ink-soft dark:text-ink-dark-soft">{message}</p>;
}
