'use client';
import { useState } from 'react';
import { saveAuthToken } from '../lib/hasura';

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || '';

export default function JwtLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setMessage(null);
    if (!username || !password) {
      setMessage('Username and password are required.');
      return;
    }

    const response = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || 'Login failed.');
      return;
    }

    saveAuthToken(data.access_token);
    setMessage('JWT saved. You can now query Hasura.');
  };

  return (
    <div className="border p-4 rounded mb-6 w-full">
      <h2 className="text-lg font-semibold mb-2">JWT Login</h2>
      <div className="flex flex-col gap-2">
        <input
          className="border p-2"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="border p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-gray-900 text-white px-4 py-2 rounded"
        >
          Get JWT
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
