"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { useBotCommand } from "@/hooks/use-bot-command";
import type { Bot } from "@/lib/types/trading";
import {
  botConfigFormSchema,
  type BotConfigFormInput,
  type BotConfigFormOutput,
} from "@/lib/validators/commands";

type CommandMutation = ReturnType<typeof useBotCommand>;

function splitHours(hours: string): [string, string] {
  const [start, end] = hours.split("–");
  return [start ?? "07:00", end ?? "20:00"];
}

export function BotConfigSheet({
  bot,
  mutation,
}: {
  bot: Bot;
  mutation: CommandMutation;
}) {
  const [open, setOpen] = useState(false);
  const [hoursStart, hoursEnd] = splitHours(bot.config.tradingHours);

  const form = useForm<BotConfigFormInput, unknown, BotConfigFormOutput>({
    resolver: zodResolver(botConfigFormSchema),
    values: {
      riskPercent: bot.config.riskPercent,
      lots: bot.config.lots,
      takeProfitPips: bot.config.takeProfitPips,
      stopLossPips: bot.config.stopLossPips,
      dailyLossLimit: bot.config.dailyLossLimit,
      maxOpenTrades: bot.config.maxOpenTrades,
      tradingHoursStart: hoursStart,
      tradingHoursEnd: hoursEnd,
    },
  });

  function onSubmit(values: BotConfigFormOutput) {
    mutation.mutate(
      {
        type: "UPDATE_CONFIG",
        payload: {
          riskPercent: values.riskPercent,
          lots: values.lots,
          takeProfitPips: values.takeProfitPips,
          stopLossPips: values.stopLossPips,
          dailyLossLimit: values.dailyLossLimit,
          maxOpenTrades: values.maxOpenTrades,
          tradingHours: `${values.tradingHoursStart}–${values.tradingHoursEnd}`,
        },
      },
      {
        onSuccess: () => {
          toast.success(`Risk settings updated for ${bot.name}`, {
            description: "The EA acknowledged and applied the new configuration.",
          });
          setOpen(false);
        },
        onError: (error) =>
          toast.error("Configuration update failed", {
            description: error.message,
          }),
      }
    );
  }

  const saving = mutation.isPending && mutation.variables?.type === "UPDATE_CONFIG";

  const numberField = (
    name: keyof BotConfigFormInput,
    label: string,
    step: string,
    description?: string
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type="number" step={step} inputMode="decimal" {...field} />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="ghost" disabled={mutation.isPending}>
          <SlidersHorizontal className="size-3.5" aria-hidden />
          Risk &amp; limits
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Risk &amp; limits — {bot.name}</SheetTitle>
          <SheetDescription>
            Changes are sent to the EA as an UPDATE_CONFIG command and apply to new trades
            once acknowledged.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-4 py-6">
            <div className="grid grid-cols-2 gap-4">
              {numberField("riskPercent", "Risk %", "0.1", "Per-trade account risk")}
              {numberField("lots", "Lot size", "0.01", "Fixed lots per trade")}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {numberField("takeProfitPips", "Take profit (pips)", "1")}
              {numberField("stopLossPips", "Stop loss (pips)", "1")}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {numberField(
                "dailyLossLimit",
                "Daily loss limit ($)",
                "10",
                "Auto-pause at 100%"
              )}
              {numberField("maxOpenTrades", "Max open trades", "1")}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tradingHoursStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trading from</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tradingHoursEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trading until</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {saving ? "Sending to EA…" : "Save & send to EA"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
