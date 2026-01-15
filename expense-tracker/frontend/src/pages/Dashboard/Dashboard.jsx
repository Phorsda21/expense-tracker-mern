import { useState, useEffect } from 'react';
import { API } from '../../utils/helper';
import InfoCard from '../../components/Dashboard/InfoCard';
import TransactionList from '../../components/Dashboard/TransactionList';
import CustomPieChart from '../../components/Charts/CustomPieChart';
import CustomBarChart from '../../components/Charts/CustomBarChart';
import CustomLineChart from '../../components/Charts/CustomLineChart';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await API.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Prepare chart data
  const incomeBySource = dashboardData?.incomeBreakdown?.map(item => ({
    name: item.source,
    amount: item.amount,
    percentage: item.percentage
  })) || [];

  const expenseByCategory = dashboardData?.expenseBreakdown?.map(item => ({
    name: item.category,
    amount: item.amount,
    percentage: item.percentage
  })) || [];

  const chartData = dashboardData?.chartData || [];

  // Prepare line chart data with both income and expense
  const lineChartConfig = [
    { dataKey: 'income', color: '#10b981', name: 'Income' },
    { dataKey: 'expense', color: '#ef4444', name: 'Expense' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400">Track your financial overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="animate-fadeIn stagger-1" style={{ opacity: 0 }}>
          <InfoCard
            title="Total Balance"
            value={dashboardData?.totalBalance || 0}
            color="indigo"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            }
          />
        </div>
        
        <div className="animate-fadeIn stagger-2" style={{ opacity: 0 }}>
          <InfoCard
            title="Total Income"
            value={dashboardData?.totalIncome || 0}
            color="green"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>
        
        <div className="animate-fadeIn stagger-3" style={{ opacity: 0 }}>
          <InfoCard
            title="Total Expenses"
            value={dashboardData?.totalExpense || 0}
            color="red"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Charts Row 1 - Income vs Expense Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 animate-fadeIn stagger-2" style={{ opacity: 0 }}>
          <CustomLineChart
            data={chartData}
            title="Income vs Expense Trend"
            lines={lineChartConfig}
          />
        </div>
        
        <div className="animate-fadeIn stagger-3" style={{ opacity: 0 }}>
          <CustomPieChart
            data={expenseByCategory}
            title="Expense Breakdown"
            dataKey="amount"
            nameKey="name"
          />
        </div>
      </div>

      {/* Charts Row 2 - Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-fadeIn stagger-3" style={{ opacity: 0 }}>
          <CustomBarChart
            data={incomeBySource.slice(0, 6)}
            title="Income by Source"
            dataKey="amount"
            color="#10b981"
          />
        </div>
        
        <div className="animate-fadeIn stagger-4" style={{ opacity: 0 }}>
          <CustomPieChart
            data={incomeBySource}
            title="Income Distribution"
            dataKey="amount"
            nameKey="name"
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="animate-fadeIn stagger-4" style={{ opacity: 0 }}>
        <TransactionList
          transactions={dashboardData?.recentTransactions || []}
          title="Recent Transactions"
          emptyMessage="No transactions yet. Start by adding income or expenses."
        />
      </div>
    </div>
  );
};

export default Dashboard;
