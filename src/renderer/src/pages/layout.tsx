import { fetchLibraryState } from '@renderer/features/library';
import { A, useLocation } from '@solidjs/router';
import { createEffect } from 'solid-js';

const BaseLayout = (props) => {
  const location = useLocation();
  createEffect(() => fetchLibraryState());

  createEffect(() => console.log(location));
  return (
    <>
      <nav class="p-4 flex flex-col gap-2 border-r border-gray-200">
        <div>Current Location: {location.pathname}</div>
        <A href="/">Home</A>
        <A href="/not-found">Not Found</A>
      </nav>
      {props.children}
    </>
  );
};

export default BaseLayout;
