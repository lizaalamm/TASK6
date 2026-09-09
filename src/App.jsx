/**
 * src/App.jsx
 * ----------------------------------------------------------------------------
 * Application root: wires providers (theme → auth → router) and seeds the
 * local demo catalogue on first load.
 *
 * Provider nesting (outer → inner):
 *  BrowserRouter → ThemeContext → MUI ThemeProvider → AuthProvider → Routes
 * ----------------------------------------------------------------------------
 */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { ThemeContextProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import { brownTheme, darkBrownTheme } from './assets/theme/brownTheme';
import { seedData } from './data/seedData';
import { seedInitialData } from './services/localStorage';

function App() {
  // Seed local demo data (cars / customers / applications) once per browser.
  React.useEffect(() => {
    seedInitialData(seedData);
  }, []);

  // Light / dark mode flag shared via ThemeContext (toggled in TopBar).
  const [darkMode, setDarkMode] = React.useState(false);

  // Rebuild the MUI theme object only when the mode flips.
  const theme = React.useMemo(
    () => createTheme(darkMode ? darkBrownTheme : brownTheme),
    [darkMode]
  );

  return (
    <BrowserRouter>
      <ThemeContextProvider value={{ darkMode, setDarkMode }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ThemeProvider>
      </ThemeContextProvider>
    </BrowserRouter>
  );
}

export default App;
