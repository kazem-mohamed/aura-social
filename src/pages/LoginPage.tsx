import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Controller, useForm } from "react-hook-form";
import { Link, useLocation } from "react-router";
import { getErrorMessage } from "@/shared/api/errors";
import { ObjectArt } from "@/shared/brand/ObjectArt";
import { Button } from "@/shared/kit/Button";
import { Field } from "@/shared/kit/Field";
import { PasswordField } from "@/shared/kit/PasswordField";
import { useToast } from "@/shared/kit/toast/useToast";
import { spring } from "@/shared/motion/tokens";
import { routes } from "@/app/router/routes";
import { AuthFrame } from "@/features/auth/components/AuthFrame";
import { useSignIn } from "@/features/auth/hooks/useAuthMutations";
import { loginSchema, type LoginFormValues } from "@/features/auth/model/auth.schemas";

/** Sign in. The guest guard moves you to the wall the moment the token lands. */
export default function LoginPage() {
  const location = useLocation();
  const signIn = useSignIn();
  const toast = useToast();
  const email = (location.state as { email?: string } | null)?.email ?? "";

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { email, password: "" },
  });

  // mutateAsync, not mutate: the page unmounts as soon as the session starts,
  // and mutate's own callbacks are dropped once their component is gone.
  const onSubmit = async (values: LoginFormValues) => {
    try {
      await signIn.mutateAsync(values);
      toast.show({ tone: "success", title: "Welcome back." });
    } catch (error) {
      toast.show({
        tone: "error",
        title: "Couldn’t sign you in",
        description: getErrorMessage(error, "Check your email and password, then try again."),
      });
    }
  };

  return (
    <AuthFrame
      title="Welcome back"
      lede="Your sticker’s right where you left it."
      art={
        <motion.div
          className="mt-4 w-[min(360px,72%)]"
          initial={{ opacity: 0, scale: 1.3, rotate: -18 }}
          animate={{ opacity: 1, scale: 1, rotate: -6 }}
          transition={{ ...spring.release, delay: 0.12 }}
        >
          <ObjectArt name="heart" sizes="360px" />
        </motion.div>
      }
      footer={
        <>
          New here?{" "}
          <Link to={routes.register} viewTransition className="font-bold text-ink underline decoration-1 underline-offset-4">
            Join the wall
          </Link>
        </>
      }
    >
      <form noValidate aria-label="Sign in" onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Field
              {...field}
              label="Email"
              type="email"
              iconStart="mail"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <PasswordField
              {...field}
              label="Password"
              autoComplete="current-password"
              placeholder="Your password"
              error={errors.password?.message}
            />
          )}
        />
        <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-1">
          Sign in
        </Button>
      </form>
    </AuthFrame>
  );
}
