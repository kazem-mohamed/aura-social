import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { getErrorMessage } from "@/shared/api/errors";
import { Button } from "@/shared/kit/Button";
import { PasswordField } from "@/shared/kit/PasswordField";
import { RuleList } from "@/shared/kit/RuleList";
import { useToast } from "@/shared/kit/toast/useToast";
import { useChangePassword } from "../hooks/useAuthMutations";
import { changePasswordSchema, type ChangePasswordFormValues } from "../model/auth.schemas";
import { passwordRules } from "../model/passwordRules";

/** Change the password. The new token is kept, so the session carries on. */
export function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const toast = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const newPassword = useWatch({ control, name: "newPassword" });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      const result = await changePassword.mutateAsync({ password: values.currentPassword, newPassword: values.newPassword });
      reset();
      toast.show({ tone: "success", title: "Password changed.", description: result.message ?? "Use the new one next time you sign in." });
    } catch (error) {
      toast.show({
        tone: "error",
        title: "Couldn’t change your password",
        description: getErrorMessage(error, "Check your current password and try again."),
      });
    }
  };

  return (
    <form noValidate aria-label="Change password" onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
      <Controller
        name="currentPassword"
        control={control}
        render={({ field }) => (
          <PasswordField {...field} label="Current password" autoComplete="current-password" error={errors.currentPassword?.message} />
        )}
      />
      <div className="grid gap-3">
        <Controller
          name="newPassword"
          control={control}
          render={({ field }) => (
            <PasswordField {...field} label="New password" autoComplete="new-password" error={errors.newPassword?.message} />
          )}
        />
        <RuleList rules={passwordRules(newPassword)} />
      </div>
      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <PasswordField {...field} label="Repeat new password" autoComplete="new-password" error={errors.confirmPassword?.message} />
        )}
      />
      <Button type="submit" loading={isSubmitting} className="justify-self-start">
        Update password
      </Button>
    </form>
  );
}
