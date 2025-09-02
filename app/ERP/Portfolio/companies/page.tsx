'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
  BarChart3
} from 'lucide-react';

interface PortfolioCompany {
  id: string;
  name: string;
  industry: string;
  investmentDate: string;
  investmentAmount: number;
  equityPercentage: number;
  currentValue: number;
  status: 'ACTIVE' | 'EXITED' | 'UNDER_PERFORMANCE' | 'GROWING';
  managementTeam: string;
  lastReportingDate: string;
  nextReportingDate: string;
  keyMetrics: {
    revenue: number;
    growthRate: number;
    employeeCount: number;
    marketCap: number;
  };
  documents: {
    id: string;
    name: string;
    type: string;
    uploadDate: string;
  }[];
}

const statusColors = {
  ACTIVE: 'bg-green-50 text-green-800',
  EXITED: 'bg-blue-50 text-blue-800',
  UNDER_PERFORMANCE: 'bg-red-50 text-red-800',
  GROWING: 'bg-yellow-50 text-yellow-800'
};

const statusLabels = {
  ACTIVE: 'Active',
  EXITED: 'Exited',
  UNDER_PERFORMANCE: 'Under Performance',
  GROWING: 'Growing'
};

export default function PortfolioCompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<PortfolioCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [industryFilter, setIndustryFilter] = useState<string>('ALL');

  useEffect(() => {
    // Check authentication
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    fetchPortfolioCompanies();
  }, [router]);

  const fetchPortfolioCompanies = async () => {
    try {
      // Mock data for demonstration
      setCompanies(mockCompanies);
    } catch (error) {
      console.error('Error fetching portfolio companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || company.status === statusFilter;
    const matchesIndustry = industryFilter === 'ALL' || company.industry === industryFilter;
    
    return matchesSearch && matchesStatus && matchesIndustry;
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
      case 'EXITED':
        return <TrendingUp className="w-4 h-4" />;
      case 'UNDER_PERFORMANCE':
        return <AlertCircle className="w-4 h-4" />;
      case 'GROWING':
        return <Clock className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const calculateROI = (currentValue: number, investmentAmount: number) => {
    return ((currentValue - investmentAmount) / investmentAmount * 100).toFixed(1);
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
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Portfolio Companies</h1>
          <p className="text-sm text-slate-500">Manage and track your investment portfolio companies</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-50 shadow-xs mb-0 mr-4">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Companies</p>
              <p className="text-2xl font-semibold text-slate-900">{companies.length}</p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-green-50 shadow-xs mb-0 mr-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Portfolio Value</p>
              <p className="text-2xl font-semibold text-slate-900">
                {formatCurrency(companies.reduce((sum, company) => sum + company.currentValue, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-yellow-50 shadow-xs mb-0 mr-4">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Active Investments</p>
              <p className="text-2xl font-semibold text-slate-900">
                {companies.filter(c => c.status === 'ACTIVE' || c.status === 'GROWING').length}
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-purple-50 shadow-xs mb-0 mr-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Avg. ROI</p>
              <p className="text-2xl font-semibold text-slate-900">
                {companies.length > 0 
                  ? (companies.reduce((sum, company) => 
                      sum + parseFloat(calculateROI(company.currentValue, company.investmentAmount)), 0) / companies.length).toFixed(1)
                  : 0}%
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
                placeholder="Search companies..."
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
              <option value="GROWING">Growing</option>
              <option value="UNDER_PERFORMANCE">Under Performance</option>
              <option value="EXITED">Exited</option>
            </select>

            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Industries</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Retail">Retail</option>
            </select>
          </div>
        </div>
      </div>

      {/* Companies List */}
      <div className="group rounded-2xl border border-slate-200/60 bg-white/70 shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/60">
          <h2 className="text-lg font-semibold text-slate-800">Portfolio Companies ({filteredCompanies.length})</h2>
        </div>
        
        {filteredCompanies.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No companies found matching your criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/60">
            {filteredCompanies.map((company, index) => (
              <div
                key={company.id}
                className="p-6 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-1">{company.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {company.industry}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {company.keyMetrics.employeeCount} employees
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusColors[company.status]}`}>
                        {getStatusIcon(company.status)}
                        {statusLabels[company.status]}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-slate-600">Investment Amount</p>
                        <p className="font-semibold text-slate-900">{formatCurrency(company.investmentAmount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Current Value</p>
                        <p className="font-semibold text-slate-900">{formatCurrency(company.currentValue)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">ROI</p>
                        <p className={`font-semibold ${parseFloat(calculateROI(company.currentValue, company.investmentAmount)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {calculateROI(company.currentValue, company.investmentAmount)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Equity Stake</p>
                        <p className="font-semibold text-slate-900">{company.equityPercentage}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Investment Date</p>
                        <p className="font-medium">{formatDate(company.investmentDate)}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Last Reporting</p>
                        <p className="font-medium">{formatDate(company.lastReportingDate)}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Next Reporting</p>
                        <p className="font-medium">{formatDate(company.nextReportingDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/ERP/Portfolio/companies/${company.id}`)}
                      className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                    <button
                      onClick={() => router.push(`/ERP/Portfolio/companies/${company.id}/edit`)}
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
const mockCompanies: PortfolioCompany[] = [
  {
    id: '1',
    name: 'TechStart Solutions',
    industry: 'Technology',
    investmentDate: '2023-03-15',
    investmentAmount: 500000,
    equityPercentage: 25,
    currentValue: 750000,
    status: 'GROWING',
    managementTeam: 'John Smith (CEO), Sarah Johnson (CTO)',
    lastReportingDate: '2024-01-15',
    nextReportingDate: '2024-04-15',
    keyMetrics: {
      revenue: 1200000,
      growthRate: 45,
      employeeCount: 25,
      marketCap: 3000000
    },
    documents: [
      { id: '1', name: 'Q4 2023 Report', type: 'Financial Report', uploadDate: '2024-01-15' },
      { id: '2', name: 'Business Plan Update', type: 'Strategic Document', uploadDate: '2024-01-10' }
    ]
  },
  {
    id: '2',
    name: 'HealthTech Innovations',
    industry: 'Healthcare',
    investmentDate: '2022-08-20',
    investmentAmount: 300000,
    equityPercentage: 20,
    currentValue: 450000,
    status: 'ACTIVE',
    managementTeam: 'Dr. Michael Chen (CEO), Dr. Lisa Park (CMO)',
    lastReportingDate: '2024-01-20',
    nextReportingDate: '2024-04-20',
    keyMetrics: {
      revenue: 800000,
      growthRate: 30,
      employeeCount: 18,
      marketCap: 2250000
    },
    documents: [
      { id: '3', name: 'Clinical Trial Results', type: 'Research Report', uploadDate: '2024-01-20' },
      { id: '4', name: 'Q4 2023 Financials', type: 'Financial Report', uploadDate: '2024-01-18' }
    ]
  },
  {
    id: '3',
    name: 'Green Energy Corp',
    industry: 'Manufacturing',
    investmentDate: '2021-12-10',
    investmentAmount: 1000000,
    equityPercentage: 30,
    currentValue: 800000,
    status: 'UNDER_PERFORMANCE',
    managementTeam: 'Robert Wilson (CEO), Maria Garcia (COO)',
    lastReportingDate: '2024-01-10',
    nextReportingDate: '2024-04-10',
    keyMetrics: {
      revenue: 1500000,
      growthRate: -10,
      employeeCount: 45,
      marketCap: 2666667
    },
    documents: [
      { id: '5', name: 'Performance Review', type: 'Analysis Report', uploadDate: '2024-01-10' },
      { id: '6', name: 'Turnaround Plan', type: 'Strategic Document', uploadDate: '2024-01-05' }
    ]
  },
  {
    id: '4',
    name: 'FinFlow Systems',
    industry: 'Finance',
    investmentDate: '2020-06-05',
    investmentAmount: 750000,
    equityPercentage: 35,
    currentValue: 2000000,
    status: 'EXITED',
    managementTeam: 'David Kim (CEO), Jennifer Lee (CFO)',
    lastReportingDate: '2023-12-15',
    nextReportingDate: '2024-03-15',
    keyMetrics: {
      revenue: 5000000,
      growthRate: 60,
      employeeCount: 75,
      marketCap: 5714286
    },
    documents: [
      { id: '7', name: 'Exit Strategy Report', type: 'Strategic Document', uploadDate: '2023-12-15' },
      { id: '8', name: 'Final Valuation', type: 'Financial Report', uploadDate: '2023-12-10' }
    ]
  }
];
