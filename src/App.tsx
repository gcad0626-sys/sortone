
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';

// Pages
import { SplashPage } from './pages/SplashPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { AIPage } from './pages/AIPage';
import { ProfilePage } from './pages/ProfilePage';
import { AddMemoPage } from './pages/AddMemoPage';
import { DetailPage } from './pages/DetailPage';
import { ArchivePage } from './pages/ArchivePage';
import { TrashPage } from './pages/TrashPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SplashPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            <Route element={<Layout />}>
              <Route path="/memo" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/ai" element={<AIPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/add" element={<AddMemoPage />} />
              <Route path="/detail/:id" element={<DetailPage />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/trash" element={<TrashPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
