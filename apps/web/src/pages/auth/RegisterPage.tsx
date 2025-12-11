import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { Sparkles, ArrowRight, Lock, Mail, User, CheckCircle2 } from 'lucide-react';

const registerSchema = z.object({
  displayName: z.string().min(2, 'Минимум 2 символа').max(255, 'Максимум 255 символов'),
  email: z.string().email('Введите корректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(data.email, data.password, data.displayName);
      toast('Аккаунт успешно создан!', 'success');
      navigate('/app', { replace: true });
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast(error.detail, 'error');
      } else {
        toast('Произошла ошибка при регистрации', 'error');
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
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />


        <div className="relative">

          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </motion.div>
              <span className="text-sm text-emerald-400 font-medium">Начните бесплатно</span>
            </div>
          </motion.div>


          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Присоединяйтесь к <span className="bg-gradient-to-r from-phoenix-400 to-phoenix-600 bg-clip-text text-transparent">Phoenix</span>
            </h1>
            <p className="text-zinc-400 text-lg">
              Создайте вечные страницы памяти о близких
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
                  <User className="w-4 h-4 text-phoenix-400" />
                  <span>Ваше имя</span>
                </div>
              </label>
              <Input
                type="text"
                placeholder="Иван Петров"
                error={errors.displayName?.message}
                className="h-12 text-base"
                {...register('displayName')}
              />
            </div>

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
                placeholder="Минимум 8 символов"
                error={errors.password?.message}
                className="h-12 text-base"
                {...register('password')}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-phoenix-400" />
                  <span>Подтвердите пароль</span>
                </div>
              </label>
              <PasswordInput
                placeholder="Повторите пароль"
                error={errors.confirmPassword?.message}
                className="h-12 text-base"
                {...register('confirmPassword')}
              />
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="pt-2"
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
                      Создать аккаунт бесплатно
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </>
                )}
              </Button>
            </motion.div>
          </motion.form>


          <motion.div
            className="mt-6 grid grid-cols-3 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[
              { icon: '', text: 'Навсегда бесплатно' },
              { icon: 'Lock', text: 'Безопасно' },
              { icon: 'Fast', text: 'За 2 минуты' },
            ].map((item, i) => (
              <motion.div
                key={item.text}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/[0.02]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <div className="text-lg">{item.icon}</div>
                <div className="text-[10px] text-zinc-500 text-center leading-tight">{item.text}</div>
              </motion.div>
            ))}
          </motion.div>


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
            transition={{ delay: 0.7 }}
          >
            <p className="text-zinc-400">
              Уже есть аккаунт?{' '}
              <Link
                to="/auth/login"
                className="text-phoenix-400 hover:text-phoenix-300 font-semibold transition-colors inline-flex items-center gap-1 group"
              >
                Войти
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>


      <motion.div
        className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Полностью бесплатно для семей</div>
            <div className="text-xs text-zinc-500">Без скрытых платежей и подписок</div>
          </div>
        </div>
        <div className="text-xs text-zinc-500 leading-relaxed">
          Создавайте неограниченное количество страниц памяти. Храните фото, видео и истории без ограничений.
        </div>
      </motion.div>
    </div>
  );
}
