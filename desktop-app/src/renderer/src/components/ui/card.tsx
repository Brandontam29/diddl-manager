import type { ComponentProps, ParentComponent } from "solid-js";
import { splitProps } from "solid-js";

import { cn } from "@renderer/libs/cn";

export const Card = (props: ComponentProps<"div">) => {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <div
      class={cn(
        "rounded-xl shadow-xs",
        "border border-white",
        "bg-linear-to-br from-purple-200/70 via-purple-200/10 to-purple-200/70 backdrop-blur-md",
        "dark:bg-gray-800/50 dark:shadow-none dark:-outline-offset-1",
        "text-card-foreground",
        local.class,
      )}
      {...rest}
    />
  );
};

export const CardHeader = (props: ComponentProps<"div">) => {
  const [local, rest] = splitProps(props, ["class"]);

  return <div class={cn("flex flex-col space-y-1.5 p-6", local.class)} {...rest} />;
};

export const CardTitle: ParentComponent<ComponentProps<"h1">> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);

  return <h1 class={cn("leading-none font-semibold tracking-tight", local.class)} {...rest} />;
};

export const CardDescription: ParentComponent<ComponentProps<"h3">> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);

  return <h3 class={cn("text-muted-foreground text-sm", local.class)} {...rest} />;
};

export const CardContent = (props: ComponentProps<"div">) => {
  const [local, rest] = splitProps(props, ["class"]);

  return <div class={cn("p-6 pt-0", local.class)} {...rest} />;
};

export const CardFooter = (props: ComponentProps<"div">) => {
  const [local, rest] = splitProps(props, ["class"]);

  return <div class={cn("flex items-center p-6 pt-0", local.class)} {...rest} />;
};
