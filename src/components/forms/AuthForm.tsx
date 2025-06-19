import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface AuthFormProps {
  type: 'login' | 'register' | 'forgotPassword' | 'resetPassword';
  onSubmit: (values: any) => Promise<void>;
  error?: string | null;
}

const validationSchemas = {
  login: yup.object({
    email: yup
      .string()
      .email('請輸入有效的電子郵件地址')
      .required('請輸入電子郵件'),
    password: yup
      .string()
      .required('請輸入密碼'),
  }),
  register: yup.object({
    name: yup
      .string()
      .required('請輸入名稱')
      .max(50, '名稱不能超過50個字符'),
    email: yup
      .string()
      .email('請輸入有效的電子郵件地址')
      .required('請輸入電子郵件'),
    password: yup
      .string()
      .min(8, '密碼長度至少為8個字符')
      .required('請輸入密碼'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], '密碼不一致')
      .required('請確認密碼'),
    role: yup
      .string()
      .oneOf(['user', 'operator'], '無效的角色')
      .required('請選擇角色'),
    operatorCode: yup
      .string()
      .when('role', {
        is: 'operator',
        then: yup.string().required('請輸入營運商註冊碼'),
      }),
  }),
  forgotPassword: yup.object({
    email: yup
      .string()
      .email('請輸入有效的電子郵件地址')
      .required('請輸入電子郵件'),
  }),
  resetPassword: yup.object({
    password: yup
      .string()
      .min(8, '密碼長度至少為8個字符')
      .required('請輸入新密碼'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], '密碼不一致')
      .required('請確認密碼'),
  }),
};

const initialValues = {
  login: {
    email: '',
    password: '',
  },
  register: {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    operatorCode: '',
  },
  forgotPassword: {
    email: '',
  },
  resetPassword: {
    password: '',
    confirmPassword: '',
  },
};

const formTitles = {
  login: '登入',
  register: '註冊',
  forgotPassword: '忘記密碼',
  resetPassword: '重置密碼',
};

const AuthForm: React.FC<AuthFormProps> = ({ type, onSubmit, error }) => {
  const formik = useFormik({
    initialValues: initialValues[type],
    validationSchema: validationSchemas[type],
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        maxWidth: 400,
      }}
    >
      <Typography variant="h5" component="h1" align="center" gutterBottom>
        {formTitles[type]}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {type === 'register' && (
        <TextField
          fullWidth
          id="name"
          name="name"
          label="名稱"
          value={formik.values.name}
          onChange={formik.handleChange}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
      )}

      {(type === 'login' || type === 'register' || type === 'forgotPassword') && (
        <TextField
          fullWidth
          id="email"
          name="email"
          label="電子郵件"
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
      )}

      {(type === 'login' || type === 'register' || type === 'resetPassword') && (
        <TextField
          fullWidth
          id="password"
          name="password"
          label={type === 'resetPassword' ? '新密碼' : '密碼'}
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
        />
      )}

      {(type === 'register' || type === 'resetPassword') && (
        <TextField
          fullWidth
          id="confirmPassword"
          name="confirmPassword"
          label="確認密碼"
          type="password"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
          helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
        />
      )}

      {type === 'register' && (
        <>
          <TextField
            select
            fullWidth
            id="role"
            name="role"
            label="角色"
            value={formik.values.role}
            onChange={formik.handleChange}
            error={formik.touched.role && Boolean(formik.errors.role)}
            helperText={formik.touched.role && formik.errors.role}
            SelectProps={{
              native: true,
            }}
          >
            <option value="user">一般用戶</option>
            <option value="operator">營運商</option>
          </TextField>

          {formik.values.role === 'operator' && (
            <TextField
              fullWidth
              id="operatorCode"
              name="operatorCode"
              label="營運商註冊碼"
              value={formik.values.operatorCode}
              onChange={formik.handleChange}
              error={formik.touched.operatorCode && Boolean(formik.errors.operatorCode)}
              helperText={formik.touched.operatorCode && formik.errors.operatorCode}
            />
          )}
        </>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={formik.isSubmitting}
        sx={{ mt: 2 }}
      >
        {formik.isSubmitting ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          formTitles[type]
        )}
      </Button>

      {type === 'login' && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            忘記密碼？
          </Link>
          <Link component={RouterLink} to="/register" variant="body2">
            還沒有帳號？註冊
          </Link>
        </Box>
      )}

      {type === 'register' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Link component={RouterLink} to="/login" variant="body2">
            已有帳號？登入
          </Link>
        </Box>
      )}

      {type === 'forgotPassword' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Link component={RouterLink} to="/login" variant="body2">
            返回登入
          </Link>
        </Box>
      )}
    </Box>
  );
};

export default AuthForm; 