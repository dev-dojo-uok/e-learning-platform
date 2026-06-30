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

export default function Register() {
  const setUser = useAuthStore((state) => state.setUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/register', { name, email, password, role });
      setSuccess(true);
      
      if (response.data?.user) {
        setUser(response.data.user);
      }
      
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white p-4 font-sans text-black">
      <Card className="w-full max-w-md border border-slate-200 bg-white shadow-sm rounded-xl">
        <CardHeader className="space-y-1.5 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-black">Create Account</CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Sign up to start learning or teaching on the platform
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold rounded-lg">
                Registration successful! Redirecting to login...
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 bg-white text-black focus-visible:ring-1 focus-visible:ring-black rounded-lg h-10 px-3"
              />
            </div>
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
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Password
              </Label>
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
            <div className="space-y-1">
              <Label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Register as
              </Label>
              <Select value={role} onValueChange={(val) => setRole(val)}>
                <SelectTrigger className="w-full border border-slate-200 bg-white text-black focus:ring-1 focus:ring-black rounded-lg h-10 px-3 text-left">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 text-black rounded-lg shadow-sm">
                  <SelectItem value="STUDENT" className="hover:bg-slate-100 focus:bg-slate-100 cursor-pointer">Student</SelectItem>
                  <SelectItem value="TEACHER" className="hover:bg-slate-100 focus:bg-slate-100 cursor-pointer">Teacher</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              disabled={loading || success}
              className="w-full bg-black text-white hover:bg-slate-900 font-bold rounded-lg h-10 transition-colors"
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <div className="text-center text-xs text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-black hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
