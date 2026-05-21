/// <reference types="vite/client" />
import { toast } from 'sonner';

export const useMock = import.meta.env.VITE_CREATION_USE_MOCK === "true";
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const finalUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  
  try {
    const response = await fetch(finalUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `请求失败 (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // Fallback to text if JSON parsing fails
        const textError = await response.text().catch(() => null);
        if (textError) errorMessage = textError;
      }

      if (response.status === 401) {
        errorMessage = '未登录或登录已过期，请重新登录。';
        // 可以重定向
        setTimeout(() => {
          window.location.href = 'https://llm.yslinkai.com/console';
        }, 2000);
      } else if (response.status === 403) {
        errorMessage = '创作中心未开启或您没有权限。';
      } else if (response.status === 402) {
        errorMessage = '余额不足，请到控制台充值。';
      } else if (response.status === 404 && errorMessage.includes('model')) {
        errorMessage = '暂无可用模型，请联系管理员配置。';
      }

      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      toast.error('网络错误或服务器连接失败');
    }
    throw error;
  }
}

// User Profile compat
export async function getUserProfile() {
  const result = await request<any>('/user/self');
  let user = result;
  if (result?.success === true && result?.data) {
    user = result.data;
  } else if (result?.data) {
    user = result.data;
  }
  return user;
}
