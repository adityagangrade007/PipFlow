import { CheckCircle2, CircleAlert } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface FormAlertProps {
  variant: "error" | "success";
  message: string;
}

export function FormAlert({ variant, message }: FormAlertProps) {
  const Icon = variant === "error" ? CircleAlert : CheckCircle2;
  return (
    <Alert
      variant={variant === "error" ? "destructive" : "default"}
      className={cn(
        variant === "success" && "border-profit/40 text-profit [&>svg]:text-profit"
      )}
    >
      <Icon className="size-4" />
      <AlertDescription className={cn(variant === "success" && "text-profit")}>
        {message}
      </AlertDescription>
    </Alert>
  );
}
