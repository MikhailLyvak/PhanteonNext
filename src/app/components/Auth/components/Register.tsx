import React, { useState } from 'react';
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Triangle } from 'react-loader-spinner'

import { useAuthModalStore } from '@/store/AuthModal/useAuthModalStore';
import { useUserStore } from '@/store/UserData/useUserStore';
import { register } from '@/api/Auth/PostRegister';
import { useMainDrawerStore } from '@/store/Nav/useMainDrawerStore';

const schema = z
  .object({
    email: z.string().min(1, 'Email обовʼязковий').email('Невірний формат email'),
    password: z.string().min(6, 'Мінімум 6 символів'),
    confirm_password: z.string().min(6, 'Мінімум 6 символів'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Паролі не співпадають',
    path: ['confirm_password'],
  });

type RegisterFormData = z.infer<typeof schema>;

const RegisterModalFormComponent = () => {
  const { setUser } = useUserStore();
  const [isVisible, setIsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate: handleRegister, isPending } = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setUser(data.user);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.detail || 'Сталася помилка при реєстрації';
      setErrorMessage(msg);
    },
  });

  const { control, handleSubmit } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      confirm_password: '',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    handleRegister({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
              type={isVisible ? 'text' : 'password'}
              placeholder="Пароль"
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
        name="confirm_password"
        render={({ field, fieldState }) => (
          <>
            <input
              {...field}
              type={isVisible ? 'text' : 'password'}
              placeholder="Повторіть пароль"
              className="w-full mt-4 p-3 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none"
            />
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
        <span>Реєстрація</span>
      </button>

      {errorMessage && (
        <div className="alert border-0 alert-danger mt-2 text-center text-sm text-red-500">
          {errorMessage}
        </div>
      )}

      <p className="mt-4 text-xs text-gray-500 text-center">
        Натискаючи «Реєстрація», ви погоджуєтесь з обробкою персональних даних.
      </p>
    </form>
  );
};

export default RegisterModalFormComponent;
