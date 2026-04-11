import { type JSX, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

const Card = (props: JSX.HTMLAttributes<HTMLDivElement>) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <div
      class={cn("rounded-lg border bg-card text-card-foreground shadow-sm", local.class)}
      {...others}
    />
  );
};

const CardHeader = (props: JSX.HTMLAttributes<HTMLDivElement>) => {
  const [local, others] = splitProps(props, ["class"]);
  return <div class={cn("flex flex-col space-y-1.5 p-6", local.class)} {...others} />;
};

const CardTitle = (props: JSX.HTMLAttributes<HTMLHeadingElement>) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <h3 class={cn("text-2xl font-semibold leading-none tracking-tight", local.class)} {...others} />
  );
};

const CardDescription = (props: JSX.HTMLAttributes<HTMLParagraphElement>) => {
  const [local, others] = splitProps(props, ["class"]);
  return <p class={cn("text-sm text-muted-foreground", local.class)} {...others} />;
};

const CardContent = (props: JSX.HTMLAttributes<HTMLDivElement>) => {
  const [local, others] = splitProps(props, ["class"]);
  return <div class={cn("p-6 pt-0", local.class)} {...others} />;
};

const CardFooter = (props: JSX.HTMLAttributes<HTMLDivElement>) => {
  const [local, others] = splitProps(props, ["class"]);
  return <div class={cn("flex items-center p-6 pt-0", local.class)} {...others} />;
};

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
