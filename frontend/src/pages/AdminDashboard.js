import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { Shield, Users, Phone, CreditCard, Eye, CheckCircle, XCircle, Clock, ArrowLeft, Download } from 'lucide-react';

const AdminDashboard = () => {
  const { admin, logout } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('transactions');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionUsers, setTransactionUsers] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, logsRes] = await Promise.all([
        axios.get('/admin/transactions'),
        axios.get('/admin/logs')
      ]);
      
      setTransactions(transactionsRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados: ' + (error.response?.data?.detail || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (transactionId, newStatus) => {
    try {
      await axios.put(`/admin/transaction/${transactionId}/status?status=${newStatus}`);
      toast.success('Status atualizado com sucesso!');
      fetchData(); // Reload data
    } catch (error) {
      toast.error('Erro ao atualizar status: ' + (error.response?.data?.detail || 'Erro desconhecido'));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendente', className: 'badge-pending' },
      paid: { label: 'Pago', className: 'badge-paid' },
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
      pay_bill: 'Pagamento Fatura'
    };
    return types[type] || type;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const downloadReceipt = (filename) => {
    if (filename) {
      const url = `${process.env.REACT_APP_BACKEND_URL}/uploads/${filename}`;
      window.open(url, '_blank');
    } else {
      toast.error('Comprovante não disponível');
    }
  };

  const stats = {
    total: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    paid: transactions.filter(t => t.status === 'paid').length,
    completed: transactions.filter(t => t.status === 'completed').length,
    totalRevenue: transactions
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Início
            </Link>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-red-400">Painel Administrativo</h1>
              <p className="text-gray-300">Bem-vindo, {admin?.username}</p>
            </div>
          </div>
          
          <Button onClick={logout} variant="outline" className="text-white border-red-500/30 hover:bg-red-500/10">
            Sair
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card className="glass-strong border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-strong border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Pendentes</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-strong border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Pagos</p>
                  <p className="text-2xl font-bold">{stats.paid}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-strong border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Concluídos</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
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
                  <p className="text-sm text-gray-400">Receita</p>
                  <p className="text-lg font-bold">R$ {stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <Button 
            onClick={() => setSelectedTab('transactions')}
            variant={selectedTab === 'transactions' ? 'default' : 'outline'}
            className={selectedTab === 'transactions' ? 'btn-premium' : 'text-white border-white/20 hover:bg-white/10'}
          >
            Transações
          </Button>
          <Button 
            onClick={() => setSelectedTab('logs')}
            variant={selectedTab === 'logs' ? 'default' : 'outline'}
            className={selectedTab === 'logs' ? 'btn-premium' : 'text-white border-white/20 hover:bg-white/10'}
          >
            Logs do Sistema
          </Button>
        </div>

        {/* Transactions Tab */}
        {selectedTab === 'transactions' && (
          <Card className="glass-strong border-0 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-6 h-6 text-blue-400" />
                <span>Transações</span>
              </CardTitle>
              <CardDescription className="text-gray-300">
                Gerencie todas as transações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-premium">
                  <thead>
                    <tr>
                      <th className="text-left">Data</th>
                      <th className="text-left">Tipo</th>
                      <th className="text-left">Nº Registro</th>
                      <th className="text-left">Telefone Recarga</th>
                      <th className="text-left">Valor</th>
                      <th className="text-left">Status</th>
                      <th className="text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-white/5">
                        <td className="py-4">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td>
                          <Badge variant="outline" className="text-cyan-400 border-cyan-400/30">
                            {getTransactionTypeLabel(transaction.transaction_type)}
                          </Badge>
                        </td>
                        <td className="font-mono">{transaction.phone_number}</td>
                        <td className="font-semibold">
                          R$ {transaction.amount_paid?.toFixed(2) || '0.00'}
                        </td>
                        <td>
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedTransaction(transaction)}
                              className="text-white border-white/20 hover:bg-white/10"
                              data-testid={`view-transaction-${transaction.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            {transaction.receipt_filename && (
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => downloadReceipt(transaction.receipt_filename)}
                                className="text-white border-white/20 hover:bg-white/10"
                                data-testid={`download-receipt-${transaction.id}`}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {transaction.status === 'paid' && (
                              <Button 
                                size="sm"
                                onClick={() => updateTransactionStatus(transaction.id, 'completed')}
                                className="btn-success"
                                data-testid={`complete-transaction-${transaction.id}`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {transaction.status !== 'completed' && transaction.status !== 'cancelled' && (
                              <Button 
                                size="sm"
                                onClick={() => updateTransactionStatus(transaction.id, 'cancelled')}
                                className="btn-danger"
                                data-testid={`cancel-transaction-${transaction.id}`}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {transactions.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    Nenhuma transação encontrada
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logs Tab */}
        {selectedTab === 'logs' && (
          <Card className="glass-strong border-0 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-green-400" />
                <span>Logs do Sistema</span>
              </CardTitle>
              <CardDescription className="text-gray-300">
                Atividades e ações dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-white">{log.action}</h4>
                      <span className="text-sm text-gray-400">{formatDate(log.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">Usuário: {log.user_email}</p>
                    
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="mt-2 p-2 bg-black/20 rounded text-xs font-mono">
                        <pre className="text-gray-300">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
                
                {logs.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    Nenhum log encontrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction Details Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-white">Detalhes da Transação</h2>
                  <Button 
                    onClick={() => setSelectedTransaction(null)}
                    variant="outline"
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="space-y-4 text-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">ID da Transação</p>
                      <p className="font-mono">{selectedTransaction.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <div>{getStatusBadge(selectedTransaction.status)}</div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Tipo</p>
                      <p>{getTransactionTypeLabel(selectedTransaction.transaction_type)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Telefone</p>
                      <p className="font-mono">{selectedTransaction.phone_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Valor Pago</p>
                      <p className="font-semibold">R$ {selectedTransaction.amount_paid?.toFixed(2) || '0.00'}</p>
                    </div>
                    {selectedTransaction.amount_received && (
                      <div>
                        <p className="text-gray-400 text-sm">Créditos</p>
                        <p className="font-semibold text-blue-400">R$ {selectedTransaction.amount_received.toFixed(2)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-400 text-sm">Data de Criação</p>
                      <p>{formatDate(selectedTransaction.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Última Atualização</p>
                      <p>{formatDate(selectedTransaction.updated_at)}</p>
                    </div>
                  </div>
                  
                  {/* TIM specific data */}
                  {selectedTransaction.tim_email && (
                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h3 className="font-semibold mb-2">Dados da Conta TIM</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Email TIM</p>
                          <p className="font-mono">{selectedTransaction.tim_email}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Senha</p>
                          <p className="font-mono">{selectedTransaction.tim_password ? '•'.repeat(8) : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Account password for bill payment */}
                  {selectedTransaction.account_password && (
                    <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <h3 className="font-semibold mb-2">Dados da Conta</h3>
                      <div className="text-sm">
                        <p className="text-gray-400">Senha da Conta da Operadora</p>
                        <p className="font-mono">{selectedTransaction.account_password}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Receipt */}
                  {selectedTransaction.receipt_filename && (
                    <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <h3 className="font-semibold mb-2">Comprovante</h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm">{selectedTransaction.receipt_filename}</p>
                        <Button 
                          size="sm"
                          onClick={() => downloadReceipt(selectedTransaction.receipt_filename)}
                          className="btn-premium"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Ver Comprovante
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;