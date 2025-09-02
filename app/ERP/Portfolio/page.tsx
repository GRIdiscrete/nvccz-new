'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, FileText, TrendingUp, Users, DollarSign, ClipboardList, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';

interface PortfolioStats {
  totalCompanies: number;
  activeInvestments: number;
  pendingApplications: number;
  totalPortfolioValue: number;
  applicationsInReview: number;
  dueDiligenceInProgress: number;
}

export default function PortfolioPage() {
  const router = useRouter();
  const [stats, setStats] = useState<PortfolioStats>({
    totalCompanies: 0,
    activeInvestments: 0,
    pendingApplications: 0,
    totalPortfolioValue: 0,
    applicationsInReview: 0,
    dueDiligenceInProgress: 0
  });

  useEffect(() => {
    // Check authentication
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    fetchPortfolioStats();
  }, [router]);

  const fetchPortfolioStats = async () => {
    try {
      // Mock data for demonstration
      setStats({
        totalCompanies: 12,
        activeInvestments: 8,
        pendingApplications: 5,
        totalPortfolioValue: 25000000,
        applicationsInReview: 3,
        dueDiligenceInProgress: 2
      });
    } catch (error) {
      console.error('Error fetching portfolio stats:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const navigationCards = [
    {
      title: 'Company Applications',
      description: 'Review and manage investment applications',
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      path: '/ERP/Portfolio/applications'
    },
    {
      title: 'Due Diligence',
      description: 'Conduct comprehensive company assessments',
      icon: <ClipboardList className="w-8 h-8 text-green-600" />,
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      path: '/ERP/Portfolio/due-diligence'
    },
    {
      title: 'Fund Management',
      description: 'Manage investment funds and allocations',
      icon: <DollarSign className="w-8 h-8 text-purple-600" />,
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      path: '/ERP/Portfolio/funds'
    },
    {
      title: 'Portfolio Companies',
      description: 'Track active portfolio companies',
      icon: <Building2 className="w-8 h-8 text-indigo-600" />,
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100',
      path: '/ERP/Portfolio/companies'
    },
    {
      title: 'Investment Implementation',
      description: 'Manage investment execution and milestones',
      icon: <TrendingUp className="w-8 h-8 text-amber-600" />,
      bgColor: 'bg-amber-50',
      hoverColor: 'hover:bg-amber-100',
      path: '/ERP/Portfolio/investments'
    }
  ];

  const quickActions = [
    {
      title: 'New Application',
      description: 'Create new investment application',
      icon: <Plus className="w-5 h-5" />,
      action: () => router.push('/ERP/Portfolio/applications/create')
    },
    {
      title: 'Due Diligence Report',
      description: 'Generate due diligence assessment',
      icon: <ClipboardList className="w-5 h-5" />,
      action: () => router.push('/ERP/Portfolio/due-diligence')
    },
    {
      title: 'Fund Creation',
      description: 'Create new investment fund',
      icon: <DollarSign className="w-5 h-5" />,
      action: () => router.push('/ERP/Portfolio/funds')
    }
  ];

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Portfolio Management</h1>
          <p className="text-sm text-slate-500">Comprehensive investment portfolio management and tracking</p>
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
              <p className="text-2xl font-semibold text-slate-900">{stats.totalCompanies}</p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-green-50 shadow-xs mb-0 mr-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Active Investments</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.activeInvestments}</p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-yellow-50 shadow-xs mb-0 mr-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Pending Applications</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.pendingApplications}</p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-purple-50 shadow-xs mb-0 mr-4">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Portfolio Value</p>
              <p className="text-2xl font-semibold text-slate-900">{formatCurrency(stats.totalPortfolioValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Portfolio Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navigationCards.map((card) => (
            <div
              key={card.title}
              onClick={() => router.push(card.path)}
              className={`${card.bgColor} ${card.hoverColor} rounded-xl p-6 border border-slate-200/50 transition-all duration-300 ease-in-out hover:shadow-md hover:border-slate-300/50 group cursor-pointer`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white shadow-xs mb-4 group-hover:scale-105 transition-transform">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-light text-slate-800 tracking-tight mb-1 group-hover:text-slate-700 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-slate-500 font-light text-sm">
                    {card.description}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200/50 group-hover:border-slate-300/50 transition-colors">
                <span className="text-xs font-light text-slate-600 tracking-wide">VIEW SECTION →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-6 shadow">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={action.action}
              className="flex items-center px-4 py-3 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors text-left"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-xs mr-3">
                {action.icon}
              </div>
              <div>
                <p className="font-medium text-slate-900">{action.title}</p>
                <p className="text-sm text-slate-600">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
