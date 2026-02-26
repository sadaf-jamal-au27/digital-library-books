import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';

export function renderWithProviders(
  ui,
  {
    route = '/',
    withAuthProvider = true,
    withThemeProvider = true,
    // If the component uses <Outlet />, provide a route wrapper.
    withOutletRoute = false,
  } = {}
) {
  const wrapped = (
    <MemoryRouter initialEntries={[route]}>
      {withThemeProvider ? (
        <ThemeProvider>
          {withAuthProvider ? <AuthProvider>{ui}</AuthProvider> : ui}
        </ThemeProvider>
      ) : withAuthProvider ? (
        <AuthProvider>{ui}</AuthProvider>
      ) : (
        ui
      )}
    </MemoryRouter>
  );

  if (!withOutletRoute) return render(wrapped);

  return render(
    <MemoryRouter initialEntries={[route]}>
      {withThemeProvider ? (
        <ThemeProvider>
          {withAuthProvider ? (
            <AuthProvider>
              <Routes>
                <Route path="/" element={ui}>
                  <Route index element={<div />} />
                </Route>
              </Routes>
            </AuthProvider>
          ) : (
            <Routes>
              <Route path="/" element={ui}>
                <Route index element={<div />} />
              </Route>
            </Routes>
          )}
        </ThemeProvider>
      ) : withAuthProvider ? (
        <AuthProvider>
          <Routes>
            <Route path="/" element={ui}>
              <Route index element={<div />} />
            </Route>
          </Routes>
        </AuthProvider>
      ) : (
        <Routes>
          <Route path="/" element={ui}>
            <Route index element={<div />} />
          </Route>
        </Routes>
      )}
    </MemoryRouter>
  );
}

