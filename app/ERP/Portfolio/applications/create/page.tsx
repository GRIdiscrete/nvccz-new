'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  FileText,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface Document {
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  isRequired: boolean;
}

interface ApplicationForm {
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantAddress: string;
  businessName: string;
  businessDescription: string;
  industry: string;
  businessStage: string;
  foundingDate: string;
  requestedAmount: number;
  documents: Document[];
}

const documentTypes = [
  { value: 'BUSINESS_PLAN', label: 'Business Plan', required: true },
  { value: 'PROOF_OF_CONCEPT', label: 'Proof of Concept', required: true },
  { value: 'MARKET_RESEARCH', label: 'Market Research', required: true },
  { value: 'PROJECTED_CASH_FLOWS', label: 'Projected Cash Flows', required: true },
  { value: 'HISTORICAL_FINANCIALS', label: 'Historical Financials', required: false },
  { value: 'TEAM_RESUMES', label: 'Team Resumes', required: false },
  { value: 'LEGAL_DOCUMENTS', label: 'Legal Documents', required: false }
];

const industries = [
  'Technology', 'Energy', 'Healthcare', 'Finance', 'Manufacturing', 
  'Agriculture', 'Education', 'Transportation', 'Retail', 'Other'
];

const businessStages = [
  'IDEA', 'STARTUP', 'EARLY_GROWTH', 'GROWTH', 'MATURE', 'SCALE_UP'
];

export default function CreateApplicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<ApplicationForm>({
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    applicantAddress: '',
    businessName: '',
    businessDescription: '',
    industry: '',
    businessStage: '',
    foundingDate: '',
    requestedAmount: 0,
    documents: []
  });

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/auth");
    }
  }, [router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.applicantName.trim()) newErrors.applicantName = 'Applicant name is required';
    if (!form.applicantEmail.trim()) newErrors.applicantEmail = 'Email is required';
    if (!form.applicantPhone.trim()) newErrors.applicantPhone = 'Phone number is required';
    if (!form.applicantAddress.trim()) newErrors.applicantAddress = 'Address is required';
    if (!form.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!form.businessDescription.trim()) newErrors.businessDescription = 'Business description is required';
    if (!form.industry) newErrors.industry = 'Industry is required';
    if (!form.businessStage) newErrors.businessStage = 'Business stage is required';
    if (!form.foundingDate) newErrors.foundingDate = 'Founding date is required';
    if (form.requestedAmount <= 0) newErrors.requestedAmount = 'Requested amount must be greater than 0';

    // Validate required documents
    const requiredDocs = documentTypes.filter(doc => doc.required);
    const missingDocs = requiredDocs.filter(doc => 
      !form.documents.some(formDoc => formDoc.documentType === doc.value)
    );
    
    if (missingDocs.length > 0) {
      newErrors.documents = `Missing required documents: ${missingDocs.map(doc => doc.label).join(', ')}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/ERP/Portfolio/applications/${data.applicationId}`);
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || 'Failed to create application' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred while creating the application' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ApplicationForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addDocument = (documentType: string, fileName: string, fileUrl: string, fileSize: number) => {
    const isRequired = documentTypes.find(doc => doc.value === documentType)?.required || false;
    const newDoc: Document = { documentType, fileName, fileUrl, fileSize, isRequired };
    
    // Remove existing document of same type
    const filteredDocs = form.documents.filter(doc => doc.documentType !== documentType);
    setForm(prev => ({ ...prev, documents: [...filteredDocs, newDoc] }));
    
    if (errors.documents) {
      setErrors(prev => ({ ...prev, documents: '' }));
    }
  };

  const removeDocument = (documentType: string) => {
    setForm(prev => ({ 
      ...prev, 
      documents: prev.documents.filter(doc => doc.documentType !== documentType) 
    }));
  };

  const getDocumentLabel = (documentType: string) => {
    return documentTypes.find(doc => doc.value === documentType)?.label || documentType;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create New Application
              </h1>
              <p className="text-gray-600">
                Submit a new company investment application
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Applicant Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Applicant Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={form.applicantName}
                  onChange={(e) => handleInputChange('applicantName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.applicantName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John Smith"
                />
                {errors.applicantName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.applicantName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={form.applicantEmail}
                  onChange={(e) => handleInputChange('applicantEmail', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.applicantEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john.smith@company.com"
                />
                {errors.applicantEmail && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.applicantEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={form.applicantPhone}
                  onChange={(e) => handleInputChange('applicantPhone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.applicantPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+263771234567"
                />
                {errors.applicantPhone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.applicantPhone}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={form.applicantAddress}
                  onChange={(e) => handleInputChange('applicantAddress', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.applicantAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123 Innovation Street, Harare, Zimbabwe"
                />
                {errors.applicantAddress && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.applicantAddress}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-600" />
              Business Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.businessName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="TechStart Solutions"
                />
                {errors.businessName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.businessName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  value={form.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.industry ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
                {errors.industry && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.industry}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Stage *
                </label>
                <select
                  value={form.businessStage}
                  onChange={(e) => handleInputChange('businessStage', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.businessStage ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Stage</option>
                  {businessStages.map(stage => (
                    <option key={stage} value={stage}>{stage.replace('_', ' ')}</option>
                  ))}
                </select>
                {errors.businessStage && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.businessStage}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Founding Date *
                </label>
                <input
                  type="date"
                  value={form.foundingDate}
                  onChange={(e) => handleInputChange('foundingDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.foundingDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.foundingDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.foundingDate}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description *
                </label>
                <textarea
                  value={form.businessDescription}
                  onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.businessDescription ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe your business, its mission, and what makes it unique..."
                />
                {errors.businessDescription && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.businessDescription}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requested Investment Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={form.requestedAmount}
                    onChange={(e) => handleInputChange('requestedAmount', parseFloat(e.target.value) || 0)}
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.requestedAmount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="250000"
                    min="0"
                    step="1000"
                  />
                </div>
                {errors.requestedAmount && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.requestedAmount}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Required Documents
            </h2>
            
            <div className="space-y-4">
              {documentTypes.map(docType => (
                <div key={docType.value} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${docType.required ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{docType.label}</p>
                      <p className="text-sm text-gray-500">
                        {docType.required ? 'Required' : 'Optional'}
                      </p>
                    </div>
                  </div>
                  
                  {form.documents.find(doc => doc.documentType === docType.value) ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600 font-medium">Uploaded</span>
                      <button
                        type="button"
                        onClick={() => removeDocument(docType.value)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        // Mock document upload - in real app, this would open file picker
                        const mockFileName = `${docType.label.toLowerCase().replace(' ', '-')}.pdf`;
                        addDocument(docType.value, mockFileName, `https://example.com/${mockFileName}`, 1024000);
                      }}
                      className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {errors.documents && (
              <p className="mt-4 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.documents}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Application
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
