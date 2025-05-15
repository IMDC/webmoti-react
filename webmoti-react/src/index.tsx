import { createRoot } from 'react-dom/client';

import { CssBaseline } from '@mui/material';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import { Redirect, Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import App from './App';
import { ChatProvider } from './components/ChatProvider';
import ErrorDialog from './components/ErrorDialog/ErrorDialog';
import LoginPage from './components/LoginPage/LoginPage';
import { ParticipantProvider } from './components/ParticipantProvider';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import UnsupportedBrowserWarning from './components/UnsupportedBrowserWarning/UnsupportedBrowserWarning';
import { VideoProvider } from './components/VideoProvider';
import { WebmotiVideoProvider } from './components/WebmotiVideoProvider';
import AppStateProvider, { useAppState } from './state';
import theme from './theme';
import './types';
import useConnectionOptions from './utils/useConnectionOptions/useConnectionOptions';

const VideoApp = () => {
  const { error, setError } = useAppState();
  const connectionOptions = useConnectionOptions();

  return (
    <VideoProvider options={connectionOptions} onError={setError}>
      <ErrorDialog dismissError={() => setError(null)} error={error} />
      <ParticipantProvider>
        <ChatProvider>
          <WebmotiVideoProvider>
            <App />
          </WebmotiVideoProvider>
        </ChatProvider>
      </ParticipantProvider>
    </VideoProvider>
  );
};

export const ReactApp = () => (
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UnsupportedBrowserWarning>
        <Router>
          <AppStateProvider>
            <Switch>
              <PrivateRoute exact path="/">
                <VideoApp />
              </PrivateRoute>
              <PrivateRoute path="/room/:URLRoomName">
                <VideoApp />
              </PrivateRoute>
              <Route path="/login">
                <LoginPage />
              </Route>
              <Redirect to="/" />
            </Switch>
          </AppStateProvider>
        </Router>
      </UnsupportedBrowserWarning>
    </ThemeProvider>
  </StyledEngineProvider>
);

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<ReactApp />);
