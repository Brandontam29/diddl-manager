import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps, ParentComponent } from "solid-js";
import { splitProps } from "solid-js";

import { cn } from "@renderer/libs/cn";

export const cardVariants = cva(
  "rounded-xl shadow-xs border border-white dark:shadow-none dark:-outline-offset-1 text-card-foreground",
  {
    variants: {
      color: {
        default:
          "bg-linear-to-br from-purple-200/70 via-purple-200/10 to-purple-200/70 backdrop-blur-md dark:bg-gray-800/50",
        custom: "",
      },
    },
    defaultVariants: {
      color: "default",
    },
  },
);

type CardProps = ComponentProps<"div"> & VariantProps<typeof cardVariants>;

export const Card = (props: CardProps) => {
  const [local, rest] = splitProps(props, ["class", "color"]);

  return <div class={cn(cardVariants({ color: local.color }), local.class)} {...rest} />;
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
