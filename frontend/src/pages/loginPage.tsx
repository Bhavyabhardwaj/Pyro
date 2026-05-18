import { useState } from "react";
import { authService } from "../services/auth.service";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AuthLayout } from "../components/auth/AuthLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { OAuthOptions } from "../components/auth/OAuthOptions";
import type { OAuthProvider } from "../components/auth/oauth-providers";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [oauthNotice, setOauthNotice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleOAuthSelect = (provider: OAuthProvider) => {
        setError('');
        setOauthNotice(
            `${provider.id === 'google' ? 'Google' : 'GitHub'} sign-in is ready for backend OAuth integration.`,
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setOauthNotice('');
        setIsSubmitting(true);
        try {
            const response = await authService.login({ email, password });
            login(response.data.user, response.data.token);
            navigate('/chat');
        } catch (error) {
            console.error('Login failed:', error);
            setError('Unable to sign in. Check your email and password.');
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to your Pyro workspace and jump back into your realtime rooms."
            footer={
                <>
                    New to Pyro?{" "}
                    <Link className="font-medium text-zinc-200 hover:text-white" to="/register">
                        Create an account
                    </Link>
                </>
            }
        >
            <OAuthOptions onProviderSelect={handleOAuthSelect} />
            {oauthNotice && (
                <p className="mb-5 rounded-xl border border-cyan-300/15 bg-cyan-300/10 px-4 py-3 text-sm leading-6 text-cyan-100">
                    {oauthNotice}
                </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                    <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                        Email
                    </span>
                    <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                </label>
                <label className="block">
                    <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                        Password
                    </span>
                    <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                </label>
                {error && (
                    <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </p>
                )}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing in...' : 'Login'}
                </Button>
            </form>
        </AuthLayout>
    );
};

export default LoginPage;
