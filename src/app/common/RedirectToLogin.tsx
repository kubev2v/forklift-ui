import React, { useEffect } from 'react';

export const RedirectToLogin: React.FunctionComponent = () => {
  useEffect(() => {
    if (process.env['DATA_SOURCE'] !== 'mock' && process.env['NODE_ENV'] !== 'test') {
      window.location.href = '/login';
    }
  }, []);
  return null;
};
