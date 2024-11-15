// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CommandEditor from './pages/CommandEditor';

const queryClient = new QueryClient();

// Temporary components until we create the actual ones
// const Login = () => <div>Login Page</div>;
// const Register = () => <div>Register Page</div>;
// const Dashboard = () => <div>Dashboard Page</div>;
// const CommandEditor = () => <div>Command Editor Page</div>;
const Profile = () => <div>Profile Page</div>;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<Layout />}>
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/commands/new" element={<CommandEditor />} />
                <Route path="/commands/:id" element={<CommandEditor />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;