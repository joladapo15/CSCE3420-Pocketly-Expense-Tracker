import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/authLayout";
import Input from "../components/input";
import PasswordInput from "../components/passwordInput";
import Button from "../components/button";
import "./signup.css";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    school: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Enter a valid email address.";
    if (!form.phone.trim()) errs.phone = "Phone number is required.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    else if (!/\d/.test(form.password))
      errs.password = "Password must include a number.";
    if (!form.confirmPassword)
      errs.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          school: form.school,
          password: form.password,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors({
          form: data.message || "Something went wrong. Try again.",
        });
      } else {
        navigate("/dashboard");
      }
    } catch {
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="A few details, and you're ready to get started."
    >
      <form className="signup-form" onSubmit={handleSubmit}>
        {errors.form && <p className="signup-form-error">{errors.form}</p>}

        <Input
          label="Full name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          error={errors.name}
          required
        />

        <Input
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          error={errors.email}
          required
        />

        <Input
          label="Phone number"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="(555) 000-0000"
          prefix="+1"
          error={errors.phone}
          required
        />

        <Input
          label="Your school (optional)"
          name="school"
          value={form.school}
          onChange={handleChange}
          placeholder="Enter your school name"
        />

        <PasswordInput
          label="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Create a password"
          helperText="Use at least 8 characters, including a number."
          error={errors.password}
          required
        />

        <PasswordInput
          label="Confirm password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter your password"
          error={errors.confirmPassword}
          required
        />

        <p className="signup-terms">
          By creating an account, you agree to our{" "}
          <a href="/terms" className="signup-terms-link">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="signup-terms-link">
            Privacy Policy
          </a>
          .
        </p>

        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? "Creating account…" : "Create account →"}
        </Button>

        <p className="signup-switch">
          Already have an account?{" "}
          <Link to="/login" className="signup-switch-link">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
