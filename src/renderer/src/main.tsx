import './styles/index.css';

import { render } from 'solid-js/web';
import { Route, Router } from '@solidjs/router';
import { lazy } from 'solid-js';
import BaseLayout from './pages/layout';
const HomePage = lazy(() => import('./pages/page'));
const NotFoundPage = lazy(() => import('./pages/not-found'));

render(
  () => (
    <Router root={BaseLayout}>
      <Route path="/" component={HomePage} />
      <Route path="*paramName" component={NotFoundPage} />
    </Router>
  ),
  document.getElementById('root') as HTMLElement
);
