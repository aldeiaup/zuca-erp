import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, User, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Palavra-passe obrigatória'),
});

type LoginForm = z.infer<typeof loginSchema>;

const backgroundImages = [
  '/images/carros/IMG-20240314-WA0083-1-768x1024.jpg',
  '/images/carros/carro-768x1024.jpg',
  '/images/carros/trolerdepoisfrente-768x1024.jpg',
];

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [currentBg, setCurrentBg] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      const success = login(data.email, data.password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Email ou palavra-passe incorretos');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {backgroundImages.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentBg ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${img})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </div>
        ))}
        
        <div className="relative z-10 p-12 flex flex-col justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-2xl overflow-hidden bg-gray-900/80">
              <img src="/images/logotipo.png" alt="Zuca Motors" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">ZUCAMOTORS</h1>
              <p className="text-gold-400 text-sm font-medium">Premium Automotive Solutions</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <blockquote className="text-white/90 text-xl leading-relaxed font-light border-l-4 border-gold-500 pl-6">
              "Excelência em cada detalhe, tradição em cada serviço. A referência em oficinas 
              premium em Angola."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gold-500/20 border-2 border-gold-500 flex items-center justify-center">
                <span className="text-gold-400 font-bold">AO</span>
              </div>
              <div>
                <p className="text-white font-semibold">Luanda, Angola</p>
                <p className="text-white/60 text-sm">Desde 2010</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl overflow-hidden bg-gray-900/80">
              <img src="/images/logotipo.png" alt="Zuca Motors" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">ZUCAMOTORS</h1>
              <p className="text-gold-400 text-xs font-medium">ERP System</p>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo</h2>
            <p className="text-gray-400">Aceda ao seu painel de gestão</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="seu@email.com"
                  className="input-field pl-12"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Palavra-passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  A entrar...
                </>
              ) : (
                'Entrar'
              )}
            </button>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm mb-2 font-medium">Credenciais de teste:</p>
              <p className="text-gray-300 text-xs"><span className="text-gold-400">Admin:</span> admin@zucamotors.ao / admin123</p>
              <p className="text-gray-300 text-xs"><span className="text-gold-400">Gerente:</span> gerente@zucamotors.ao / gerente123</p>
            </div>
          </form>

          <p className="text-center text-gray-500 text-sm">
            © 2024 Zucamotors Angola. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
