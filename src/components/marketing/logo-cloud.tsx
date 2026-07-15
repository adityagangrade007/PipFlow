import { Container } from "@/components/shared/container";

const platforms = [
  "MetaTrader 4",
  "MetaTrader 5",
  "TradingView",
  "cTrader",
  "Myfxbook",
  "Telegram",
];

export function LogoCloud() {
  return (
    <section className="border-y">
      <Container className="py-10">
        <p className="text-center text-sm font-medium text-muted-foreground">
          Works alongside the platforms you already trade with
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {platforms.map((name) => (
            <li
              key={name}
              className="text-lg font-semibold tracking-tight text-muted-foreground/70"
            >
              {name}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
