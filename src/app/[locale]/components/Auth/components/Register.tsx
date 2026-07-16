import React, { useState, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Triangle } from "react-loader-spinner";

import { useAuthModalStore } from "@/store/AuthModal/useAuthModalStore";
import { useUserStore } from "@/store/UserData/useUserStore";
import { register } from "@/api/Auth/PostRegister";
import { useRouter } from "@/i18n/navigation";
import { useCustomTranslations } from "@/lib/contexts/translations/translations-context";
import { TKeys } from "@/i18n/t-keys";

// Password rule test functions (pure, no strings)
const PASSWORD_RULE_TESTS = [
  (v: string) => v.length >= 8,
  (v: string) => /[A-ZА-ЯЁІЇЄҐ]/.test(v),
  (v: string) => /[a-zа-яёіїєґ]/.test(v),
  (v: string) => /\d/.test(v),
]

type RegisterFormData = { email: string; password: string; confirm_password: string; referalId?: string }

const RegisterModalFormComponent = () => {
  const { setUser } = useUserStore();
  const { referral_id, closeModal } = useAuthModalStore();
  const [isVisible, setIsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const { t } = useCustomTranslations(TKeys.auth.register);
  const { t: tValidation } = useCustomTranslations(TKeys.validation);
  const { t: tErrors } = useCustomTranslations(TKeys.errors);

  const passwordRules = useMemo(() => [
    { test: PASSWORD_RULE_TESTS[0], label: tValidation.passwordMin8 },
    { test: PASSWORD_RULE_TESTS[1], label: tValidation.passwordNeedsUppercase },
    { test: PASSWORD_RULE_TESTS[2], label: tValidation.passwordNeedsLowercase },
    { test: PASSWORD_RULE_TESTS[3], label: tValidation.passwordNeedsDigit },
  ], [tValidation]);

  const schema = useMemo(() => z.object({
    email: z.string().min(1, tValidation.emailRequired).email(tValidation.emailInvalid),
    password: z.string()
      .min(8, tValidation.passwordMin8)
      .refine((v) => /[A-ZА-ЯЁІЇЄҐ]/.test(v), tValidation.passwordNeedsUppercase)
      .refine((v) => /[a-zа-яёіїєґ]/.test(v), tValidation.passwordNeedsLowercase)
      .refine((v) => /\d/.test(v), tValidation.passwordNeedsDigit),
    confirm_password: z.string().min(1, tValidation.repeatPassword),
    referalId: z.string().optional(),
  }).refine((data) => data.password === data.confirm_password, {
    message: tValidation.passwordsMismatch,
    path: ['confirm_password'],
  }), [tValidation]);

  console.log(referral_id);

  const { mutate: handleRegister, isPending } = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setUser(data.user);
      closeModal(); // Close modal on successful registration
      router.push("/Trading-Chat");
    },
    onError: (error: any) => {
      console.error("Registration error details:", error);

      let errorMessage = t.errorGeneral;

      if (error?.response?.data) {
        const responseData = error.response.data;

        // Handle validation errors
        if (responseData.details) {
          const details = responseData.details;

          // Check for specific field errors
          if (details.email) {
            if (Array.isArray(details.email)) {
              errorMessage = details.email[0]; // Take first error message
            } else {
              errorMessage = details.email;
            }
          } else if (details.password) {
            if (Array.isArray(details.password)) {
              errorMessage = details.password[0];
            } else {
              errorMessage = details.password;
            }
          } else if (details.referalId) {
            if (Array.isArray(details.referalId)) {
              errorMessage = details.referalId[0];
            } else {
              errorMessage = details.referalId;
            }
          } else if (details.non_field_errors) {
            if (Array.isArray(details.non_field_errors)) {
              errorMessage = details.non_field_errors[0];
            } else {
              errorMessage = details.non_field_errors;
            }
          }
        }
        // Handle general error messages
        else if (responseData.error) {
          errorMessage = responseData.error;
        }
        // Handle other error formats
        else if (responseData.message) {
          errorMessage = responseData.message;
        }
      }

      // Translate common error messages
      if (errorMessage.includes("user with this email already exists")) {
        errorMessage = t.errorEmailExists;
      } else if (errorMessage.includes("This field may not be blank")) {
        errorMessage = t.errorFieldBlank;
      } else if (errorMessage.includes("This field is required")) {
        errorMessage = t.errorFieldRequired;
      } else if (errorMessage.includes("Ensure this field has at least")) {
        errorMessage = t.errorFieldMinChars;
      }

      setErrorMessage(errorMessage);
    },
  });

  const { control, handleSubmit } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      confirm_password: "",
      referalId: referral_id ? referral_id : "",
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    console.log("Form data submitted:", data);
    const registerData: any = {
      email: data.email,
      password: data.password,
    };

    // Only include referalId if it's not empty
    if (data.referalId && data.referalId.trim()) {
      registerData.referalId = data.referalId;
    }

    console.log("Data being sent to API:", registerData);
    handleRegister(registerData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3 className="mt-6 text-sm text-gray-500 font-medium text-center">
        {t.screenerPromo}
      </h3>
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <>
            <input
              {...field}
              type="text"
              inputMode="email"
              placeholder="Email"
              className="w-full mt-6 p-3 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none"
            />
            {fieldState.error && (
              <p className="text-red-500 text-sm">{fieldState.error.message}</p>
            )}
          </>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => {
          const value = field.value ?? "";
          return (
            <>
              <div className="relative">
                <input
                  {...field}
                  type={isVisible ? "text" : "password"}
                  placeholder={t.passwordPlaceholder}
                  autoComplete="new-password"
                  className="w-full mt-4 p-3 pr-12 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsVisible(!isVisible)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {isVisible ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <ul className="mt-2 space-y-1" aria-label={t.passwordRequirementsLabel}>
                {passwordRules.map((rule) => {
                  const ok = rule.test(value);
                  return (
                    <li
                      key={rule.label}
                      className={`text-xs flex items-center gap-2 ${
                        ok ? "text-green-400" : "text-gray-400"
                      }`}
                    >
                      <span aria-hidden>{ok ? "✓" : "○"}</span>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
              {fieldState.error && (
                <p className="text-red-500 text-sm">{fieldState.error.message}</p>
              )}
            </>
          );
        }}
      />

      <Controller
        control={control}
        name="confirm_password"
        render={({ field, fieldState }) => (
          <>
            <div className="relative">
              <input
                {...field}
                type={isVisible ? "text" : "password"}
                placeholder={t.confirmPasswordPlaceholder}
                className="w-full mt-4 p-3 pr-12 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {isVisible ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {fieldState.error && (
              <p className="text-red-500 text-sm">{fieldState.error.message}</p>
            )}
          </>
        )}
      />

      <button
        type="submit"
        disabled={isPending}
        className="w-full mt-4 bg-[#6A56E4] text-white p-3 rounded-3xl hover:shadow-xl flex items-center justify-center gap-2"
      >
        {isPending && (
          <Triangle
            visible={true}
            height={16}
            width={16}
            color="#fff"
            ariaLabel="triangle-loading"
          />
        )}
        <span>{t.submit}</span>
      </button>

      {errorMessage && (
        <div className="alert border-0 alert-danger mt-2 text-center text-sm text-red-500">
          {errorMessage}
        </div>
      )}

      <p className="mt-4 text-xs text-gray-500 text-center">
        {t.consent}{" "}
        <Link
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#D2D2FF] underline hover:text-[#6A56E4]"
        >
          {t.privacyPolicy}
        </Link>{" "}
        {t.consentSuffix}
      </p>
    </form>
  );
};

export default RegisterModalFormComponent;
