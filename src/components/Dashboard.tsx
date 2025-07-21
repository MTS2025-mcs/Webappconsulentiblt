'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { 
  Users, 
  Euro, 
  Banknote, 
  Settings, 
  BarChart3, 
  Percent,
  Plus,
  LogOut,
  Trash2
} from 'lucide-react'

interface Client {
  id: string
  nome_azienda: string
  nome_titolare: string
  ragione_sociale: string
  data_acquisizione: string
}

interface Transaction {
  id: string
  client_id: string
  client_name?: string
  importo: number
  importo_personale?: number
  note?: string
  data: string
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('clienti')
  const [clients, setClients] = useState<Client[]>([])
  const [vssTransactions, setVssTransactions] = useState<Transaction[]>([])
  const [giTransactions, setGiTransactions] = useState<Transaction[]>([])
  const [vsdTransactions, setVsdTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [showClientModal, setShowClientModal] = useState(false)
  const [showVSSModal, setShowVSSModal] = useState(false)
  const [showGIModal, setShowGIModal] = useState(false)
  const [showVSDModal, setShowVSDModal] = useState(false)

  // Form states
  const [clientForm, setClientForm] = useState({
    nome_azienda: '',
    nome_titolare: '',
    ragione_sociale: '',
    data_acquisizione: new Date().toISOString().split('T')[0]
  })

  const [transactionForm, setTransactionForm] = useState({
    client_id: '',
    importo: '',
    importo_personale: '',
    note: '',
    data: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load clients
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      // Load VSS transactions
      const { data: vssData } = await supabase
        .from('vss_transactions')
        .select(`
          *,
          clients!inner(nome_azienda)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      // Load GI transactions
      const { data: giData } = await supabase
        .from('gi_transactions')
        .select(`
          *,
          clients!inner(nome_azienda)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      // Load VSD transactions
      const { data: vsdData } = await supabase
        .from('vsd_transactions')
        .select(`
          *,
          clients!inner(nome_azienda)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      setClients(clientsData || [])
      setVssTransactions(vssData?.map(t => ({ ...t, client_name: t.clients.nome_azienda })) || [])
      setGiTransactions(giData?.map(t => ({ ...t, client_name: t.clients.nome_azienda })) || [])
      setVsdTransactions(vsdData?.map(t => ({ ...t, client_name: t.clients.nome_azienda })) || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addClient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('clients')
        .insert([{ ...clientForm, user_id: user?.id }])

      if (error) throw error

      setShowClientModal(false)
      setClientForm({
        nome_azienda: '',
        nome_titolare: '',
        ragione_sociale: '',
        data_acquisizione: new Date().toISOString().split('T')[0]
      })
      loadData()
    } catch (error) {
      console.error('Error adding client:', error)
    }
  }

  const addVSSTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('vss_transactions')
        .insert([{
          user_id: user?.id,
          client_id: transactionForm.client_id,
          importo: parseFloat(transactionForm.importo),
          note: transactionForm.note,
          data: transactionForm.data
        }])

      if (error) throw error

      setShowVSSModal(false)
      resetTransactionForm()
      loadData()
    } catch (error) {
      console.error('Error adding VSS transaction:', error)
    }
  }

  const addGITransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('gi_transactions')
        .insert([{
          user_id: user?.id,
          client_id: transactionForm.client_id,
          importo: parseFloat(transactionForm.importo),
          note: transactionForm.note,
          data: transactionForm.data
        }])

      if (error) throw error

      setShowGIModal(false)
      resetTransactionForm()
      loadData()
    } catch (error) {
      console.error('Error adding GI transaction:', error)
    }
  }

  const addVSDTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('vsd_transactions')
        .insert([{
          user_id: user?.id,
          client_id: transactionForm.client_id,
          importo_totale: parseFloat(transactionForm.importo),
          importo_personale: parseFloat(transactionForm.importo_personale),
          note: transactionForm.note,
          data: transactionForm.data
        }])

      if (error) throw error

      setShowVSDModal(false)
      resetTransactionForm()
      loadData()
    } catch (error) {
      console.error('Error adding VSD transaction:', error)
    }
  }

  const resetTransactionForm = () => {
    setTransactionForm({
      client_id: '',
      importo: '',
      importo_personale: '',
      note: '',
      data: new Date().toISOString().split('T')[0]
    })
  }

  const deleteClient = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo cliente?')) {
      try {
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', id)

        if (error) throw error
        loadData()
      } catch (error) {
        console.error('Error deleting client:', error)
      }
    }
  }

  // Calculate statistics
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const getMonthlyTotal = (transactions: Transaction[], field: 'importo' | 'importo_personale' = 'importo') => {
    return transactions
      .filter(t => {
        const date = new Date(t.data)
        return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear
      })
      .reduce((sum, t) => sum + (field === 'importo_personale' ? (t.importo_personale || 0) : t.importo), 0)
  }

  const getYearlyTotal = (transactions: Transaction[], field: 'importo' | 'importo_personale' = 'importo') => {
    return transactions
      .filter(t => new Date(t.data).getFullYear() === currentYear)
      .reduce((sum, t) => sum + (field === 'importo_personale' ? (t.importo_personale || 0) : t.importo), 0)
  }

  const monthlyVSS = getMonthlyTotal(vssTransactions)
  const yearlyVSS = getYearlyTotal(vssTransactions)
  const monthlyGI = getMonthlyTotal(giTransactions)
  const yearlyGI = getYearlyTotal(giTransactions)
  const monthlyVSD = getMonthlyTotal(vsdTransactions)
  const monthlyVSDPersonal = getMonthlyTotal(vsdTransactions, 'importo_personale')

  // Calculate commissions
  const vssCommission = monthlyVSS * 0.15
  const vsdCommission = monthlyVSDPersonal * 0.25
  const totalCommissions = vssCommission + vsdCommission

  const monthlyNNCF = clients.filter(c => {
    const date = new Date(c.data_acquisizione)
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear
  }).length

  const yearlyNNCF = clients.filter(c => {
    const date = new Date(c.data_acquisizione)
    return date.getFullYear() === currentYear
  }).length

  const tabs = [
    { id: 'clienti', label: 'Clienti', icon: Users },
    { id: 'vss', label: 'VSS', icon: Euro },
    { id: 'gi', label: 'G.I.', icon: Banknote },
    { id: 'vsd', label: 'VSD', icon: Settings },
    { id: 'nncf', label: 'Report NNCF', icon: BarChart3 },
    { id: 'provvigioni', label: 'Provvigioni', icon: Percent },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">📊 Dashboard Consulenti</h1>
          <div className="flex items-center gap-4">
            <span>👋 Ciao, {user?.user_metadata?.full_name || user?.email}</span>
            <button
              onClick={signOut}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut size={16} />
              Esci
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'clienti' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">👥 Gestione Clienti</h2>
              <button
                onClick={() => setShowClientModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Nuovo Cliente
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Nome Azienda</th>
                    <th className="text-left p-3">Nome Titolare</th>
                    <th className="text-left p-3">Ragione Sociale</th>
                    <th className="text-left p-3">Data Acquisizione</th>
                    <th className="text-left p-3">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{client.nome_azienda}</td>
                      <td className="p-3">{client.nome_titolare}</td>
                      <td className="p-3">{client.ragione_sociale}</td>
                      <td className="p-3">{new Date(client.data_acquisizione).toLocaleDateString('it-IT')}</td>
                      <td className="p-3">
                        <button
                          onClick={() => deleteClient(client.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'vss' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Venduto Mese Corrente</h3>
                <p className="text-3xl font-bold">€{monthlyVSS.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Venduto Totale Anno</h3>
                <p className="text-3xl font-bold">€{yearlyVSS.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">💰 VSS - Venduto</h2>
                <button
                  onClick={() => setShowVSSModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Aggiungi Vendita
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Cliente</th>
                      <th className="text-left p-3">Importo</th>
                      <th className="text-left p-3">Note</th>
                      <th className="text-left p-3">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vssTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{transaction.client_name}</td>
                        <td className="p-3">€{transaction.importo.toFixed(2)}</td>
                        <td className="p-3">{transaction.note || '-'}</td>
                        <td className="p-3">{new Date(transaction.data).toLocaleDateString('it-IT')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'provvigioni' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Provvigioni Mese Corrente</h3>
                <p className="text-3xl font-bold">€{totalCommissions.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">NNCF Mese Corrente</h3>
                <p className="text-3xl font-bold">{monthlyNNCF}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">💸 Dettaglio Provvigioni</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span>VSS (15%)</span>
                  <span className="font-semibold">€{vssCommission.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span>VSD Personale (25%)</span>
                  <span className="font-semibold">€{vsdCommission.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-100 rounded-lg border-2 border-blue-200">
                  <span className="font-semibold">Totale Provvigioni</span>
                  <span className="font-bold text-xl">€{totalCommissions.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nuovo Cliente</h3>
            <form onSubmit={addClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome Azienda *</label>
                <input
                  type="text"
                  value={clientForm.nome_azienda}
                  onChange={(e) => setClientForm({...clientForm, nome_azienda: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nome Titolare *</label>
                <input
                  type="text"
                  value={clientForm.nome_titolare}
                  onChange={(e) => setClientForm({...clientForm, nome_titolare: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ragione Sociale *</label>
                <input
                  type="text"
                  value={clientForm.ragione_sociale}
                  onChange={(e) => setClientForm({...clientForm, ragione_sociale: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data Acquisizione *</label>
                <input
                  type="date"
                  value={clientForm.data_acquisizione}
                  onChange={(e) => setClientForm({...clientForm, data_acquisizione: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Salva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVSSModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Aggiungi Vendita VSS</h3>
            <form onSubmit={addVSSTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cliente *</label>
                <select
                  value={transactionForm.client_id}
                  onChange={(e) => setTransactionForm({...transactionForm, client_id: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleziona cliente...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.nome_azienda}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Importo VSS *</label>
                <input
                  type="number"
                  step="0.01"
                  value={transactionForm.importo}
                  onChange={(e) => setTransactionForm({...transactionForm, importo: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Note Servizio</label>
                <textarea
                  value={transactionForm.note}
                  onChange={(e) => setTransactionForm({...transactionForm, note: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data *</label>
                <input
                  type="date"
                  value={transactionForm.data}
                  onChange={(e) => setTransactionForm({...transactionForm, data: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVSSModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Salva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
