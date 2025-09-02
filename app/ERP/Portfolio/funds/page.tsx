'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react';

interface Fund {
  id: string;
  name: string;
  description: string;
  totalAmount: number;
  minInvestment: number;
  maxInvestment: number;
  focusIndustries: string[];
  applicationStart: string;
  applicationEnd: string;
  status: 'OPEN' | 'CLOSED' | 'FULLY_SUBSCRIBED' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  totalInvested: number;
  totalCompanies: number;
}

const statusColors = {
  OPEN: 'bg-green-100 text-green-800',
  CLOSED: 'bg-red-100 text-red-800',
  FULLY_SUBSCRIBED: 'bg-blue-100 text-blue-800',
  INACTIVE: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  OPEN: 'Open',
  CLOSED: 'Closed',
  FULLY_SUBSCRIBED: 'Fully Subscribed',
  INACTIVE: 'Inactive'
};

export default function FundsPage() {
  const router = useRouter();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/auth");
      return;
    }
    fetchFunds();
  }, [router]);

  const fetchFunds = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await fetch('/api/funds', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFunds(data.funds || []);
      } else {
        // Mock data for development
        setFunds(mockFunds);
      }
    } catch (error) {
      console.error('Error fetching funds:', error);
      // Fallback to mock data
      setFunds(mockFunds);
    } finally {
      setLoading(false);
    }
  };

  const filteredFunds = funds.filter(fund => {
    const matchesSearch = fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fund.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || fund.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getUtilizationPercentage = (fund: Fund) => {
    return Math.round((fund.totalInvested / fund.totalAmount) * 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <CheckCircle className="w-4 h-4" />;
      case 'CLOSED': return <Clock className="w-4 h-4" />;
      case 'FULLY_SUBSCRIBED': return <Target className="w-4 h-4" />;
      case 'INACTIVE': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Mock data for development
  const mockFunds: Fund[] = [
    {
      id: '1',
      name: 'Tech Innovation Fund 2024',
      description: 'A fund focused on early-stage technology startups in Africa',
      totalAmount: 1000000,
      minInvestment: 50000,
      maxInvestment: 200000,
      focusIndustries: ['Technology', 'Fintech', 'E-commerce'],
      applicationStart: '2024-01-01T00:00:00.000Z',
      applicationEnd: '2024-12-31T23:59:59.000Z',
      status: 'OPEN',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-08-20T10:00:00.000Z',
      totalInvested: 450000,
      totalCompanies: 3
    },
    {
      id: '2',
      name: 'Green Energy Fund',
      description: 'Sustainable energy solutions and renewable technology investments',
      totalAmount: 2000000,
      minInvestment: 100000,
      maxInvestment: 500000,
      focusIndustries: ['Energy', 'Technology', 'Manufacturing'],
      applicationStart: '2024-03-01T00:00:00.000Z',
      applicationEnd: '2024-11-30T23:59:59.000Z',
      status: 'OPEN',
      createdAt: '2024-03-01T00:00:00.000Z',
      updatedAt: '2024-08-20T10:00:00.000Z',
      totalInvested: 1200000,
      totalCompanies: 2
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading funds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Fund Management
              </h1>
              <p className="text-gray-600">
                Create and manage investment funds for portfolio companies
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Fund
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Funds</p>
                <p className="text-2xl font-bold text-gray-900">{funds.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Capital</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(funds.reduce((sum, fund) => sum + fund.totalAmount, 0) / 1000000).toFixed(1)}M
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(funds.reduce((sum, fund) => sum + fund.totalInvested, 0) / 1000000).toFixed(1)}M
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Portfolio Companies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {funds.reduce((sum, fund) => sum + fund.totalCompanies, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search funds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="FULLY_SUBSCRIBED">Fully Subscribed</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Funds List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Investment Funds ({filteredFunds.length})
            </h3>
          </div>
          
          {filteredFunds.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No funds found matching your criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredFunds.map((fund, index) => (
                <motion.div
                  key={fund.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {fund.name}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${statusColors[fund.status]}`}>
                          {getStatusIcon(fund.status)}
                          {statusLabels[fund.status]}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">
                        {fund.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span>Total: {formatCurrency(fund.totalAmount)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Target className="w-4 h-4" />
                          <span>Invested: {formatCurrency(fund.totalInvested)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>Companies: {fund.totalCompanies}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <TrendingUp className="w-4 h-4" />
                          <span>Utilization: {getUtilizationPercentage(fund)}%</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Fund Utilization</span>
                          <span>{getUtilizationPercentage(fund)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getUtilizationPercentage(fund)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {fund.focusIndustries.map((industry, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {industry}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Start: {formatDate(fund.applicationStart)}</span>
                        <span>End: {formatDate(fund.applicationEnd)}</span>
                        <span>Range: {formatCurrency(fund.minInvestment)} - {formatCurrency(fund.maxInvestment)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => router.push(`/ERP/Portfolio/funds/${fund.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/ERP/Portfolio/funds/${fund.id}/edit`)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Edit Fund"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/ERP/Portfolio/funds/${fund.id}/investments`)}
                        className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Investments
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Create Fund Form Modal */}
        {showCreateForm && (
          <CreateFundForm
            onClose={() => setShowCreateForm(false)}
            onSave={() => {
              setShowCreateForm(false);
              fetchFunds();
            }}
          />
        )}
      </div>
    </div>
  );
}

// Create Fund Form Component
function CreateFundForm({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    totalAmount: 0,
    minInvestment: 0,
    maxInvestment: 0,
    focusIndustries: [] as string[],
    applicationStart: '',
    applicationEnd: '',
    status: 'OPEN' as const
  });

  const [loading, setLoading] = useState(false);

  const industries = [
    'Technology', 'Energy', 'Healthcare', 'Finance', 'Manufacturing', 
    'Agriculture', 'Education', 'Transportation', 'Retail', 'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch('/api/funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        onSave();
      }
    } catch (error) {
      console.error('Error creating fund:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleIndustry = (industry: string) => {
    setForm(prev => ({
      ...prev,
      focusIndustries: prev.focusIndustries.includes(industry)
        ? prev.focusIndustries.filter(i => i !== industry)
        : [...prev.focusIndustries, industry]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Fund
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <AlertCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fund Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tech Innovation Fund 2024"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Fund Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={form.totalAmount}
                  onChange={(e) => setForm(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1000000"
                  min="0"
                  step="1000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Investment *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={form.minInvestment}
                  onChange={(e) => setForm(prev => ({ ...prev, minInvestment: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50000"
                  min="0"
                  step="1000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Investment *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={form.maxInvestment}
                  onChange={(e) => setForm(prev => ({ ...prev, maxInvestment: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="200000"
                  min="0"
                  step="1000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Start Date *
              </label>
              <input
                type="date"
                value={form.applicationStart}
                onChange={(e) => setForm(prev => ({ ...prev, applicationStart: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application End Date *
              </label>
              <input
                type="date"
                value={form.applicationEnd}
                onChange={(e) => setForm(prev => ({ ...prev, applicationEnd: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the fund's focus, investment strategy, and target companies..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Focus Industries
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {industries.map(industry => (
                <label key={industry} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.focusIndustries.includes(industry)}
                    onChange={() => toggleIndustry(industry)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{industry}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Fund
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
