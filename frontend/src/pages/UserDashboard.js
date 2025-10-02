import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { User, Phone, CreditCard, ArrowLeft, Plus, Smartphone, Building, Download } from 'lucide-react';

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/user/transactions');
      setTransactions(response.data);
    } catch (error) {
      toast.error('Erro ao carregar transações: ' + (error.response?.data?.detail || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendente', className: 'badge-pending' },
      paid: { label: 'Comprovante Enviado', className: 'badge-paid' },
      completed: { label: 'Concluído', className: 'badge-completed' },
      cancelled: { label: 'Cancelado', className: 'badge-cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={config.className}>{config.label}</span>;
  };

  const getTransactionTypeLabel = (type) => {
    const types = {
      recharge_vivo: 'Recarga Vivo',
      recharge_tim: 'Recarga TIM',
      pay_bill: 'Pagamento de Fatura'
    };
    return types[type] || type;
  };

  const getTransactionIcon = (type) => {
    const icons = {
      recharge_vivo: <Phone className="w-5 h-5 text-purple-400" />,
      recharge_tim: <Smartphone className="w-5 h-5 text-blue-400" />,
      pay_bill: <Building className="w-5 h-5 text-green-400" />
    };
    return icons[type] || <CreditCard className="w-5 h-5" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptImageUrl, setReceiptImageUrl] = useState('');

  const viewReceipt = (filename) => {
    if (filename) {
      const url = `${process.env.REACT_APP_BACKEND_URL}/uploads/${filename}`;
      setReceiptImageUrl(url);
      setReceiptModalOpen(true);
    } else {
      toast.error('Comprovante não disponível');
    }
  };

  const downloadReceipt = (filename) => {
    if (filename) {
      const url = `${process.env.REACT_APP_BACKEND_URL}/uploads/${filename}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error('Comprovante não disponível');
    }
  };

  const stats = {
    total: transactions.length,
    completed: transactions.filter(t => t.status === 'completed').length,
    pending: transactions.filter(t => t.status === 'pending' || t.status === 'paid').length,
    totalSpent: transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount_paid || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-16 h-16"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Início
            </Link>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Meu Painel</h1>
              <p className="text-gray-300">Bem-vindo, {user?.name}!</p>
            </div>
          </div>
          
          <Button onClick={logout} variant="outline" className="text-white border-white/20 hover:bg-white/10">
            Sair
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-strong border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total de Transações</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-strong border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Concluídas</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-strong border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Em Andamento</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-strong border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Gasto</p>
                  <p className="text-lg font-bold">R$ {stats.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass-strong border-0 text-white mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-6 h-6 text-cyan-400" />
              <span>Ações Rápidas</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Escolha o serviço que deseja utilizar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/vivo-recarga">
                <Button className="w-full h-20 glass hover:bg-white/10 border border-white/10 text-left" variant="ghost">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Recarga Vivo</p>
                      <p className="text-sm text-gray-300">Recarregue seu Vivo</p>
                    </div>
                  </div>
                </Button>
              </Link>
              
              <Link to="/tim-recarga">
                <Button className="w-full h-20 glass hover:bg-white/10 border border-white/10 text-left" variant="ghost">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Recarga TIM</p>
                      <p className="text-sm text-gray-300">Recarregue seu TIM</p>
                    </div>
                  </div>
                </Button>
              </Link>
              
              <Link to="/pagar-fatura">
                <Button className="w-full h-20 glass hover:bg-white/10 border border-white/10 text-left" variant="ghost">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Pagar Fatura</p>
                      <p className="text-sm text-gray-300">TIM e Claro</p>
                    </div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="glass-strong border-0 text-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-6 h-6 text-cyan-400" />
              <span>Minhas Transações</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Histórico das suas recargas e pagamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                          {getTransactionIcon(transaction.transaction_type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            {getTransactionTypeLabel(transaction.transaction_type)}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {transaction.phone_number} • {formatDate(transaction.created_at)}
                          </p>
                          {transaction.amount_paid > 0 && (
                            <p className="text-sm text-gray-300">
                              Valor: R$ {transaction.amount_paid.toFixed(2)}
                              {transaction.amount_received && (
                                <span className="text-blue-400 ml-2">
                                  → R$ {transaction.amount_received.toFixed(2)}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {transaction.receipt_filename && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => downloadReceipt(transaction.receipt_filename)}
                            className="text-white border-white/20 hover:bg-white/10"
                            data-testid={`user-download-receipt-${transaction.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                    
                    {/* Additional details for TIM transactions */}
                    {transaction.tim_email && (
                      <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-xs text-blue-300">
                          Conta TIM: {transaction.tim_email}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  Nenhuma transação ainda
                </h3>
                <p className="text-gray-400 mb-6">
                  Faça sua primeira recarga ou pagamento de fatura
                </p>
                <div className="flex justify-center space-x-4">
                  <Link to="/vivo-recarga">
                    <Button className="btn-premium">
                      Recarga Vivo
                    </Button>
                  </Link>
                  <Link to="/tim-recarga">
                    <Button className="btn-premium">
                      Recarga TIM
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;