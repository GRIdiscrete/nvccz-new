'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Users, 
  Building2, 
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  BarChart3,
  Milestone,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface Investment {
  id: string;
  portfolioCompanyId: string;
  companyName: string;
  fundId: string;
  fundName: string;
  investmentAmount: number;
  disbursedAmount: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'EXITED';
  startDate: string;
  expectedExitDate: string;
  currentValue: number;
  roi: number;
  milestones: {
    id: string;
    title: string;
    description: string;
    amount: number;
    dueDate: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
    completionDate?: string;
  }[];
  disbursements: {
    id: string;
    amount: number;
    date: string;
    type: 'INITIAL' | 'MILESTONE' | 'FINAL';
    status: 'PENDING' | 'APPROVED' | 'DISBURSED';
    notes: string;
  }[];
  performanceMetrics: {
    revenueGrowth: number;
    marketShare: number;
    customerCount: number;
    employeeCount: number;
  };
}

const statusColors = {
  ACTIVE: 'bg-green-50 text-green-800',
  COMPLETED: 'bg-blue-50 text-blue-800',
  ON_HOLD: 'bg-yellow-50 text-yellow-800',
  EXITED: 'bg-purple-50 text-purple-800'
};

const statusLabels = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  EXITED: 'Exited'
};

const milestoneStatusColors = {
  PENDING: 'bg-slate-50 text-slate-800',
  IN_PROGRESS: 'bg-blue-50 text-blue-800',
  COMPLETED: 'bg-green-50 text-green-800',
  OVERDUE: 'bg-red-50 text-red-800'
};

const milestoneStatusLabels = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  OVERDUE: 'Overdue'
};

export default function InvestmentsPage() {
  const router = useRouter();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [fundFilter, setFundFilter] = useState<string>('ALL');

  useEffect(() => {
    // Check authentication
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    fetchInvestments();
  }, [router]);

  const fetchInvestments = async () => {
    try {
      // Mock data for demonstration
      setInvestments(mockInvestments);
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvestments = investments.filter(investment => {
    const matchesSearch = investment.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.fundName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || investment.status === statusFilter;
    const matchesFund = fundFilter === 'ALL' || investment.fundId === fundFilter;
    
    return matchesSearch && matchesStatus && matchesFund;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'ON_HOLD':
        return <Clock className="w-4 h-4" />;
      case 'EXITED':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const getMilestoneStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'IN_PROGRESS':
        return <Target className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'OVERDUE':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const calculateUtilization = (disbursed: number, total: number) => {
    return ((disbursed / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 p-6">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-slate-200/70" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/70 ring-1 ring-slate-200/60" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-white/70 ring-1 ring-slate-200/60" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Investment Implementation</h1>
          <p className="text-sm text-slate-500">Track investment execution, milestones, and performance</p>
        </div>
        <button
          onClick={() => router.push('/ERP/Portfolio/investments/create')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Investment
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-50 shadow-xs mb-0 mr-4">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Active Investments</p>
              <p className="text-2xl font-semibold text-slate-900">
                {investments.filter(inv => inv.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-green-50 shadow-xs mb-0 mr-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Invested</p>
              <p className="text-2xl font-semibold text-slate-900">
                {formatCurrency(investments.reduce((sum, inv) => sum + inv.investmentAmount, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-purple-50 shadow-xs mb-0 mr-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Avg. ROI</p>
              <p className="text-2xl font-semibold text-slate-900">
                {investments.length > 0 
                  ? (investments.reduce((sum, inv) => sum + inv.roi, 0) / investments.length).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-yellow-50 shadow-xs mb-0 mr-4">
              <Milestone className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Pending Milestones</p>
              <p className="text-2xl font-semibold text-slate-900">
                {investments.reduce((sum, inv) => 
                  sum + inv.milestones.filter(m => m.status === 'PENDING' || m.status === 'IN_PROGRESS').length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search investments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="EXITED">Exited</option>
            </select>

            <select
              value={fundFilter}
              onChange={(e) => setFundFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Funds</option>
              <option value="fund1">Tech Innovation Fund</option>
              <option value="fund2">Healthcare Growth Fund</option>
              <option value="fund3">Green Energy Fund</option>
            </select>
          </div>
        </div>
      </div>

      {/* Investments List */}
      <div className="group rounded-2xl border border-slate-200/60 bg-white/70 shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/60">
          <h2 className="text-lg font-semibold text-slate-800">Investments ({filteredInvestments.length})</h2>
        </div>
        
        {filteredInvestments.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No investments found matching your criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/60">
            {filteredInvestments.map((investment) => (
              <div
                key={investment.id}
                className="p-6 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-1">{investment.companyName}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {investment.fundName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Started {formatDate(investment.startDate)}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusColors[investment.status]}`}>
                        {getStatusIcon(investment.status)}
                        {statusLabels[investment.status]}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-slate-600">Investment Amount</p>
                        <p className="font-semibold text-slate-900">{formatCurrency(investment.investmentAmount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Disbursed</p>
                        <p className="font-semibold text-slate-900">{formatCurrency(investment.disbursedAmount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Utilization</p>
                        <p className="font-semibold text-slate-900">
                          {calculateUtilization(investment.disbursedAmount, investment.investmentAmount)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">ROI</p>
                        <p className={`font-semibold ${investment.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {investment.roi >= 0 ? '+' : ''}{investment.roi}%
                        </p>
                      </div>
                    </div>

                    {/* Milestones */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Key Milestones</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {investment.milestones.slice(0, 4).map((milestone) => (
                          <div key={milestone.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${milestoneStatusColors[milestone.status]}`}>
                                {getMilestoneStatusIcon(milestone.status)}
                                {milestoneStatusLabels[milestone.status]}
                              </span>
                              <span className="text-sm text-slate-700">{milestone.title}</span>
                            </div>
                            <span className="text-sm font-medium text-slate-900">
                              {formatCurrency(milestone.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Revenue Growth</p>
                        <p className={`font-medium ${investment.performanceMetrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {investment.performanceMetrics.revenueGrowth >= 0 ? '+' : ''}{investment.performanceMetrics.revenueGrowth}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Market Share</p>
                        <p className="font-medium">{investment.performanceMetrics.marketShare}%</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Customers</p>
                        <p className="font-medium">{investment.performanceMetrics.customerCount}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Employees</p>
                        <p className="font-medium">{investment.performanceMetrics.employeeCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/ERP/Portfolio/investments/${investment.id}`)}
                      className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                    <button
                      onClick={() => router.push(`/ERP/Portfolio/investments/${investment.id}/edit`)}
                      className="flex items-center px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Mock data for demonstration
const mockInvestments: Investment[] = [
  {
    id: '1',
    portfolioCompanyId: '1',
    companyName: 'TechStart Solutions',
    fundId: 'fund1',
    fundName: 'Tech Innovation Fund',
    investmentAmount: 500000,
    disbursedAmount: 300000,
    status: 'ACTIVE',
    startDate: '2023-03-15',
    expectedExitDate: '2026-03-15',
    currentValue: 750000,
    roi: 50,
    milestones: [
      {
        id: 'm1',
        title: 'MVP Development',
        description: 'Complete MVP development and initial user testing',
        amount: 150000,
        dueDate: '2023-06-15',
        status: 'COMPLETED',
        completionDate: '2023-06-10'
      },
      {
        id: 'm2',
        title: 'Market Launch',
        description: 'Launch product to market and acquire first 100 customers',
        amount: 200000,
        dueDate: '2023-09-15',
        status: 'COMPLETED',
        completionDate: '2023-09-20'
      },
      {
        id: 'm3',
        title: 'Scale Operations',
        description: 'Scale operations and expand to new markets',
        amount: 150000,
        dueDate: '2024-03-15',
        status: 'IN_PROGRESS'
      }
    ],
    disbursements: [
      {
        id: 'd1',
        amount: 150000,
        date: '2023-03-15',
        type: 'INITIAL',
        status: 'DISBURSED',
        notes: 'Initial investment disbursement'
      },
      {
        id: 'd2',
        amount: 150000,
        date: '2023-06-15',
        type: 'MILESTONE',
        status: 'DISBURSED',
        notes: 'MVP completion milestone'
      }
    ],
    performanceMetrics: {
      revenueGrowth: 45,
      marketShare: 12,
      customerCount: 250,
      employeeCount: 25
    }
  },
  {
    id: '2',
    portfolioCompanyId: '2',
    companyName: 'HealthTech Innovations',
    fundId: 'fund2',
    fundName: 'Healthcare Growth Fund',
    investmentAmount: 300000,
    disbursedAmount: 300000,
    status: 'ACTIVE',
    startDate: '2022-08-20',
    expectedExitDate: '2025-08-20',
    currentValue: 450000,
    roi: 50,
    milestones: [
      {
        id: 'm4',
        title: 'Clinical Trials',
        description: 'Complete Phase 1 clinical trials',
        amount: 150000,
        dueDate: '2023-02-20',
        status: 'COMPLETED',
        completionDate: '2023-02-15'
      },
      {
        id: 'm5',
        title: 'Regulatory Approval',
        description: 'Obtain regulatory approval for product',
        amount: 150000,
        dueDate: '2024-02-20',
        status: 'IN_PROGRESS'
      }
    ],
    disbursements: [
      {
        id: 'd3',
        amount: 150000,
        date: '2022-08-20',
        type: 'INITIAL',
        status: 'DISBURSED',
        notes: 'Initial investment disbursement'
      },
      {
        id: 'd4',
        amount: 150000,
        date: '2023-02-20',
        type: 'MILESTONE',
        status: 'DISBURSED',
        notes: 'Clinical trials completion'
      }
    ],
    performanceMetrics: {
      revenueGrowth: 30,
      marketShare: 8,
      customerCount: 120,
      employeeCount: 18
    }
  },
  {
    id: '3',
    portfolioCompanyId: '3',
    companyName: 'Green Energy Corp',
    fundId: 'fund3',
    fundName: 'Green Energy Fund',
    investmentAmount: 1000000,
    disbursedAmount: 600000,
    status: 'ON_HOLD',
    startDate: '2021-12-10',
    expectedExitDate: '2024-12-10',
    currentValue: 800000,
    roi: -20,
    milestones: [
      {
        id: 'm6',
        title: 'Plant Construction',
        description: 'Complete manufacturing plant construction',
        amount: 500000,
        dueDate: '2022-06-10',
        status: 'COMPLETED',
        completionDate: '2022-06-15'
      },
      {
        id: 'm7',
        title: 'Production Start',
        description: 'Begin commercial production',
        amount: 500000,
        dueDate: '2022-12-10',
        status: 'OVERDUE'
      }
    ],
    disbursements: [
      {
        id: 'd5',
        amount: 500000,
        date: '2021-12-10',
        type: 'INITIAL',
        status: 'DISBURSED',
        notes: 'Initial investment disbursement'
      },
      {
        id: 'd6',
        amount: 100000,
        date: '2022-06-10',
        type: 'MILESTONE',
        status: 'DISBURSED',
        notes: 'Plant construction milestone'
      }
    ],
    performanceMetrics: {
      revenueGrowth: -10,
      marketShare: 5,
      customerCount: 80,
      employeeCount: 45
    }
  }
];
