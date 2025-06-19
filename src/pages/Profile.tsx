import React, { useState, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user, updateProfile, error } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(user?.profileImage || null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('name', name);

      if (fileInputRef.current?.files?.[0]) {
        formData.append('profileImage', fileInputRef.current.files[0]);
      }

      await updateProfile(formData);
      setSuccess(true);
    } catch (error) {
      // 錯誤已經在 AuthContext 中處理
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          個人資料
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            個人資料更新成功！
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Avatar
              src={previewImage || user?.profileImage}
              sx={{ width: 100, height: 100 }}
            />
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              更換頭像
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </Box>

          <TextField
            fullWidth
            label="電子郵件"
            value={user?.email}
            disabled
            helperText={user?.isEmailVerified ? '已驗證' : '未驗證'}
          />

          <TextField
            fullWidth
            label="名稱"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : '更新資料'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile; 