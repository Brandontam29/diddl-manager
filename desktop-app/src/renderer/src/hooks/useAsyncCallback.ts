import { createSignal } from "solid-js";

const useAsyncCallback = <TReturn>(activeFunction: (...args: any) => Promise<TReturn | null>) => {
  const [isLoading, setIsLoading] = createSignal(false);
  const [isError, setIsError] = createSignal(false);
  const [data, setData] = createSignal<any>(null);
  const [allSettled, setAllSettled] = createSignal(false);
  const [hasExecuted, setHasExecuted] = createSignal(false);

  const handler = async (...someArgs: any) => {
    setIsLoading(true);
    setAllSettled(false);
    setHasExecuted(true);
    try {
      const response = await activeFunction(...someArgs);
      setAllSettled(true);
      setIsLoading(false);
      setIsError(false);
      setData(() => response);
    } catch (e) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setIsLoading(false);
    setIsError(false);
    setData(null);
    setAllSettled(false);
    setHasExecuted(false);
  };

  return { handler, isLoading, isError, data, allSettled, hasExecuted, resetState };
};

export default useAsyncCallback;
