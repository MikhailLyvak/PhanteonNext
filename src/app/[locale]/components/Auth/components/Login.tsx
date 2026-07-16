import { login } from "@/api/Auth/PostAuth";
import React, { useCallback, useState, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUserStore } from "@/store/UserData/useUserStore";
import { useAuthModalStore } from "@/store/AuthModal/useAuthModalStore";
import { getProfile } from "@/api/Auth/getProfile";
import { Triangle } from "react-loader-spinner";
import { useRouter } from "@/i18n/navigation";
import { useCustomTranslations } from "@/lib/contexts/translations/translations-context";
import { TKeys } from "@/i18n/t-keys";

type LoginFormData = { email: string; password: string }

const LoginModalFormComponent = () => {
  const { setUser } = useUserStore();
  const { closeModal } = useAuthModalStore();
  const [isVisible, setIsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const { t } = useCustomTranslations(TKeys.auth.login);
  const { t: tValidation } = useCustomTranslations(TKeys.validation);
  const { t: tErrors } = useCustomTranslations(TKeys.errors);

  const schema = useMemo(() => z.object({
    email: z.string().min(1, tValidation.emailRequired),
    password: z.string().min(1, tValidation.passwordConfirmationRequired),
  }), [tValidation]);

  const { mutate: handleLogin, isPending } = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      const profileData = await getProfile();
      setUser(profileData);
      closeModal();
      router.push("/Trading-Chat");
    },
    onError: (error: any) => {
      console.error("Login error details:", error);

      let errorMessage = tErrors.invalidCredentials;

      if (error?.response?.data) {
        const responseData = error.response.data;

        if (responseData.error) {
          errorMessage = responseData.error;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.detail) {
          errorMessage = responseData.detail;
        }
      }

      if (errorMessage.includes("Invalid credentials")) {
        errorMessage = tErrors.invalidCredentials;
      } else if (errorMessage.includes("User is not active")) {
        errorMessage = tErrors.userNotActive;
      }

      setErrorMessage(errorMessage);
    },
  });

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    handleLogin(data);
  };

  return (
    <div>
      <form method="post">
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <>
              <input
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  setErrorMessage(null);
                }}
                type="text"
                inputMode="email"
                placeholder="Email"
                className="w-full mt-6 p-3 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none"
              />
              {fieldState.error && (
                <p className="text-red-500 text-sm">
                  {fieldState.error.message}
                </p>
              )}
            </>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <>
              <div className="relative">
                <input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setErrorMessage(null);
                  }}
                  type={isVisible ? "text" : "password"}
                  placeholder={t.passwordPlaceholder}
                  autoComplete="current-password"
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
                <p className="text-red-500 text-sm">
                  {fieldState.error.message}
                </p>
              )}
            </>
          )}
        />
        <p className="mt-4 text-xs text-gray-500 text-center">
          {t.consent}
        </p>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-4 bg-[#6A56E4] text-white p-3 rounded-3xl hover:shadow-xl flex items-center justify-center gap-2"
          onClick={handleSubmit(onSubmit)}
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
          {t.submit}
        </button>
      </form>

      {errorMessage && (
        <div
          className="alert border-0 text-sm text-red-500 mt-2 text-center"
          role="alert"
        >
          <strong>{errorMessage}</strong>
        </div>
      )}

      <Link
        href="/forgotPassword"
        onClick={closeModal}
        className="mt-4 block text-center text-sm text-[#D2D2FF] hover:underline"
      >
        {t.forgotPassword}
      </Link>
    </div>
  );
};

export default LoginModalFormComponent;
