import { lazy } from 'react';

export const lazyWithDelay = (importFunc, minDelay = 1000) => {
  return lazy(() => {
    return Promise.all([
      importFunc(),
      new Promise(resolve => setTimeout(resolve, minDelay))
    ]).then(([moduleExports]) => moduleExports);
  });
};