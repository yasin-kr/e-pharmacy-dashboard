import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../context/AuthContext";
import { DEMO_CREDENTIALS } from "../data/auth";
import Icon from "../components/Icon";
import { LoadingState } from "../components/Table";

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Enter a valid email address.")
    .required("Email is required."),
  password: yup
    .string()
    .required("Password is required.")
    .min(6, "Use at least 6 characters."),
});

export default function LoginPage() {
  const { user, loading, login, isDemo, error } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loginError, setLoginError] = useState("");
  const location = useLocation();
  const requestedLocation = location.state?.from;
  const destination = requestedLocation
    ? `${requestedLocation.pathname}${requestedLocation.search || ""}`
    : "/home";
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  useEffect(() => {
    document.title = "Log in | E-Pharmacy";
  }, []);
  if (loading) return <LoadingState label="Restoring your session…" />;
  if (user) return <Navigate to={destination} replace />;

  async function onSubmit(values) {
    setLoginError("");
    try {
      await login(values.email, values.password);
    } catch (failure) {
      setLoginError(failure.message);
    }
  }

  function fillDemo() {
    setValue("email", DEMO_CREDENTIALS.email, { shouldValidate: true });
    setValue("password", DEMO_CREDENTIALS.password, { shouldValidate: true });
    setLoginError("");
  }

  return (
    <main className="login-page">
      <Link to="/" className="login-brand" aria-label="E-Pharmacy home">
        <Icon name="logo" />
        <span>E-Pharmacy</span>
      </Link>
      <div className="login-content">
        <div className="login-intro">
          <img
            className="login-pill"
            src="/images/pill.png"
            width="184"
            height="177"
            alt=""
            fetchPriority="high"
          />
          <h1>
            Your medication,
            <br />
            delivered Say goodbye
            <br />
            to all <span>your healthcare</span>
            <br />
            worries with us
          </h1>
        </div>
        <form
          className="login-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-label="Log in"
        >
          <div className="login-field">
            <label className="sr-only" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email address"
              autoComplete="username"
              {...register("email")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p className="field-error" id="email-error">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="login-field">
            <label className="sr-only" htmlFor="password">
              Password
            </label>
            <div className="password-field">
              <input
                id="password"
                type={visible ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                {...register("password")}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
                onClick={() => setVisible(!visible)}
              >
                <Icon name={visible ? "eye-off" : "eye"} />
              </button>
            </div>
            {errors.password && (
              <p className="field-error" id="password-error">
                {errors.password.message}
              </p>
            )}
          </div>
          {(loginError || error) && (
            <p className="form-error" role="alert">
              {loginError || error}
            </p>
          )}
          <button
            className="button button-primary login-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in…" : "Log in"}
          </button>
          {isDemo && (
            <div className="demo-access">
              <p>Demo workspace · saved in this browser</p>
              <button type="button" onClick={fillDemo}>
                Use demo credentials
              </button>
            </div>
          )}
        </form>
      </div>
      <div className="login-decoration" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </main>
  );
}
