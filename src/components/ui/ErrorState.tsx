import { Button } from './Button';

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="py-10 text-center">
      <p className="text-sm text-maroon-500">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="md" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
