import { login } from "@/api/Auth/PostAuth";
import React, { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUserStore } from "@/store/UserData/useUserStore";
import { useAuthModalStore } from "@/store/AuthModal/useAuthModalStore";
import { getProfile } from "@/api/Auth/getProfile";
import { Triangle } from "react-loader-spinner";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().min(1, "required field"),
  password: z.string().min(1, "required field"),
});
type LoginFormData = z.infer<typeof schema>;

const LoginModalFormComponent = () => {
  const { setUser } = useUserStore();
  const { closeModal } = useAuthModalStore();
  const [isVisible, setIsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

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

      let errorMessage = "Невірні облікові дані";

      if (error?.response?.data) {
        const responseData = error.response.data;

        // Handle specific error messages
        if (responseData.error) {
          errorMessage = responseData.error;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.detail) {
          errorMessage = responseData.detail;
        }
      }

      // Translate common error messages to Ukrainian
      if (errorMessage.includes("Invalid credentials")) {
        errorMessage = "Невірні облікові дані";
      } else if (errorMessage.includes("User is not active")) {
        errorMessage = "Обліковий запис не активний";
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
                  placeholder="Пароль"
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
          Продовжуючи, ви підтверджуєте, що згодні увійти до облікового запису
          PantheonX та надаєте згоду на обробку персональних даних
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
          Продовжити
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

      <p className="mt-4 text-center text-sm text-[#D2D2FF] cursor-pointer">
        Забули пароль?
      </p>
    </div>
  );
};

export default LoginModalFormComponent;
