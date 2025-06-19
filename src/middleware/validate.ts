import { Request, Response, NextFunction } from 'express';
import { AppError } from './error';

interface ValidationSchema {
  [key: string]: {
    required?: boolean;
    type?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    enum?: string[];
    message?: string;
  };
}

export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    Object.keys(schema).forEach(field => {
      const value = req.body[field];
      const rules = schema[field];

      // 檢查必填欄位
      if (rules.required && !value) {
        errors.push(rules.message || `${field} 是必填欄位`);
        return;
      }

      if (value) {
        // 檢查類型
        if (rules.type && typeof value !== rules.type) {
          errors.push(rules.message || `${field} 必須是 ${rules.type} 類型`);
        }

        // 檢查最小長度
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(rules.message || `${field} 長度不能小於 ${rules.minLength} 個字符`);
        }

        // 檢查最大長度
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(rules.message || `${field} 長度不能超過 ${rules.maxLength} 個字符`);
        }

        // 檢查正則表達式
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(rules.message || `${field} 格式不正確`);
        }

        // 檢查枚舉值
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(rules.message || `${field} 必須是以下值之一: ${rules.enum.join(', ')}`);
        }
      }
    });

    if (errors.length > 0) {
      return next(new AppError(errors.join('; '), 400));
    }

    next();
  };
}; 