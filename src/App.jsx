import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { ThemeContextProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import { brownTheme, darkBrownTheme } from './assets/theme/brownTheme';

function App() {
  const [darkMode, setDarkMode] = React.useState(false);

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