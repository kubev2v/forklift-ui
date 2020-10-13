import React, { useEffect } from 'react';

const RedirectToLogin: React.FunctionComponent = () => {
  useEffect(() => {
    if (process.env['DATA_SOURCE'] !== 'mock') {
      debugger;
      window.location.href = '/login';
    }
  }, []);
  return null;
};

export default RedirectToLogin;
