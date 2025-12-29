import { cn } from "@renderer/libs/cn";
import type { ComponentProps, ParentComponent } from "solid-js";
import { splitProps } from "solid-js";

export const Card = (props: ComponentProps<"div">) => {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <div
      class={cn(
        "shadow-xs rounded-xl",
        "border border-white",
        "backdrop-blur-md bg-linear-to-br from-purple-200/70 via-purple-200/10 to-purple-200/70 ",
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

  return <h1 class={cn("font-semibold leading-none tracking-tight", local.class)} {...rest} />;
};

export const CardDescription: ParentComponent<ComponentProps<"h3">> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);

  return <h3 class={cn("text-sm text-muted-foreground", local.class)} {...rest} />;
};

export const CardContent = (props: ComponentProps<"div">) => {
  const [local, rest] = splitProps(props, ["class"]);

  return <div class={cn("p-6 pt-0", local.class)} {...rest} />;
};

export const CardFooter = (props: ComponentProps<"div">) => {
  const [local, rest] = splitProps(props, ["class"]);

  return <div class={cn("flex items-center p-6 pt-0", local.class)} {...rest} />;
};
