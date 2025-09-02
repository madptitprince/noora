import { useState } from 'react';
import { Plus, DollarSign, Calendar, Edit, Trash2, Filter, TrendingDown } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import { useAuth } from '../hooks/useAuth';
import { Expense } from '../lib/database.types';
import { format, startOfMonth, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ExpenseForm } from './ExpenseForm';
import { formatCFA } from '../lib/currency';

export function ExpensesList() {
  const { expenses, loading, deleteExpense } = useExpenses();
  const { isOwner, profile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');

  // Les gérantes peuvent voir et ajouter des frais, seuls les propriétaires peuvent modifier/supprimer
  const canAddExpenses = profile?.role === 'owner' || profile?.role === 'manager';
  const canEditExpenses = isOwner;

  // Filtrer les frais
  const filteredExpenses = expenses.filter(expense => {
    const typeMatch = selectedType === 'all' || expense.type === selectedType;
    
    let dateMatch = true;
    if (dateFilter === 'week') {
      dateMatch = new Date(expense.expense_date) >= startOfWeek(new Date(), { weekStartsOn: 1 });
    } else if (dateFilter === 'month') {
      dateMatch = new Date(expense.expense_date) >= startOfMonth(new Date());
    }
    
    return typeMatch && dateMatch;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyExpenses = expenses.filter(expense => 
    new Date(expense.expense_date) >= startOfMonth(new Date())
  ).reduce((sum, expense) => sum + expense.amount, 0);

  const expenseTypes = [
    { value: 'all', label: 'Tous les types' },
    { value: 'general', label: 'Général' },
    { value: 'transport', label: 'Transport' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'packaging', label: 'Emballage' },
    { value: 'fees', label: 'Frais bancaires' },
    { value: 'other', label: 'Autre' },
  ];

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = async (expense: Expense) => {
    const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer le frais "${expense.description}" ?`);
    if (confirmed) {
      await deleteExpense(expense.id);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Frais</h1>
          <p className="text-gray-600 mt-1">
            {filteredExpenses.length} frais • Total: <span className="font-semibold text-red-600">{formatCFA(totalExpenses)}</span>
          </p>
        </div>
        {canAddExpenses && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all duration-200 shadow-md font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un frais
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-xl">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600">Total des frais</p>
              <p className="text-2xl font-bold text-red-700">{formatCFA(totalExpenses)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-600">Ce mois</p>
              <p className="text-2xl font-bold text-orange-700">{formatCFA(monthlyExpenses)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="p-3 bg-amber-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-amber-600">Nombre d'entrées</p>
              <p className="text-2xl font-bold text-amber-700">{filteredExpenses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtres:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
            >
              <option value="all">Toutes les dates</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
            >
              {expenseTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-lg font-semibold text-gray-900">Liste des Frais</h2>
        </div>
        
        {filteredExpenses.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{expense.description}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-medium">
                          {expenseTypes.find(t => t.value === expense.type)?.label || expense.type}
                        </span>
                        <span>•</span>
                        <span>{format(new Date(expense.expense_date), 'dd MMMM yyyy', { locale: fr })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-bold text-red-600 text-lg">
                        -{formatCFA(expense.amount)}
                      </p>
                    </div>
                    {canEditExpenses && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun frais trouvé</h3>
            <p className="text-gray-600">
              {selectedType !== 'all' || dateFilter !== 'all'
                ? 'Aucun frais pour les filtres sélectionnés'
                : 'Commencez par ajouter vos premiers frais'
              }
            </p>
          </div>
        )}
      </div>

      {/* Expense Form Modal */}
      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onClose={closeForm}
        />
      )}
    </div>
  );
}