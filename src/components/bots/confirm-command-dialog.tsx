"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfirmCommandDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  /** When set, the user must type this word to enable the confirm button. */
  typedConfirmation?: string;
  onConfirm: () => void;
}

export function ConfirmCommandDialog({
  trigger,
  title,
  description,
  confirmLabel,
  destructive = false,
  typedConfirmation,
  onConfirm,
}: ConfirmCommandDialogProps) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const confirmDisabled =
    !!typedConfirmation && typed.trim().toUpperCase() !== typedConfirmation;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setTyped("");
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {typedConfirmation ? (
          <div className="space-y-2">
            <Label htmlFor="confirm-word" className="text-xs text-muted-foreground">
              Type{" "}
              <span className="font-mono font-semibold text-foreground">
                {typedConfirmation}
              </span>{" "}
              to confirm
            </Label>
            <Input
              id="confirm-word"
              autoComplete="off"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={typedConfirmation}
            />
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={confirmDisabled}
            className={
              destructive
                ? "bg-destructive text-white hover:bg-destructive/90"
                : undefined
            }
            onClick={() => onConfirm()}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
