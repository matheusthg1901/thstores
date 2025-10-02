import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { Phone, Mail, Lock, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/auth/login', formData);
      login(response.data.user, response.data.access_token);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Link>
          
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center mb-6 float">
            <Phone className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Bem-vindo de volta!
          </h1>
          <p className="text-gray-300">
            Entre na sua conta para continuar
          </p>
        </div>

        {/* Login Form */}
        <Card className="glass-strong border-0 text-white">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-white">Entrar</CardTitle>
            <CardDescription className="text-gray-300">
              Digite suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-premium"
                  placeholder="seu@email.com"
                  data-testid="login-email-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Senha</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-premium"
                  placeholder="••••••••"
                  data-testid="login-password-input"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full btn-premium text-lg py-3"
                data-testid="login-submit-button"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="spinner w-5 h-5"></div>
                    <span>Entrando...</span>
                  </div>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Não tem uma conta?{' '}
                <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                  Criar conta
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Admin Access */}
        <div className="mt-8 text-center">
          <Link 
            to="/admin-login" 
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            Acesso Administrativo
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;