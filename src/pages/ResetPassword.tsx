import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Paper, Alert } from '@mui/material';
import AuthForm from '../components/forms/AuthForm';
import { authAPI } from '../services/api';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const handleSubmit = async (values: ResetPasswordFormData) => {
    if (!token) {
      setError('無效的重置連結');
      return;
    }

    try {
      await authAPI.resetPassword(token, values.password);
      setSuccess(true);
      setError(null);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || '重置密碼失敗');
      setSuccess(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            密碼重置成功！3秒後將跳轉到登入頁面...
          </Alert>
        ) : (
          <AuthForm type="resetPassword" onSubmit={handleSubmit} error={error} />
        )}
      </Paper>
    </Container>
  );
};

export default ResetPassword; 