import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { Phone, ArrowLeft, CreditCard, Clock, Copy, Upload, Smartphone } from 'lucide-react';

const ClaroRechargePage = () => {
  const { user, logout } = useContext(AuthContext);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPixModal, setShowPixModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [timer, setTimer] = useState(0);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const claroPackages = [
    { paid: 30.00, received: 50.00 }
  ];
  
  const pixKey = "e0478dfb-0f3b-4837-977c-bc3a23622854";

  const handlePackageSelect = async (packageData) => {
    if (!phoneNumber) {
      toast.error('Digite o número do telefone primeiro');
      return;
    }
    
    try {
      const response = await axios.post('/transactions/claro-recharge', {
        phone_number: phoneNumber,
        amount_paid: packageData.paid,
        amount_received: packageData.received
      });
      
      setSelectedPackage(packageData);
      setCurrentTransaction(response.data);
      setShowPixModal(true);
      toast.success('Transação criada! Efetue o pagamento via PIX.');
    } catch (error) {
      toast.error('Erro ao criar transação: ' + (error.response?.data?.detail || 'Erro desconhecido'));
    }
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
      const formData = new FormData();
      formData.append('file', uploadFile);
      
      await axios.post(`/transactions/${currentTransaction.id}/upload-receipt`, formData, {
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

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Início
            </Link>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Recarga Claro</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Olá, {user?.name}</span>
            <Button onClick={logout} variant="outline" className="text-white border-white/20 hover:bg-white/10">
              Sair
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="glass-strong border-0 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-6 h-6 text-red-400" />
                <span>Número do Telefone</span>
              </CardTitle>
              <CardDescription className="text-gray-300">
                Digite o número que deseja recarregar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="phone" className="text-white">Número Claro</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="input-premium text-lg"
                  placeholder="(11) 99999-9999"
                  data-testid="claro-phone-input"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-strong border-0 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-6 h-6 text-red-400" />
                <span>Escolha o Pacote</span>
              </CardTitle>
              <CardDescription className="text-gray-300">
                Selecione o valor que deseja recarregar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {claroPackages.map((pkg, index) => (
                  <Button
                    key={index}
                    onClick={() => handlePackageSelect(pkg)}
                    className="w-full p-4 h-auto glass hover:bg-white/10 border border-white/10 text-left transition-all"
                    variant="ghost"
                    data-testid={`claro-package-${index}`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <div className="text-lg font-semibold text-white">
                          Pague R$ {pkg.paid.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-300">
                          Receba R$ {pkg.received.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-2xl font-bold gradient-text">
                        +{((pkg.received - pkg.paid) / pkg.paid * 100).toFixed(0)}%
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={showPixModal} onOpenChange={setShowPixModal}>
          <DialogContent className="glass-strong border-0 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl gradient-text">
                Pagamento via PIX
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="font-semibold mb-2">Detalhes da Recarga</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Telefone:</span>
                    <span>{phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Valor a pagar:</span>
                    <span className="text-green-400 font-semibold">R$ {selectedPackage?.paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Créditos:</span>
                    <span className="text-red-400 font-semibold">R$ {selectedPackage?.received.toFixed(2)}</span>
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
                Após o envio do comprovante, sua recarga será processada em até 5 minutos.
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ClaroRechargePage;