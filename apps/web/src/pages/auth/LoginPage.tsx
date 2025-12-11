import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { ApiClientError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useToast } from '@/components/ui/Toast';
import { Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast('Добро пожаловать!', 'success');
      navigate(from, { replace: true });
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast(error.detail, 'error');
      } else {
        toast('Произошла ошибка при входе', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">

      <motion.div
        className="relative p-8 md:p-10 rounded-3xl bg-surface-50/80 backdrop-blur-xl border border-white/10 overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >

        <div className="absolute top-0 right-0 w-64 h-64 bg-phoenix-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />


        <div className="relative">

          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-phoenix-500/10 border border-phoenix-500/20">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-phoenix-400" />
              </motion.div>
              <span className="text-sm text-phoenix-400 font-medium">Добро пожаловать</span>
            </div>
          </motion.div>


          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Вход в <span className="bg-gradient-to-r from-phoenix-400 to-phoenix-600 bg-clip-text text-transparent">Phoenix</span>
            </h1>
            <p className="text-zinc-400 text-lg">
              Продолжите сохранять память о близких
            </p>
          </motion.div>


          <motion.form
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-phoenix-400" />
                  <span>Email</span>
                </div>
              </label>
              <Input
                type="email"
                placeholder="email@example.com"
                error={errors.email?.message}
                className="h-12 text-base"
                {...register('email')}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-phoenix-400" />
                  <span>Пароль</span>
                </div>
              </label>
              <PasswordInput
                placeholder="--------"
                error={errors.password?.message}
                className="h-12 text-base"
                {...register('password')}
              />
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full h-14 text-lg font-semibold relative overflow-hidden group"
                isLoading={isLoading}
              >
                {!isLoading && (
                  <>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                    <span className="relative flex items-center justify-center gap-2">
                      Войти в аккаунт
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </>
                )}
              </Button>
            </motion.div>
          </motion.form>


          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-surface-50 text-zinc-500">или</span>
            </div>
          </div>


          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-zinc-400">
              Нет аккаунта?{' '}
              <Link
                to="/auth/register"
                className="text-phoenix-400 hover:text-phoenix-300 font-semibold transition-colors inline-flex items-center gap-1 group"
              >
                Создать бесплатно
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>


      <motion.div
        className="mt-8 grid grid-cols-3 gap-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        {[
          { icon: 'Lock', text: 'Безопасно' },
          { icon: 'Fast', text: 'Быстро' },
          { icon: '', text: 'Бесплатно' },
        ].map((item, i) => (
          <motion.div
            key={item.text}
            className="p-3 rounded-xl bg-white/[0.02] border border-white/5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-xs text-zinc-500">{item.text}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
