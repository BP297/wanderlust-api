import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Paper } from '@mui/material';
import AuthForm from '../components/forms/AuthForm';
import { useAuth } from '../contexts/AuthContext';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const from = state?.from?.pathname || '/';

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password);
      navigate(from, { replace: true });
    } catch (error) {
      // 錯誤已經在 AuthContext 中處理
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <AuthForm type="login" onSubmit={handleSubmit} error={error} />
      </Paper>
    </Container>
  );
};

export default Login; 