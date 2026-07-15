import Link from "next/link";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: {
    text: string;
    linkLabel: string;
    href: string;
  };
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-8">{children}</div>
      {footer ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          {footer.text}{" "}
          <Link
            href={footer.href}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {footer.linkLabel}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
