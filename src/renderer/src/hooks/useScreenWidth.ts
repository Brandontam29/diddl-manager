import { createSignal, onCleanup, onMount } from 'solid-js';

function useScreenWidth() {
  const [screenWidth, setScreenWidth] = createSignal(window.innerWidth);

  const updateWidth = () => {
    setScreenWidth(window.innerWidth);
  };

  onMount(() => {
    window.addEventListener('resize', updateWidth);

    onCleanup(() => {
      window.removeEventListener('resize', updateWidth);
    });
  });

  return screenWidth;
}

export default useScreenWidth;
