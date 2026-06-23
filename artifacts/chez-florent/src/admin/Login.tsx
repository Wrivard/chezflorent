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
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="font-serif text-2xl text-stone-900">Chez Florent</h1>
          <p className="mt-1 text-sm text-stone-500">
            Espace de gestion du contenu
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
