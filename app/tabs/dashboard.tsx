'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, DollarSign, Activity, Target, Award, Download, Plus, ChevronDown, Building2, ArrowLeftRight, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: {
    name: string;
  };
}

interface UserResponse {
  success: boolean;
  data: UserData;
}

interface TargetData {
  id: string;
  type: string;
  value: string;
  deadline: string;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roleId: string;
    backgroundImage: string;
    createdAt: string;
    updatedAt: string;
    lastSeen: string;
  };
}

interface TargetsResponse {
  success: boolean;
  data: TargetData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface Transaction {
  id: string;
  accountId: string;
  accountName: string;
  accountNo: string;
  amount: number;
  transactionDate: string;
  description: string;
  referenceNumber: string;
}

interface ActualData {
  revenue: {
    amount: number;
    transactions: Transaction[];
    transactionDates: string[];
  };
  expenses: {
    amount: number;
    transactions: Transaction[];
    transactionDates: string[];
  };
  profit: {
    amount: number;
    dateRange: {
      earliestDate: string;
      latestDate: string;
    };
  };
}

interface ActualDataResponse {
  success: boolean;
  message: string;
  data: ActualData;
  timestamp: string;
}

interface ChartDataPoint {
  date: string;
  amount: number;
  cumulative: number;
  targetAmount?: number;
}

interface ComparisonChartDataPoint {
  date: string;
  firstTargetCumulative: number;
  secondTargetCumulative: number;
  firstTargetAmount: number;
  secondTargetAmount: number;
}

const Dashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState('Choose Target');
  const [firstTarget, setFirstTarget] = useState('Choose Target');
  const [secondTarget, setSecondTarget] = useState('Choose Target');
  
  // Ref to track if chart has been initialized to prevent multiple renders
  const chartInitializedRef = useRef(false);
  
  // User data state
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  
  // Targets data state
  const [targets, setTargets] = useState<TargetData[]>([]);
  const [targetsLoading, setTargetsLoading] = useState(true);
  
  // Actual data state
  const [actualData, setActualData] = useState<ActualData | null>(null);
  const [actualDataLoading, setActualDataLoading] = useState(true);
  
  // Chart data state - now handled by useMemo
  
  // Modal state
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetFormData, setTargetFormData] = useState({
    type: 'Revenue',
    value: '',
    deadline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targetError, setTargetError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchUserData();
    fetchTargets();
    fetchActualData();
  }, []);

  const fetchUserData = async () => {
    try {
      setUserLoading(true);
      const token = sessionStorage.getItem('token');
      const userId = sessionStorage.getItem('userID');
      
      if (!token || !userId) {
        throw new Error('Authentication data not found');
      }

      const response = await fetch(`https://nvccz-pi.vercel.app/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const data: UserResponse = await response.json();
      if (data.success) {
        setUserData(data.data);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchTargets = async () => {
    try {
      setTargetsLoading(true);
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('https://nvccz-pi.vercel.app/api/targets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch targets: ${response.status}`);
      }

      const data: TargetsResponse = await response.json();
      if (data.success) {
        setTargets(data.data);
      } else {
        throw new Error('Failed to fetch targets');
      }
    } catch (err) {
      console.error('Error fetching targets:', err);
    } finally {
      setTargetsLoading(false);
    }
  };

  const fetchActualData = async () => {
    try {
      setActualDataLoading(true);
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('https://nvccz-pi.vercel.app/api/target-tracking/actual-data', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch actual data: ${response.status}`);
      }

      const data: ActualDataResponse = await response.json();
      if (data.success) {
        setActualData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch actual data');
      }
    } catch (err) {
      console.error('Error fetching actual data:', err);
    } finally {
      setActualDataLoading(false);
    }
  };

  const handleTargetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTargetError(null); // Clear any previous errors
    
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('https://nvccz-pi.vercel.app/api/targets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: targetFormData.type,
          value: parseFloat(targetFormData.value),
          deadline: new Date(targetFormData.deadline).toISOString()
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Add the new target to the existing targets array
        setTargets(prev => [result.data, ...prev]);
        
        // Reset form and close modal
        setTargetFormData({
          type: 'Revenue',
          value: '',
          deadline: ''
        });
        setShowTargetModal(false);
        setTargetError(null);
      } else {
        // Handle API error response
        const errorMessage = result.error || result.message || 'Failed to create target';
        setTargetError(errorMessage);
      }
    } catch (err) {
      console.error('Error creating target:', err);
      setTargetError(err instanceof Error ? err.message : 'Failed to create target');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTargetFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (targetError) {
      setTargetError(null);
    }
  };

  const handleOpenModal = () => {
    setShowTargetModal(true);
    setTargetError(null); // Clear any previous errors
  };

  const handleCloseModal = () => {
    setShowTargetModal(false);
    setTargetError(null);
    // Reset form data
    setTargetFormData({
      type: 'Revenue',
      value: '',
      deadline: ''
    });
  };

  const formatTargetName = (target: TargetData) => {
    const deadline = new Date(target.deadline).toLocaleDateString();
    const value = parseFloat(target.value).toLocaleString();
    return `${target.type} - $${value} (Due: ${deadline})`;
  };

  // Generate chart data based on selected target
  const generateChartData = useCallback((targetId: string, targetType: string) => {
    if (!actualData || !targets) return [];

    const selectedTargetData = targets.find(t => t.id === targetId);
    if (!selectedTargetData) return [];

    const targetDeadline = new Date(selectedTargetData.deadline);
    const targetAmount = parseFloat(selectedTargetData.value);

    let transactions: Transaction[] = [];
    
    // Get transactions based on target type
    switch (targetType) {
      case 'Revenue':
        transactions = actualData.revenue.transactions;
        break;
      case 'Expenses':
        transactions = actualData.expenses.transactions;
        break;
      case 'Profit':
        // For profit, we'll use revenue - expenses
        const revenueTransactions = actualData.revenue.transactions;
        const expenseTransactions = actualData.expenses.transactions;
        transactions = [...revenueTransactions, ...expenseTransactions];
        break;
    }

    // Filter transactions up to target deadline
    const filteredTransactions = transactions.filter(t => 
      new Date(t.transactionDate) <= targetDeadline
    );

    // Sort by date
    filteredTransactions.sort((a, b) => 
      new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
    );

    // Generate chart data points
    const chartDataPoints: ChartDataPoint[] = [];
    let cumulative = 0;

    filteredTransactions.forEach((transaction, index) => {
      let amount = transaction.amount;
      
      // For profit calculation
      if (targetType === 'Profit') {
        // Determine if this is revenue or expense based on account type
        const isRevenue = actualData.revenue.transactions.some(t => t.id === transaction.id);
        amount = isRevenue ? amount : -amount;
      }

      cumulative += amount;
      
      chartDataPoints.push({
        date: new Date(transaction.transactionDate).toLocaleDateString(),
        amount: amount,
        cumulative: cumulative,
        targetAmount: targetAmount
      });
    });

    return chartDataPoints;
  }, [actualData?.revenue?.transactions, actualData?.expenses?.transactions]);

  // Combine chart data for comparison
  const combineChartData = useCallback((firstData: ChartDataPoint[], secondData: ChartDataPoint[], firstTargetData: TargetData, secondTargetData: TargetData) => {
    // Get all unique dates from both datasets
    const allDates = new Set([
      ...firstData.map(d => d.date),
      ...secondData.map(d => d.date)
    ]);
    
    const sortedDates = Array.from(allDates).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    const combinedData: ComparisonChartDataPoint[] = [];
    
    sortedDates.forEach(date => {
      const firstPoint = firstData.find(d => d.date === date);
      const secondPoint = secondData.find(d => d.date === date);
      
      combinedData.push({
        date: date,
        firstTargetCumulative: firstPoint?.cumulative || 0,
        secondTargetCumulative: secondPoint?.cumulative || 0,
        firstTargetAmount: firstPoint?.amount || 0,
        secondTargetAmount: secondPoint?.amount || 0
      });
    });

    return combinedData;
  }, []);

  // Auto-select first target when targets are loaded
  useEffect(() => {
    if (targets.length > 0 && selectedTarget === 'Choose Target') {
      setSelectedTarget(targets[0].id);
    }
  }, [targets, selectedTarget]);

  // Generate chart data using useMemo for better performance
  const chartData = useMemo(() => {
    // Only generate chart data when all data is loaded and a target is selected
    if (selectedTarget !== 'Choose Target' && 
        actualData && 
        targets && 
        !actualDataLoading && 
        !targetsLoading && 
        actualData.revenue?.transactions && 
        actualData.expenses?.transactions) {
      
      const selectedTargetData = targets.find(t => t.id === selectedTarget);
      if (selectedTargetData) {
        // Mark chart as initialized to prevent multiple renders
        chartInitializedRef.current = true;
        return generateChartData(selectedTarget, selectedTargetData.type);
      }
    }
    return [];
  }, [selectedTarget, actualDataLoading, targetsLoading, actualData?.revenue?.transactions, actualData?.expenses?.transactions]);

  // Generate comparison chart data using useMemo for better performance
  const comparisonChartData = useMemo(() => {
    // Only generate comparison data when all data is loaded and both targets are selected
    if (firstTarget !== 'Choose Target' && 
        secondTarget !== 'Choose Target' && 
        actualData && 
        targets && 
        !actualDataLoading && 
        !targetsLoading && 
        actualData.revenue?.transactions && 
        actualData.expenses?.transactions) {
      
      const firstTargetData = targets.find(t => t.id === firstTarget);
      const secondTargetData = targets.find(t => t.id === secondTarget);
      
      if (firstTargetData && secondTargetData) {
        const firstData = generateChartData(firstTarget, firstTargetData.type);
        const secondData = generateChartData(secondTarget, secondTargetData.type);
        
        // Combine the data for comparison chart
        return combineChartData(firstData, secondData, firstTargetData, secondTargetData);
      }
    }
    return [];
  }, [firstTarget, secondTarget, actualDataLoading, targetsLoading, actualData?.revenue?.transactions, actualData?.expenses?.transactions]);

  // Calculate progress percentage
  const calculateProgress = useCallback(() => {
    if (chartData.length === 0 || !selectedTarget || selectedTarget === 'Choose Target') return 0;
    
    const selectedTargetData = targets.find((t: TargetData) => t.id === selectedTarget);
    if (!selectedTargetData) return 0;
    
    const targetAmount = parseFloat(selectedTargetData.value);
    const currentAmount = chartData[chartData.length - 1]?.cumulative || 0;
    
    return Math.min((currentAmount / targetAmount) * 100, 100);
  }, [chartData, selectedTarget]);

  // Calculate total amount
  const calculateTotal = useCallback(() => {
    if (chartData.length === 0) return 0;
    return chartData[chartData.length - 1]?.cumulative || 0;
  }, [chartData]);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {userLoading ? (
              <div className="flex items-center space-x-3">
                <span>Good morning,</span>
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              `Good morning, ${userData ? `${userData.firstName} ${userData.lastName}` : 'admin'}`
            )}
          </h1>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <button 
            onClick={handleOpenModal}
            className="flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-all duration-200 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 text-gray-700" />
            <span className="text-gray-700 text-sm font-medium">Set Target</span>
          </button>
          
          <div className="relative w-full sm:w-auto">
            <select 
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="appearance-none w-full px-4 py-3 sm:py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-all duration-200 text-gray-900 text-sm pr-8"
              disabled={targetsLoading}
            >
              {targetsLoading ? (
                <option value="Choose Target">Loading targets...</option>
              ) : (
                <>
                  <option value="Choose Target">Choose Target</option>
                  {targets.map((target) => (
                    <option key={target.id} value={target.id}>
                      {formatTargetName(target)}
                    </option>
                  ))}
                </>
              )}
            </select>
            {targetsLoading ? (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            )}
          </div>
        </div>
      </div>

              {/* Target Per Month Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {targetsLoading ? (
                <div className="flex items-center space-x-2">
                  <span>Loading...</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : selectedTarget !== 'Choose Target' && targets.length > 0 
                ? `${targets.find(t => t.id === selectedTarget)?.type} Target`
                : 'Target Per Month'
              }
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="text-left sm:text-right">
                <p className={`text-sm font-medium ${calculateProgress() < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  Progress: {calculateProgress().toFixed(1)}%
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className={`text-sm font-medium ${calculateTotal() < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                  Total: ${calculateTotal().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        
        {/* Chart */}
        <div className="h-64 bg-gray-50 rounded-lg mb-6">
          {actualDataLoading || targetsLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400 mb-2">Loading chart data...</p>
                <p className="text-gray-500 text-sm">Please wait while we fetch your data.</p>
              </div>
            </div>
          ) : selectedTarget !== 'Choose Target' && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#374151',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString()}`,
                    name === 'cumulative' ? 'Cumulative Progress' : 'Individual Transaction'
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  wrapperStyle={{
                    paddingBottom: '10px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke={calculateTotal() < 0 ? "#EF4444" : "#3B82F6"}
                  strokeWidth={3}
                  dot={{ fill: calculateTotal() < 0 ? "#EF4444" : "#3B82F6", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8, stroke: calculateTotal() < 0 ? "#EF4444" : "#3B82F6", strokeWidth: 2 }}
                  name="Actual Progress"
                />
                {chartData[0]?.targetAmount && (
                  <ReferenceLine 
                    y={chartData[0].targetAmount} 
                    stroke="#EF4444" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{
                      value: `Target: $${chartData[0].targetAmount.toLocaleString()}`,
                      position: 'insideTopRight',
                      fill: '#EF4444',
                      fontSize: 12,
                      fontWeight: 'bold'
                    }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Select a target to view data.</p>
                <p className="text-gray-500 text-sm">Choose from the dropdown above.</p>
              </div>
            </div>
          )}
        </div>

        {/* Chart Legend - Bottom */}
        {selectedTarget !== 'Choose Target' && chartData.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">How to Read This Chart</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Blue Line:</span>
                  <span className="text-gray-600">Your actual progress over time</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-red-500 border-dashed rounded-full"></div>
                  <span className="text-gray-700 font-medium">Red Dashed Line:</span>
                  <span className="text-gray-600">Your target goal amount</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Data Points:</span>
                  <span className="text-gray-600">Individual transactions or milestones</span>
                </div>
              </div>
              <div className="space-y-2 text-gray-600">
                <p>• <strong>Hover</strong> over any point to see exact amounts and dates</p>
                <p>• <strong>Progress %</strong> shows how close you are to your target</p>
                <p>• <strong>Total</strong> is your current cumulative amount</p>
                <p>• <strong>Trend</strong> - upward line means you're on track!</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Target Comparison Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Target Comparison</h3>
        
        {/* Dropdown Menus */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <select 
              value={firstTarget}
              onChange={(e) => setFirstTarget(e.target.value)}
              className="w-full appearance-none px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-all duration-200 text-gray-900 text-sm pr-8"
              disabled={targetsLoading}
            >
              {targetsLoading ? (
                <option value="Choose Target">Loading targets...</option>
              ) : (
                <>
                  <option value="Choose Target">Choose Target</option>
                  {targets.map((target) => (
                    <option key={target.id} value={target.id}>
                      {formatTargetName(target)}
                    </option>
                  ))}
                </>
              )}
            </select>
            {targetsLoading ? (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            )}
          </div>
          
          <div className="relative">
            <select 
              value={secondTarget}
              onChange={(e) => setSecondTarget(e.target.value)}
              className="w-full appearance-none px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-all duration-200 text-gray-900 text-sm pr-8"
              disabled={targetsLoading}
            >
              {targetsLoading ? (
                <option value="Choose Target">Loading targets...</option>
              ) : (
                <>
                  <option value="Choose Target">Choose Target</option>
                  {targets.map((target) => (
                    <option key={target.id} value={target.id}>
                      {formatTargetName(target)}
                    </option>
                  ))}
                </>
              )}
            </select>
            {targetsLoading ? (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            )}
          </div>
        </div>
        
        {/* Comparison Chart */}
        <div className="h-48 bg-gray-50 rounded-lg mb-6">
          {actualDataLoading || targetsLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Loading comparison data...</p>
                <p className="text-gray-500 text-xs">Please wait while we fetch your data.</p>
              </div>
            </div>
          ) : firstTarget !== 'Choose Target' && secondTarget !== 'Choose Target' && comparisonChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={10}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={10}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#374151',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString()}`,
                    name === 'firstTargetCumulative' ? 'First Target Progress' : 'Second Target Progress'
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  wrapperStyle={{
                    paddingBottom: '10px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="firstTargetCumulative" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 7, stroke: '#3B82F6', strokeWidth: 2 }}
                  name="First Target"
                />
                <Line 
                  type="monotone" 
                  dataKey="secondTargetCumulative" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 7, stroke: '#10B981', strokeWidth: 2 }}
                  name="Second Target"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ArrowLeftRight className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">Select two targets to compare.</p>
                <p className="text-gray-500 text-xs">Choose from the dropdown menus above.</p>
              </div>
            </div>
          )}
        </div>

        {/* Comparison Chart Legend - Bottom */}
        {firstTarget !== 'Choose Target' && secondTarget !== 'Choose Target' && comparisonChartData.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">How to Compare Targets</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Blue Line:</span>
                  <span className="text-gray-600">First target progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Green Line:</span>
                  <span className="text-gray-600">Second target progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Data Points:</span>
                  <span className="text-gray-600">Key milestones for each target</span>
                </div>
              </div>
              <div className="space-y-2 text-gray-600">
                <p>• <strong>Higher line</strong> = better performance</p>
                <p>• <strong>Steeper slope</strong> = faster progress</p>
                <p>• <strong>Hover</strong> to see exact values and dates</p>
                <p>• <strong>Compare</strong> which target is performing better</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Target Creation Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div 
          className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl"
          style={{
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(229, 231, 235, 0.4)'
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create New Target</h2>
            <button 
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleTargetSubmit} className="space-y-6">
            {/* Error Display */}
            {targetError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <p className="text-red-600 text-sm font-medium">Error</p>
                </div>
                <p className="text-red-500 text-sm mt-1">{targetError}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Type*
                </label>
                <select
                  name="type"
                  value={targetFormData.type}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
                  required
                  disabled={isSubmitting}
                >
                  <option value="Revenue">Revenue</option>
                  <option value="Expenses">Expenses</option>
                  <option value="Profit">Profit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Value*
                </label>
                <input
                  type="number"
                  name="value"
                  value={targetFormData.value}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline*
              </label>
              <input
                type="date"
                name="deadline"
                value={targetFormData.deadline}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg transition-colors duration-200 font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50 font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Target'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </div>
  );
};

export default Dashboard; 
