import React, { useState } from 'react';
import { Container, Paper, Alert } from '@mui/material';
import AuthForm from '../components/forms/AuthForm';
import { authAPI } from '../services/api';

const ForgotPassword: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: { email: string }) => {
    try {
      await authAPI.forgotPassword(values.email);
      setSuccess(true);
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.message || '發送重置密碼郵件失敗');
      setSuccess(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            重置密碼郵件已發送，請檢查您的電子郵件。
          </Alert>
        ) : (
          <AuthForm type="forgotPassword" onSubmit={handleSubmit} error={error} />
        )}
      </Paper>
    </Container>
  );
};

export default ForgotPassword; 