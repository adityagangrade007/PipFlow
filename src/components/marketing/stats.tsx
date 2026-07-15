import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";

const stats = [
  { value: "12,400+", label: "bots under management" },
  { value: "$340M", label: "volume monitored" },
  { value: "99.98%", label: "command uptime" },
  { value: "<50 ms", label: "median command latency" },
] as const;

export function Stats() {
  return (
    <section className="border-y">
      <Container>
        <dl className="grid grid-cols-2 divide-x-0 divide-y md:grid-cols-4 md:divide-x md:divide-y-0">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.06}>
              <div className="px-6 py-10 text-center md:py-12">
                <dd className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
                  {stat.value}
                </dd>
                <dt className="mt-2 text-sm text-muted-foreground">{stat.label}</dt>
              </div>
            </Reveal>
          ))}
        </dl>
      </Container>
    </section>
  );
}
