export const registerValidation = {
  email: {
    required: true,
    type: 'string',
    pattern: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    message: '請提供有效的電子郵件地址'
  },
  password: {
    required: true,
    type: 'string',
    minLength: 8,
    message: '密碼長度至少為8個字符'
  },
  name: {
    required: true,
    type: 'string',
    maxLength: 50,
    message: '名稱不能超過50個字符'
  },
  role: {
    type: 'string',
    enum: ['user', 'operator'],
    message: '角色必須是 user 或 operator'
  }
};

export const loginValidation = {
  email: {
    required: true,
    type: 'string',
    pattern: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    message: '請提供有效的電子郵件地址'
  },
  password: {
    required: true,
    type: 'string',
    message: '請提供密碼'
  }
};

export const forgotPasswordValidation = {
  email: {
    required: true,
    type: 'string',
    pattern: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    message: '請提供有效的電子郵件地址'
  }
};

export const resetPasswordValidation = {
  password: {
    required: true,
    type: 'string',
    minLength: 8,
    message: '新密碼長度至少為8個字符'
  }
};

export const updateProfileValidation = {
  name: {
    required: true,
    type: 'string',
    maxLength: 50,
    message: '名稱不能超過50個字符'
  }
}; 