import React, { useEffect } from 'react';

const RedirectToLogin: React.FunctionComponent = () => {
  useEffect(() => {
    if (process.env['DATA_SOURCE'] !== 'mock') {
      window.location.href = '/login';
    }
  }, []);
  return null;
};

export default RedirectToLogin;
