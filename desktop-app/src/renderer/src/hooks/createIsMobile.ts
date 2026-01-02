import { createSignal, onCleanup, onMount } from "solid-js";

const MOBILE_BREAKPOINT = 768;

export function createIsMobile() {
  // Initialize with false to avoid hydration mismatch during SSR
  const [isMobile, setIsMobile] = createSignal(false);

  onMount(() => {
    // Check if we are in a browser environment
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      setIsMobile(mql.matches);
    };

    // Set the initial value immediately upon mounting
    onChange();

    // Add event listener for subsequent changes
    mql.addEventListener("change", onChange);

    // Clean up event listener when component unmounts
    onCleanup(() => mql.removeEventListener("change", onChange));
  });

  // Return the signal accessor (not the value itself)
  return isMobile;
}

export default createIsMobile;
