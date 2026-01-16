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
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Data Preparation
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

  return (
    <div className="space-y-8 pb-10">
      {/* Simplified Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-400 mt-1">Full financial overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title="Total Balance"
          value={dashboardData?.totalBalance || 0}
          color="indigo"
          icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
        />
        <InfoCard
          title="Total Income"
          value={dashboardData?.totalIncome || 0}
          color="green"
          icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <InfoCard
          title="Total Expenses"
          value={dashboardData?.totalExpense || 0}
          color="red"
          icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm">
          <CustomLineChart
            data={dashboardData?.chartData || []}
            title="Income vs Expense Trend"
            lines={[
              { dataKey: 'income', color: '#818cf8', name: 'Income' },
              { dataKey: 'expense', color: '#f43f5e', name: 'Expense' }
            ]}
          />
        </div>
        
        <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm">
          <CustomPieChart
            data={expenseByCategory}
            title="Expense Breakdown"
            dataKey="amount"
            nameKey="name"
          />
        </div>
      </div>

      {/* Secondary Charts & List Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm">
          <CustomBarChart
            data={incomeBySource.slice(0, 6)}
            title="Top Income Sources"
            dataKey="amount"
            color="#818cf8" 
          />
        </div>
        <div className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
          <TransactionList
            transactions={dashboardData?.recentTransactions || []}
            title="Recent Activity"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;