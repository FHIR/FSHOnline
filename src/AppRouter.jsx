import React from 'react';
import { Route, Routes } from 'react-router-dom';
import App from './App';

export default function AppRouter() {
  return (
    <Routes>
      {/* use a splat for share because compressed URL string may have / in it */}
      <Route path="/share/*" element={<App path="share" />} />
      <Route path="/gist/:id" element={<App path="gist" />} />
      <Route path="/*" element={<App />} />
    </Routes>
  );
}
