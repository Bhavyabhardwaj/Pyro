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
                    <Link className="font-medium text-[#8da2aa] hover:text-white transition duration-200" to="/register">
                        Create an account
                    </Link>
                </>
            }
        >
            <OAuthOptions onProviderSelect={handleOAuthSelect} />
            {oauthNotice && (
                <p className="mb-3.5 rounded-xl border border-[#8da2aa]/15 bg-[#8da2aa]/5 px-4 py-2.5 text-[12.5px] leading-[1.5] text-[#8da2aa]">
                    {oauthNotice}
                </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
                <label className="block">
                    <span className="mb-1.5 block text-[9.5px] font-mono uppercase tracking-[0.16em] text-[#6f6f69]">
                        Email
                    </span>
                    <Input
                    type="email"
                    placeholder="name@workspace.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                </label>
                <label className="block">
                    <span className="mb-1.5 block text-[9.5px] font-mono uppercase tracking-[0.16em] text-[#6f6f69]">
                        Password
                    </span>
                    <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                </label>
                {error && (
                    <p className="rounded-xl border border-rose-500/15 bg-rose-500/5 px-4 py-2.5 text-[12.5px] text-rose-300">
                        {error}
                    </p>
                )}
                <Button type="submit" className="w-full h-9.5 text-[12.5px] font-medium mt-1" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
            </form>
        </AuthLayout>
    );
};

export default LoginPage;
