import { useState } from "react";
import { authService } from "../services/auth.service";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AuthLayout } from "../components/auth/AuthLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { OAuthOptions } from "../components/auth/OAuthOptions";
import type { OAuthProvider } from "../components/auth/oauth-providers";

const RegisterPage = () => {
    const [username, setUsername] = useState('');
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
            `${provider.id === 'google' ? 'Google' : 'GitHub'} onboarding is ready for backend OAuth integration.`,
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setOauthNotice('');
        setIsSubmitting(true);
        try {
            const response = await authService.register({ username, email, password });
            login(response.data.user, response.data.token);
            navigate('/chat');
        } catch (error) {
            console.error('Registration failed:', error);
            setError('Unable to create your account. Try another email or username.');
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <AuthLayout
            title="Create your workspace"
            subtitle="Register once, then start organizing realtime rooms for your conversations."
            footer={
                <>
                    Already have an account?{" "}
                    <Link className="font-medium text-zinc-200 hover:text-white" to="/login">
                        Sign in
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
                        Username
                    </span>
                    <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                </label>
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
                    minLength={6}
                />
                </label>
                {error && (
                    <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </p>
                )}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating account...' : 'Register'}
                </Button>
            </form>
        </AuthLayout>
    );
};

export default RegisterPage;
