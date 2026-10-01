import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { getErrorMessage } from "@/shared/api/errors";
import { identityFor } from "@/shared/brand/identity";
import { latestDateForMinimumAge, parseDateInput, toIsoDateOnly } from "@/shared/lib/dates";
import { Button } from "@/shared/kit/Button";
import { DateField } from "@/shared/kit/DateField";
import { Field } from "@/shared/kit/Field";
import { PasswordField } from "@/shared/kit/PasswordField";
import { RadioPills } from "@/shared/kit/RadioPills";
import { RuleList } from "@/shared/kit/RuleList";
import { useToast } from "@/shared/kit/toast/useToast";
import { routes } from "@/app/router/routes";
import { AuthFrame } from "@/features/auth/components/AuthFrame";
import { IdentityPreview } from "@/features/auth/components/IdentityPreview";
import { useSignUp } from "@/features/auth/hooks/useAuthMutations";
import { registerSchema, type RegisterFormValues } from "@/features/auth/model/auth.schemas";
import { passwordRules } from "@/features/auth/model/passwordRules";

const REDIRECT_DELAY_MS = 1200;
/** Name and username are both capped at 15 by the API schema. */
const MAX_NAME = 15;

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

/** Join. The username you type decides your sticker, live, before you commit to it. */
export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const signUp = useSignUp();
  const toast = useToast();
  const [joined, setJoined] = useState(false);
  const claimed = (location.state as { handle?: string } | null)?.handle ?? "";

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      username: claimed.replace(/^@/, "").slice(0, MAX_NAME),
      email: "",
      password: "",
      rePassword: "",
      gender: undefined,
      dateOfBirth: undefined,
    },
  });

  const [name, username, password] = useWatch({ control, name: ["name", "username", "password"] });
  const identity = identityFor(username.trim() || "you");

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await signUp.mutateAsync({
        name: values.name,
        username: values.username,
        email: values.email,
        dateOfBirth: toIsoDateOnly(values.dateOfBirth),
        gender: values.gender,
        password: values.password,
        rePassword: values.rePassword,
      });
      setJoined(true);
      toast.show({ tone: "success", title: "You’re on the wall.", description: "Sign in to stick around." });
      // A beat to see the tick, then on to sign in with the email filled in.
      window.setTimeout(() => navigate(routes.login, { state: { email: values.email }, viewTransition: true }), REDIRECT_DELAY_MS);
    } catch (error) {
      toast.show({
        tone: "error",
        title: "Couldn’t create your account",
        description: getErrorMessage(error, "Check the fields above and try again."),
      });
    }
  };

  return (
    <AuthFrame
      title="Join the wall"
      lede="Pick a username. It picks your sticker."
      art={
        <figure className="mt-2 grid justify-items-start gap-5">
          <IdentityPreview username={username} name={name} size={240} />
          <figcaption className="max-w-[38ch] type-body text-ink-2">
            <span className="font-bold text-ink capitalize">
              {identity.color.name} · {identity.shape}.
            </span>{" "}
            Your username decides the colour and the shape. Nobody picks it — not even you.
          </figcaption>
        </figure>
      }
      footer={
        <>
          Already have a sticker?{" "}
          <Link to={routes.login} viewTransition className="font-bold text-ink underline decoration-1 underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <form noValidate aria-label="Join Aura" onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
        <div className="flex items-center gap-4 lg:hidden">
          <IdentityPreview username={username} name={name} size={72} />
          <p className="type-caption text-ink-2">
            <span className="block text-[15px] font-bold text-ink capitalize">
              {identity.color.name} · {identity.shape}
            </span>
            Your username picks your sticker.
          </p>
        </div>

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Field
              {...field}
              label="Name"
              autoComplete="name"
              placeholder="What people call you"
              maxLength={MAX_NAME}
              counter={{ value: name.length, max: MAX_NAME }}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <Field
              {...field}
              label="Username"
              iconStart="at"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="your.handle"
              maxLength={MAX_NAME}
              counter={{ value: username.length, max: MAX_NAME }}
              ringColor={identity.color.hex}
              error={errors.username?.message}
            />
          )}
        />
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
        <div className="grid gap-3">
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <PasswordField
                {...field}
                label="Password"
                autoComplete="new-password"
                placeholder="Choose a password"
                error={errors.password?.message}
              />
            )}
          />
          <RuleList rules={passwordRules(password)} />
        </div>
        <Controller
          name="rePassword"
          control={control}
          render={({ field }) => (
            <PasswordField
              {...field}
              label="Repeat password"
              autoComplete="new-password"
              placeholder="Same again"
              error={errors.rePassword?.message}
            />
          )}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <DateField
                label="Date of birth"
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value ? toIsoDateOnly(field.value) : ""}
                onChange={(event) => field.onChange(parseDateInput(event.target.value) ?? undefined)}
                max={latestDateForMinimumAge(12)}
                error={errors.dateOfBirth?.message}
              />
            )}
          />
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <RadioPills
                label="Gender"
                name={field.name}
                ref={field.ref}
                value={field.value}
                options={GENDER_OPTIONS}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.gender?.message}
              />
            )}
          />
        </div>
        <Button type="submit" size="lg" fullWidth loading={isSubmitting} success={joined} disabled={joined} className="mt-1">
          {joined ? "You’re in" : "Join Aura"}
        </Button>
      </form>
    </AuthFrame>
  );
}
