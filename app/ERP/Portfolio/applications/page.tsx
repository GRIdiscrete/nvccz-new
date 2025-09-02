'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Plus, Eye, Edit, Clock, CheckCircle, AlertCircle, XCircle, FileText, Building2, DollarSign, Calendar } from 'lucide-react';

interface Application {
  id: string;
  companyName: string;
  applicantName: string;
  applicantEmail: string;
  industry: string;
  requestedAmount: number;
  stage: 'PENDING' | 'UNDER_REVIEW' | 'DUE_DILIGENCE' | 'BOARD_REVIEW' | 'APPROVED' | 'REJECTED';
  submissionDate: string;
  lastUpdated: string;
  status: 'ACTIVE' | 'ON_HOLD' | 'WITHDRAWN';
}

const stageColors = {
  PENDING: 'bg-yellow-50 text-yellow-800',
  UNDER_REVIEW: 'bg-blue-50 text-blue-800',
  DUE_DILIGENCE: 'bg-purple-50 text-purple-800',
  BOARD_REVIEW: 'bg-indigo-50 text-indigo-800',
  APPROVED: 'bg-green-50 text-green-800',
  REJECTED: 'bg-red-50 text-red-800'
};

const stageLabels = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  DUE_DILIGENCE: 'Due Diligence',
  BOARD_REVIEW: 'Board Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
};

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [industryFilter, setIndustryFilter] = useState<string>('ALL');

  useEffect(() => {
    // Check authentication
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    fetchApplications();
  }, [router]);

  const fetchApplications = async () => {
    try {
      // Mock data for demonstration
      setApplications(mockApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(application => {
    const matchesSearch = application.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         application.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         application.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'ALL' || application.stage === stageFilter;
    const matchesIndustry = industryFilter === 'ALL' || application.industry === industryFilter;
    
    return matchesSearch && matchesStage && matchesIndustry;
  });

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'UNDER_REVIEW':
        return <FileText className="w-4 h-4" />;
      case 'DUE_DILIGENCE':
        return <Building2 className="w-4 h-4" />;
      case 'BOARD_REVIEW':
        return <CheckCircle className="w-4 h-4" />;
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

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

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 p-6">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-slate-200/70" />
        <div className="h-96 animate-pulse rounded-2xl bg-white/70 ring-1 ring-slate-200/60" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Company Applications</h1>
          <p className="text-sm text-slate-500">Review and manage investment applications from companies</p>
        </div>
        <button
          onClick={() => router.push('/ERP/Portfolio/applications/create')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Application
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-50 shadow-xs mb-0 mr-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Applications</p>
              <p className="text-2xl font-semibold text-slate-900">{applications.length}</p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-yellow-50 shadow-xs mb-0 mr-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Pending Review</p>
              <p className="text-2xl font-semibold text-slate-900">
                {applications.filter(app => app.stage === 'PENDING' || app.stage === 'UNDER_REVIEW').length}
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-purple-50 shadow-xs mb-0 mr-4">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Due Diligence</p>
              <p className="text-2xl font-semibold text-slate-900">
                {applications.filter(app => app.stage === 'DUE_DILIGENCE').length}
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-green-50 shadow-xs mb-0 mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Approved</p>
              <p className="text-2xl font-semibold text-slate-900">
                {applications.filter(app => app.stage === 'APPROVED').length}
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
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Stages</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="DUE_DILIGENCE">Due Diligence</option>
              <option value="BOARD_REVIEW">Board Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
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

      {/* Applications List */}
      <div className="group rounded-2xl border border-slate-200/60 bg-white/70 shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/60">
          <h2 className="text-lg font-semibold text-slate-800">Applications ({filteredApplications.length})</h2>
        </div>
        
        {filteredApplications.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No applications found matching your criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/60">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className="p-6 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-1">{application.companyName}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {application.industry}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(application.requestedAmount)}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${stageColors[application.stage]}`}>
                        {getStageIcon(application.stage)}
                        {stageLabels[application.stage]}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Applicant</p>
                        <p className="font-medium">{application.applicantName}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Email</p>
                        <p className="font-medium">{application.applicantEmail}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Submission Date</p>
                        <p className="font-medium">{formatDate(application.submissionDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/ERP/Portfolio/applications/${application.id}`)}
                      className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                    <button
                      onClick={() => router.push(`/ERP/Portfolio/applications/${application.id}/edit`)}
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
const mockApplications: Application[] = [
  {
    id: '1',
    companyName: 'TechStart Solutions',
    applicantName: 'John Smith',
    applicantEmail: 'john.smith@techstart.com',
    industry: 'Technology',
    requestedAmount: 500000,
    stage: 'DUE_DILIGENCE',
    submissionDate: '2024-01-15',
    lastUpdated: '2024-01-20',
    status: 'ACTIVE'
  },
  {
    id: '2',
    companyName: 'HealthTech Innovations',
    applicantName: 'Dr. Michael Chen',
    applicantEmail: 'mchen@healthtech.com',
    industry: 'Healthcare',
    requestedAmount: 300000,
    stage: 'BOARD_REVIEW',
    submissionDate: '2024-01-10',
    lastUpdated: '2024-01-18',
    status: 'ACTIVE'
  },
  {
    id: '3',
    companyName: 'Green Energy Corp',
    applicantName: 'Robert Wilson',
    applicantEmail: 'rwilson@greenenergy.com',
    industry: 'Manufacturing',
    requestedAmount: 1000000,
    stage: 'UNDER_REVIEW',
    submissionDate: '2024-01-20',
    lastUpdated: '2024-01-22',
    status: 'ACTIVE'
  },
  {
    id: '4',
    companyName: 'FinFlow Systems',
    applicantName: 'David Kim',
    applicantEmail: 'dkim@finflow.com',
    industry: 'Finance',
    requestedAmount: 750000,
    stage: 'APPROVED',
    submissionDate: '2024-01-05',
    lastUpdated: '2024-01-15',
    status: 'ACTIVE'
  },
  {
    id: '5',
    companyName: 'RetailTech Solutions',
    applicantName: 'Sarah Johnson',
    applicantEmail: 'sjohnson@retailtech.com',
    industry: 'Retail',
    requestedAmount: 400000,
    stage: 'PENDING',
    submissionDate: '2024-01-25',
    lastUpdated: '2024-01-25',
    status: 'ACTIVE'
  }
];
