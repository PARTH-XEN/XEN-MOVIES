import crypto from 'crypto';

// Secure PBKDF2 Password Hashing
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return {
    salt,
    hash,
    combined: `${salt}:${hash}`
  };
}

export function verifyPassword(password, hashOrStored, optionalSalt) {
  if (!password || !hashOrStored) return false;
  
  let salt = optionalSalt;
  let originalHash = hashOrStored;

  if (!salt && hashOrStored.includes(':')) {
    const parts = hashOrStored.split(':');
    salt = parts[0];
    originalHash = parts[1];
  }

  if (!salt || !originalHash) return false;

  const computedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return computedHash === originalHash;
}

// Lightweight secure JWT generator using Node.js crypto
export function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30 // 30 days valid
  })).toString('base64url');

  const secret = process.env.JWT_SECRET || 'xenmovies_secret_auth_key_2026';
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;

  const secret = process.env.JWT_SECRET || 'xenmovies_secret_auth_key_2026';
  const expectedSig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
