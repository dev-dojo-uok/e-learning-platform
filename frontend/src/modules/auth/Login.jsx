import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import useAuthStore from '../../store/useAuthStore';

// Set base URL for API calls
axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

export default function Login() {
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/login', { email, password });
      
      if (response.data?.user) {
        setUser(response.data.user);
      }
      
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white p-4 font-sans text-black">
      <Card className="w-full max-w-md border border-slate-200 bg-white shadow-sm rounded-xl">
        <CardHeader className="space-y-1.5 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-black">Login</CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="name@uok.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 bg-white text-black focus-visible:ring-1 focus-visible:ring-black rounded-lg h-10 px-3"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Password
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 bg-white text-black focus-visible:ring-1 focus-visible:ring-black rounded-lg h-10 px-3"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white hover:bg-slate-900 font-bold rounded-lg h-10 transition-colors"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </Button>
            <div className="text-center text-xs text-slate-500 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-black hover:underline">
                Create an account
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
