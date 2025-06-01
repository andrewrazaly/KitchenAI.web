import { SignJWT } from 'jose';

export const supabaseTemplate = {
  issuer: 'clerk',
  audience: 'authenticated',
  expiresIn: '1h',
  algorithm: 'HS256',
  claims: (userData: any) => {
    return {
      sub: userData.id,
      email: userData.email,
      role: 'authenticated',
      aud: 'authenticated',
      ref: userData.id,
      email_verified: true
    };
  }
}; 