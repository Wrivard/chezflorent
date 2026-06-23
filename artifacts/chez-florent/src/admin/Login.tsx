import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useLogin,
  getGetCurrentAdminQueryKey,
} from "@workspace/api-client-react";
import { Button, Card, ErrorText, Field, TextInput } from "./ui";

export default function Login() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useLogin({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetCurrentAdminQueryKey(),
        });
      },
    },
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, rgba(216,90,44,0.14), transparent 60%)",
        }}
      />
      <Card className="relative w-full max-w-sm border-border-strong">
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="/logo.png"
            alt="Chez Florent"
            className="mb-3 h-20 w-auto object-contain"
          />
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-orange">
            <span aria-hidden="true">✶ </span>Espace de gestion
          </p>
          <p className="mt-1 text-sm text-cream-soft/55">
            Connectez-vous pour gérer le contenu du site
          </p>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            login.mutate({ data: { email, password } });
          }}
        >
          <Field label="Courriel">
            <TextInput
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Mot de passe">
            <TextInput
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? "Connexion…" : "Se connecter"}
          </Button>
          <ErrorText error={login.error} />
        </form>
      </Card>
    </div>
  );
}
