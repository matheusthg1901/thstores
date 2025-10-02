import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { Shield, User, Lock, ArrowLeft } from 'lucide-react';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useContext(AuthContext);
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
      const response = await axios.post('/auth/admin-login', formData);
      loginAdmin(response.data.admin, response.data.access_token);
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao fazer login administrativo');
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
          
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mb-6 float pulse-glow">
            <Shield className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-red-400 mb-2">
            Acesso Administrativo
          </h1>
          <p className="text-gray-300">
            Área restrita para administradores
          </p>
        </div>

        {/* Admin Login Form */}
        <Card className="glass-strong border-0 text-white border-red-500/20">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-white flex items-center justify-center space-x-2">
              <Shield className="w-6 h-6 text-red-400" />
              <span>Login Admin</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Digite suas credenciais administrativas
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Usuário</span>
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="input-premium border-red-500/30 focus:border-red-400"
                  placeholder="Nome de usuário"
                  data-testid="admin-username-input"
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
                  className="input-premium border-red-500/30 focus:border-red-400"
                  placeholder="••••••••"
                  data-testid="admin-password-input"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full btn-danger text-lg py-3"
                data-testid="admin-login-submit-button"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="spinner w-5 h-5"></div>
                    <span>Autenticando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Entrar como Admin</span>
                  </div>
                )}
              </Button>
            </form>
            
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-300 text-center">
                ⚠️ Esta área é restrita apenas para administradores autorizados
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to user login */}
        <div className="mt-8 text-center">
          <Link 
            to="/login" 
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            ← Voltar para login normal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;