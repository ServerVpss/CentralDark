import { useState, useEffect, useCallback } from "react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { validateQueryInput, formatForDisplay, getPlaceholder } from "@/shared/lib/queryValidation";
import { CheckCircle2, XCircle } from "lucide-react";

interface QueryInputProps {
  queryType: string;
  value: string;
  onChange: (value: string, cleanValue: string, isValid: boolean) => void;
  onSubmit?: () => void;
  disabled?: boolean;
}

export function QueryInput({ queryType, value, onChange, onSubmit, disabled }: QueryInputProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    error?: string;
  }>({ isValid: true });
  const [isTouched, setIsTouched] = useState(false);

  const validate = useCallback((input: string) => {
    const result = validateQueryInput(queryType, input);
    setValidationState({ isValid: result.isValid, error: result.error });
    return result;
  }, [queryType]);

  useEffect(() => {
    setDisplayValue(value);
    if (value) {
      validate(value);
    } else {
      setValidationState({ isValid: true });
    }
  }, [value, validate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    
    if (!newValue) {
      setValidationState({ isValid: true });
      onChange(newValue, '', true);
      return;
    }

    const result = validate(newValue);
    onChange(newValue, result.cleanValue, result.isValid);
  };

  const handleBlur = () => {
    setIsTouched(true);
    
    // Format for display on blur
    if (displayValue && validationState.isValid) {
      const formatted = formatForDisplay(queryType, displayValue);
      setDisplayValue(formatted);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSubmit && validationState.isValid) {
      onSubmit();
    }
  };

  const showError = isTouched && !validationState.isValid && displayValue;
  const showSuccess = isTouched && validationState.isValid && displayValue;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="queryInput">
          {queryType.toUpperCase()} para consultar
        </Label>
        {displayValue && (
          <div className="flex items-center gap-1">
            {showSuccess && (
              <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Válido
              </Badge>
            )}
            {showError && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1">
                <XCircle className="h-3 w-3" />
                Inválido
              </Badge>
            )}
          </div>
        )}
      </div>
      <Input
        id="queryInput"
        placeholder={getPlaceholder(queryType)}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`bg-secondary/50 ${showError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
      />
      {showError && validationState.error && (
        <p className="text-xs text-destructive">{validationState.error}</p>
      )}
    </div>
  );
}
