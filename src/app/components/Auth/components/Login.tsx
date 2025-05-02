import { login } from '@/api/Auth/PostAuth';
import React, { useCallback, useState } from 'react'
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUserStore } from '@/store/UserData/useUserStore';
import { getProfile } from '@/api/Auth/getProfile';
import { Triangle } from 'react-loader-spinner'

const schema = z.object({
  email: z.string().min(1, 'required field'),
  password: z.string().min(1, 'required field'),
});
type LoginFormData = z.infer<typeof schema>;

const LoginModalFormComponent = () => {
  const { setUser } = useUserStore();
  const [isVisible, setIsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<boolean>(false);

  const { mutate: handleLogin, isPending } = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      const profileData = await getProfile();
      setUser(profileData);
    },
    onError: (error: any) => {
      setErrorMessage(true);
    },
  });

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
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
                  setErrorMessage(false);
                }}
                type="text"
                inputMode="email"
                placeholder="Email"
                className="w-full mt-4 p-3 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none"
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
          render={({ field, fieldState }) => (
            <>
              <input
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  setErrorMessage(false);
                }}
                type={isVisible ? 'text' : 'password'}
                placeholder="Пароль"
                autoComplete="current-password"
                className="w-full mt-4 p-3 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none"
              />
              {fieldState.error && (
                <p className="text-red-500 text-sm">{fieldState.error.message}</p>
              )}
            </>
          )}
        />
        <p className="mt-4 text-xs text-gray-500 text-center">
          Продовжуючи, ви підтверджуєте, що згодні увійти до облікового запису
          Vitalis Balance та надаєте згоду на обробку персональних даних
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
        <div className="alert border-0 text-sm text-red-500 mt-2 text-center" role="alert">
          <strong>Wrong credentials!</strong> Check your <b>email</b> or <b>password</b>
        </div>
      )}


      <p className="mt-4 text-center text-sm text-[#D2D2FF] cursor-pointer">
        Забули пароль?
      </p>
    </div>
  );
};

export default LoginModalFormComponent;

