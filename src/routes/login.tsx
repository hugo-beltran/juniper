import { useState, type FormEvent } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Card, Input, Select } from "@/components";
import { defaultTenant, firstRoute, navigationQuery } from "@/lib/api";
import styles from "./login.module.css";

export const Route = createFileRoute("/login")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(navigationQuery),
  component: LoginPage,
});

/* Login demo — the first screen composed entirely from registry primitives
 * (Input, Select, Button, Card). No auth: signing in lands on the chosen
 * tenant's first route. The route owns layout and state, never a token;
 * validation is the primitives' own FieldError, shown once the user has
 * tried to submit. */
function LoginPage() {
  const navigate = useNavigate();
  const { data: tree } = useSuspenseQuery(navigationQuery);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenant, setTenant] = useState(defaultTenant(tree).id);
  const [attempted, setAttempted] = useState(false);

  const missingEmail = email.trim() === "";
  const missingPassword = password === "";

  const signIn = (event: FormEvent) => {
    event.preventDefault();
    if (missingEmail || missingPassword) {
      setAttempted(true);
      return;
    }
    const target = tree.tenants.find((t) => t.id === tenant);
    navigate({ to: (target && firstRoute(target)) ?? "/dashboard" });
  };

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <div className={styles.brand}>
          <h1>Juniper</h1>
          <p className={styles.sub}>Sign in to your workspace.</p>
        </div>
        <form className={styles.form} onSubmit={signIn} noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="username"
            placeholder="you@club.example"
            value={email}
            onChange={setEmail}
            isRequired
            isInvalid={attempted && missingEmail}
            errorMessage="Enter your email"
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            isRequired
            isInvalid={attempted && missingPassword}
            errorMessage="Enter your password"
          />
          <Select
            label="Workspace"
            options={tree.tenants.map((t) => ({
              value: t.id,
              label: t.name,
              hint: t.plan,
            }))}
            value={tenant}
            onChange={setTenant}
            description="Where you land after signing in."
          />
          <div className={styles.actions}>
            <Button type="submit">Sign in</Button>
            <Button variant="discrete" asChild>
              <Link to="/dashboard">Continue as guest</Link>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
