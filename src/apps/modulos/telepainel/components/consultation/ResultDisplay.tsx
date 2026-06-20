import { MonospaceResultDisplay } from "./MonospaceResultDisplay";

interface ResultDisplayProps {
  result: any;
  className?: string;
  showCopyButton?: boolean;
}

export function ResultDisplay({ result, className, showCopyButton = true }: ResultDisplayProps) {
  return (
    <MonospaceResultDisplay 
      result={result} 
      className={className} 
      showCopyButton={showCopyButton} 
    />
  );
}
