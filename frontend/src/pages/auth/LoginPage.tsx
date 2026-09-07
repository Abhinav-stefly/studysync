import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Wrong email or password. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 border-l-2 border-signal pl-4">
          <h1 className="font-display text-3xl text-ink">StudySync</h1>
          <p className="mt-1 font-sans text-sm text-ink/60">Pick up where you left off.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block font-sans text-sm text-ink/70">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-ink/20 bg-white px-3 py-2 font-sans text-ink focus:border-signal focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-sans text-sm text-ink/70">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-ink/20 bg-white px-3 py-2 font-sans text-ink focus:border-signal focus:outline-none"
            />
          </div>

          {error && <p className="font-sans text-sm text-rust">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-signal py-2 font-sans font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 font-sans text-sm text-ink/60">
          New here? <Link to="/register" className="text-signal underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
};