'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Building2,
  DollarSign,
  Calendar,
  ClipboardList,
  TrendingUp,
  Users,
  Shield,
  Target
} from 'lucide-react';

interface Application {
  id: string;
  applicantName: string;
  businessName: string;
  industry: string;
  requestedAmount: number;
  stage: string;
  createdAt: string;
  dueDiligence?: DueDiligence;
}

interface DueDiligence {
  id: string;
  marketResearchViable: boolean;
  marketResearchComments: string;
  financialViable: boolean;
  financialComments: string;
  competitiveOpportunities: boolean;
  competitiveComments: string;
  managementTeamQualified: boolean;
  managementComments: string;
  legalCompliant: boolean;
  legalComments: string;
  riskTolerable: boolean;
  riskComments: string;
  recommendation: 'APPROVE' | 'REJECT' | 'CONDITIONAL';
  finalComments: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

const recommendationColors = {
  APPROVE: 'bg-green-100 text-green-800',
  REJECT: 'bg-red-100 text-red-800',
  CONDITIONAL: 'bg-yellow-100 text-yellow-800'
};

const recommendationLabels = {
  APPROVE: 'Approve',
  REJECT: 'Reject',
  CONDITIONAL: 'Conditional'
};

const statusColors = {
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800'
};

const statusLabels = {
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed'
};

export default function DueDiligencePage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDueDiligenceForm, setShowDueDiligenceForm] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/auth");
      return;
    }
    fetchApplications();
  }, [router]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await fetch('/api/applications?stage=DUE_DILIGENCE', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      } else {
        // Mock data for development
        setApplications(mockApplications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      // Fallback to mock data
      setApplications(mockApplications);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.industry.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || 
                         (statusFilter === 'COMPLETED' && app.dueDiligence?.status === 'COMPLETED') ||
                         (statusFilter === 'IN_PROGRESS' && (!app.dueDiligence || app.dueDiligence.status === 'IN_PROGRESS'));
    
    return matchesSearch && matchesStatus;
  });

  const initiateDueDiligence = async (applicationId: string) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`/api/applications/${applicationId}/due-diligence/initiate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh applications
        fetchApplications();
      }
    } catch (error) {
      console.error('Error initiating due diligence:', error);
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

  const getDueDiligenceScore = (dueDiligence: DueDiligence): number => {
    const criteria = [
      dueDiligence.marketResearchViable,
      dueDiligence.financialViable,
      dueDiligence.competitiveOpportunities,
      dueDiligence.managementTeamQualified,
      dueDiligence.legalCompliant,
      dueDiligence.riskTolerable
    ];
    
    const passedCriteria = criteria.filter(Boolean).length;
    return Math.round((passedCriteria / criteria.length) * 100);
  };

  // Mock data for development
  const mockApplications: Application[] = [
    {
      id: '1',
      applicantName: 'John Smith',
      businessName: 'TechStart Solutions',
      industry: 'Technology',
      requestedAmount: 250000,
      stage: 'DUE_DILIGENCE',
      createdAt: '2024-08-20T10:00:00.000Z',
      dueDiligence: {
        id: 'dd1',
        marketResearchViable: true,
        marketResearchComments: 'Market research shows strong potential in the target market with growing demand for renewable energy solutions.',
        financialViable: true,
        financialComments: 'Financial projections are realistic and show positive cash flow within 18 months.',
        competitiveOpportunities: true,
        competitiveComments: 'Competitive analysis reveals clear market opportunities with limited competition.',
        managementTeamQualified: true,
        managementComments: 'Management team has strong qualifications and relevant experience.',
        legalCompliant: true,
        legalComments: 'All legal requirements are met with proper governance structure.',
        riskTolerable: true,
        riskComments: 'Risk assessment shows acceptable levels within tolerable limits.',
        recommendation: 'APPROVE',
        finalComments: 'Overall assessment is positive with strong potential and qualified team.',
        status: 'COMPLETED',
        createdAt: '2024-08-22T10:00:00.000Z',
        updatedAt: '2024-08-22T10:00:00.000Z'
      }
    },
    {
      id: '2',
      applicantName: 'Sarah Johnson',
      businessName: 'Green Energy Innovations',
      industry: 'Energy',
      requestedAmount: 500000,
      stage: 'DUE_DILIGENCE',
      createdAt: '2024-08-18T14:30:00.000Z'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Due Diligence Management
          </h1>
          <p className="text-gray-600">
            Review and conduct due diligence assessments for company applications
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search companies..."
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
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Applications for Due Diligence ({filteredApplications.length})
            </h3>
          </div>
          
          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No applications found for due diligence</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredApplications.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {app.businessName}
                        </h4>
                        {app.dueDiligence && (
                          <>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[app.dueDiligence.status]}`}>
                              {statusLabels[app.dueDiligence.status]}
                            </span>
                            {app.dueDiligence.recommendation && (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${recommendationColors[app.dueDiligence.recommendation]}`}>
                                {recommendationLabels[app.dueDiligence.recommendation]}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building2 className="w-4 h-4" />
                          <span>{app.industry}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span>{formatCurrency(app.requestedAmount)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(app.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <span>Applicant: {app.applicantName}</span>
                      </div>

                      {app.dueDiligence && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-900">Due Diligence Assessment</h5>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Score:</span>
                              <span className="text-lg font-bold text-blue-600">
                                {getDueDiligenceScore(app.dueDiligence)}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              {app.dueDiligence.marketResearchViable ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span>Market Research</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {app.dueDiligence.financialViable ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span>Financial Viability</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {app.dueDiligence.managementTeamQualified ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span>Management Team</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {!app.dueDiligence ? (
                        <button
                          onClick={() => initiateDueDiligence(app.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <ClipboardList className="w-4 h-4" />
                          Initiate DD
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowDueDiligenceForm(true);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            {app.dueDiligence.status === 'COMPLETED' ? 'Update' : 'Complete'}
                          </button>
                          <button
                            onClick={() => router.push(`/ERP/Portfolio/applications/${app.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Due Diligence Form Modal */}
        {showDueDiligenceForm && selectedApplication && (
          <DueDiligenceForm
            application={selectedApplication}
            onClose={() => {
              setShowDueDiligenceForm(false);
              setSelectedApplication(null);
            }}
            onSave={() => {
              setShowDueDiligenceForm(false);
              setSelectedApplication(null);
              fetchApplications();
            }}
          />
        )}
      </div>
    </div>
  );
}

// Due Diligence Form Component
function DueDiligenceForm({ 
  application, 
  onClose, 
  onSave 
}: { 
  application: Application; 
  onClose: () => void; 
  onSave: () => void; 
}) {
  const [form, setForm] = useState({
    marketResearchViable: true,
    marketResearchComments: '',
    financialViable: true,
    financialComments: '',
    competitiveOpportunities: true,
    competitiveComments: '',
    managementTeamQualified: true,
    managementComments: '',
    legalCompliant: true,
    legalComments: '',
    riskTolerable: true,
    riskComments: '',
    recommendation: 'APPROVE' as const,
    finalComments: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (application.dueDiligence) {
      setForm({
        marketResearchViable: application.dueDiligence.marketResearchViable,
        marketResearchComments: application.dueDiligence.marketResearchComments,
        financialViable: application.dueDiligence.financialViable,
        financialComments: application.dueDiligence.financialComments,
        competitiveOpportunities: application.dueDiligence.competitiveOpportunities,
        competitiveComments: application.dueDiligence.competitiveComments,
        managementTeamQualified: application.dueDiligence.managementTeamQualified,
        managementComments: application.dueDiligence.managementComments,
        legalCompliant: application.dueDiligence.legalCompliant,
        legalComments: application.dueDiligence.legalComments,
        riskTolerable: application.dueDiligence.riskTolerable,
        riskComments: application.dueDiligence.riskComments,
        recommendation: application.dueDiligence.recommendation,
        finalComments: application.dueDiligence.finalComments
      });
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`/api/applications/${application.id}/due-diligence`, {
        method: 'PUT',
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
      console.error('Error updating due diligence:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Due Diligence Assessment - {application.businessName}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Assessment Criteria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Market Research */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="marketResearch"
                  checked={form.marketResearchViable}
                  onChange={(e) => setForm(prev => ({ ...prev, marketResearchViable: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="marketResearch" className="font-medium text-gray-900">
                  Market Research Viable
                </label>
              </div>
              <textarea
                placeholder="Market research comments..."
                value={form.marketResearchComments}
                onChange={(e) => setForm(prev => ({ ...prev, marketResearchComments: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Financial Viability */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="financialViable"
                  checked={form.financialViable}
                  onChange={(e) => setForm(prev => ({ ...prev, financialViable: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="financialViable" className="font-medium text-gray-900">
                  Financial Viable
                </label>
              </div>
              <textarea
                placeholder="Financial viability comments..."
                value={form.financialComments}
                onChange={(e) => setForm(prev => ({ ...prev, financialComments: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Competitive Opportunities */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="competitiveOpportunities"
                  checked={form.competitiveOpportunities}
                  onChange={(e) => setForm(prev => ({ ...prev, competitiveOpportunities: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="competitiveOpportunities" className="font-medium text-gray-900">
                  Competitive Opportunities
                </label>
              </div>
              <textarea
                placeholder="Competitive analysis comments..."
                value={form.competitiveComments}
                onChange={(e) => setForm(prev => ({ ...prev, competitiveComments: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Management Team */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="managementTeam"
                  checked={form.managementTeamQualified}
                  onChange={(e) => setForm(prev => ({ ...prev, managementTeamQualified: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="managementTeam" className="font-medium text-gray-900">
                  Management Team Qualified
                </label>
              </div>
              <textarea
                placeholder="Management team assessment..."
                value={form.managementComments}
                onChange={(e) => setForm(prev => ({ ...prev, managementComments: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Legal Compliance */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="legalCompliant"
                  checked={form.legalCompliant}
                  onChange={(e) => setForm(prev => ({ ...prev, legalCompliant: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="legalCompliant" className="font-medium text-gray-900">
                  Legal Compliant
                </label>
              </div>
              <textarea
                placeholder="Legal compliance comments..."
                value={form.legalComments}
                onChange={(e) => setForm(prev => ({ ...prev, legalComments: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Risk Assessment */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="riskTolerable"
                  checked={form.riskTolerable}
                  onChange={(e) => setForm(prev => ({ ...prev, riskTolerable: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="riskTolerable" className="font-medium text-gray-900">
                  Risk Tolerable
                </label>
              </div>
              <textarea
                placeholder="Risk assessment comments..."
                value={form.riskComments}
                onChange={(e) => setForm(prev => ({ ...prev, riskComments: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Recommendation and Final Comments */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recommendation
              </label>
              <select
                value={form.recommendation}
                onChange={(e) => setForm(prev => ({ ...prev, recommendation: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="APPROVE">Approve</option>
                <option value="REJECT">Reject</option>
                <option value="CONDITIONAL">Conditional Approval</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Final Comments
              </label>
              <textarea
                placeholder="Overall assessment and final comments..."
                value={form.finalComments}
                onChange={(e) => setForm(prev => ({ ...prev, finalComments: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Save Assessment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
