import { useState } from "react";
import { useChangePassword } from "@workspace/api-client-react";
import { Button, Card, ErrorText, Field, TextInput } from "./ui";

export default function AccountEditor() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const changePassword = useChangePassword({
    mutation: {
      onSuccess: () => {
        setSuccess(true);
        setLocalError(null);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      },
      onError: () => {
        setSuccess(false);
      },
    },
  });

  return (
    <Card className="max-w-md">
      <h2 className="font-serif text-lg text-stone-900">
        Changer le mot de passe
      </h2>
      <p className="mt-1 text-sm text-stone-500">
        Mettez à jour le mot de passe de votre compte administrateur.
      </p>
      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSuccess(false);
          if (newPassword.length < 8) {
            setLocalError(
              "Le nouveau mot de passe doit comporter au moins 8 caractères.",
            );
            return;
          }
          if (newPassword !== confirmPassword) {
            setLocalError("Les nouveaux mots de passe ne correspondent pas.");
            return;
          }
          setLocalError(null);
          changePassword.mutate({ data: { currentPassword, newPassword } });
        }}
      >
        <Field label="Mot de passe actuel">
          <TextInput
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </Field>
        <Field label="Nouveau mot de passe" hint="Au moins 8 caractères">
          <TextInput
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </Field>
        <Field label="Confirmer le nouveau mot de passe">
          <TextInput
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Field>
        <Button
          type="submit"
          className="w-full"
          disabled={changePassword.isPending}
        >
          {changePassword.isPending ? "Enregistrement…" : "Changer le mot de passe"}
        </Button>
        {localError && <p className="mt-2 text-sm text-red-600">{localError}</p>}
        {!localError && <ErrorText error={changePassword.error} />}
        {success && (
          <p className="mt-2 text-sm text-green-700">
            Mot de passe mis à jour avec succès.
          </p>
        )}
      </form>
    </Card>
  );
}
