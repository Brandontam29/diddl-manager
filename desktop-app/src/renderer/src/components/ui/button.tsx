import { cn } from "@renderer/libs/cn";

import type { ButtonRootProps } from "@kobalte/core/button";
import { Button as ButtonPrimitive } from "@kobalte/core/button";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { Component, ValidComponent } from "solid-js";
import { onCleanup, onMount, splitProps } from "solid-js";
import { animate, spring } from "motion";
import { insert } from "solid-js/web";

export const buttonVariants = cva("", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
      outline:
        "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
      none: "",

      pink: "bg-pink-100 hover:bg-pink-200 shadow text-pink-950",
    },
    size: {
      default: "h-9 px-4 py-2 rounded-md",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
      none: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
  compoundVariants: [
    {
      variant: ["default", "pink", "destructive", "secondary", "ghost", "link"],
      size: ["default", "sm", "lg", "icon"],
      class:
        "relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-[color,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    },
  ],
});

type buttonProps<T extends ValidComponent = "button"> = ButtonRootProps<T> &
  VariantProps<typeof buttonVariants> & {
    class?: string;
  };

const Circle: Component<{ ref: (el: HTMLSpanElement) => void; diameter: number }> = (props) => {
  return (
    <span ref={props.ref} class="absolute inset-0 overflow-hidden h-full w-full">
      <span
        class="w-full animate-ripple rounded-[50%] absolute inset-0 bg-purple-300/50"
        style={{
          height: `${props.diameter}px`,
        }}
      />
    </span>
  );
};
function createRipple(event) {
  console.log("createRipple");
  const button = event.currentTarget;
  const diameter = Math.max(button.clientWidth, button.clientHeight);

  let circleRef;
  console.log(button);

  insert(button, <Circle ref={circleRef} diameter={diameter} />);

  setTimeout(() => button.removeChild(circleRef), 600);
}

export const Button = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, buttonProps<T>>,
) => {
  const [local, rest] = splitProps(props as buttonProps, ["class", "variant", "size"]);
  let buttonRef;

  const animateClick = () => {
    animate(
      buttonRef,
      { y: [10, 0] },
      {
        duration: 2, // Total duration is not required with spring animations but can be set
        easing: spring({ stiffness: 150, damping: 15 }),
      },
    );
  };

  onMount(() => buttonRef.addEventListener("click", createRipple));

  onCleanup(() => {
    buttonRef.removeEventListener("click", createRipple);
  });

  return (
    <ButtonPrimitive
      ref={buttonRef}
      class={cn(
        buttonVariants({
          size: local.size,
          variant: local.variant,
        }),
        local.class,
      )}
      {...rest}
    />
  );
};
