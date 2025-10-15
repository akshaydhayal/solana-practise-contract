import React, { useState } from 'react';
import { 
  Shield, Zap, TrendingUp, Users, Calendar, Clock, 
  Wallet, Plus, ChevronRight, Star, Lock, Unlock,
  ArrowUpRight, DollarSign, Activity, Settings,
  Eye, EyeOff, Copy, ExternalLink, AlertTriangle,
  Download, Bell, Gift, Target, PieChart, BarChart3,
  User, LogOut, Menu, X, Home
} from 'lucide-react';

const VestingPlatform = () => {
  const [userRole, setUserRole] = useState('company'); // 'company' or 'employee'
  const [activeView, setActiveView] = useState('dashboard');
  const [isConnected, setIsConnected] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mock company data
  const companyData = {
    name: 'TechCorp',
    totalTokens: 1000000,
    allocatedTokens: 450000,
    employees: 12,
    activeVesting: 8
  };

  // Mock employee data (when user is logged in as employee)
  const employeeData = {
    name: 'Alice Johnson',
    role: 'Senior Engineer',
    company: 'TechCorp',
    totalVested: 50000,
    claimed: 20000,
    available: 5000,
    nextRelease: 30,
    cliffDate: '2024-06-01',
    vestingStart: '2023-06-01',
    vestingEnd: '2027-06-01',
    releaseSchedule: 'Monthly',
    progress: 40,
    avatar: '👩‍💻'
  };

  const employees = [
    { 
      id: 1, 
      name: 'Alice Johnson', 
      role: 'Senior Engineer', 
      totalVested: 50000, 
      claimed: 20000, 
      available: 5000,
      cliffDate: '2024-06-01',
      status: 'active',
      progress: 40,
      avatar: '👩‍💻'
    },
    { 
      id: 2, 
      name: 'Bob Smith', 
      role: 'Product Manager', 
      totalVested: 75000, 
      claimed: 45000, 
      available: 0,
      cliffDate: '2024-03-15',
      status: 'active',
      progress: 60,
      avatar: '👨‍💼'
    },
    { 
      id: 3, 
      name: 'Carol Davis', 
      role: 'Designer', 
      totalVested: 30000, 
      claimed: 0, 
      available: 0,
      cliffDate: '2024-12-01',
      status: 'cliff',
      progress: 0,
      avatar: '👩‍🎨'
    }
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = 'blue', onClick }) => (
    <div 
      className={`bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-${color}-50 group-hover:scale-110 transition-transform`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <ArrowUpRight size={16} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 text-sm">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );

  const NavigationSidebar = () => {
    const companyNavItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Activity },
      { id: 'employees', label: 'Employees', icon: Users },
      { id: 'create', label: 'Add Employee', icon: Plus },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp },
      { id: 'settings', label: 'Settings', icon: Settings }
    ];

    const employeeNavItems = [
      { id: 'dashboard', label: 'My Dashboard', icon: Home },
      { id: 'vesting', label: 'Vesting Details', icon: PieChart },
      { id: 'claim', label: 'Claim Tokens', icon: Download },
      { id: 'history', label: 'Claim History', icon: Clock },
      { id: 'profile', label: 'Profile', icon: User }
    ];

    const navItems = userRole === 'company' ? companyNavItems : employeeNavItems;

    return (
      <div className={`${sidebarOpen ? 'w-80' : 'w-20'} bg-white shadow-2xl border-r border-gray-100 flex flex-col transition-all duration-300`}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
              <Shield className="text-white" size={24} />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">VestLab</h1>
                <p className="text-sm text-gray-500">Token Vesting Platform</p>
              </div>
            )}
          </div>
          
          {sidebarOpen && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <div className={`w-8 h-8 ${userRole === 'company' ? 'bg-green-500' : 'bg-blue-500'} rounded-full flex items-center justify-center`}>
                <span className="text-white text-sm font-bold">
                  {userRole === 'company' ? 'T' : 'A'}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {userRole === 'company' ? companyData.name : employeeData.name}
                </p>
                <p className="text-xs text-gray-500">
                  {userRole === 'company' ? 'Company Admin' : employeeData.role}
                </p>
              </div>
              <button 
                onClick={() => setUserRole(userRole === 'company' ? 'employee' : 'company')}
                className="text-gray-400 hover:text-gray-600"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
        
        <nav className="flex-1 p-6">
          <div className="space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeView === item.id 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <item.icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>
        
        {sidebarOpen && (
          <div className="p-6 border-t border-gray-100">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4 text-white">
              <h3 className="font-semibold mb-2">
                {userRole === 'company' ? 'Upgrade to Pro' : 'Need Help?'}
              </h3>
              <p className="text-sm text-purple-100 mb-3">
                {userRole === 'company' ? 'Unlock advanced vesting features' : 'Contact your company admin'}
              </p>
              <button className="w-full bg-white/20 backdrop-blur rounded-lg py-2 text-sm font-medium hover:bg-white/30 transition-colors">
                {userRole === 'company' ? 'Learn More' : 'Get Support'}
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-6 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
        >
          {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
        </button>
      </div>
    );
  };

  // EMPLOYEE DASHBOARD VIEWS
  const EmployeeDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{employeeData.avatar}</div>
            <div>
              <h2 className="text-4xl font-bold mb-2">Welcome, {employeeData.name}!</h2>
              <p className="text-blue-100 text-lg">{employeeData.role} at {employeeData.company}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
              <p className="text-sm text-blue-100">Next Release In</p>
              <p className="text-2xl font-bold">{employeeData.nextRelease} Days</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Target size={24} />
              <span className="font-medium">Total Allocated</span>
            </div>
            <p className="text-3xl font-bold">{employeeData.totalVested.toLocaleString()}</p>
            <p className="text-blue-200 text-sm">Tokens in your vesting schedule</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Download size={24} />
              <span className="font-medium">Already Claimed</span>
            </div>
            <p className="text-3xl font-bold">{employeeData.claimed.toLocaleString()}</p>
            <p className="text-blue-200 text-sm">{employeeData.progress}% of total allocation</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Gift size={24} />
              <span className="font-medium">Available Now</span>
            </div>
            <p className="text-3xl font-bold text-yellow-300">{employeeData.available.toLocaleString()}</p>
            <p className="text-blue-200 text-sm">Ready to claim</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Vesting Progress</span>
            <span>{employeeData.progress}% complete</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full h-4 transition-all duration-1000 ease-out"
              style={{ width: `${employeeData.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div 
          className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 cursor-pointer group hover:shadow-2xl transition-all"
          onClick={() => setActiveView('claim')}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-2xl group-hover:bg-green-100 transition-colors">
              <Download className="text-green-600" size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Claim Tokens</h3>
              <p className="text-gray-600">Withdraw your available tokens</p>
            </div>
          </div>
          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-green-800 font-bold text-xl">{employeeData.available.toLocaleString()} Tokens Available</p>
            <p className="text-green-600 text-sm">Click to claim your vested tokens</p>
          </div>
        </div>

        <div 
          className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 cursor-pointer group hover:shadow-2xl transition-all"
          onClick={() => setActiveView('vesting')}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-purple-50 rounded-2xl group-hover:bg-purple-100 transition-colors">
              <PieChart className="text-purple-600" size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Vesting Schedule</h3>
              <p className="text-gray-600">View your complete vesting plan</p>
            </div>
          </div>
          <div className="bg-purple-50 rounded-2xl p-4">
            <p className="text-purple-800 font-bold">Monthly Releases</p>
            <p className="text-purple-600 text-sm">Started {employeeData.vestingStart}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'Tokens Claimed', amount: '5,000 tokens', date: '2024-03-15', status: 'success' },
            { action: 'Monthly Release', amount: '5,000 tokens unlocked', date: '2024-03-01', status: 'info' },
            { action: 'Tokens Claimed', amount: '5,000 tokens', date: '2024-02-15', status: 'success' }
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                activity.status === 'success' ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                {activity.status === 'success' ? 
                  <Download className="text-green-600" size={20} /> :
                  <Clock className="text-blue-600" size={20} />
                }
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{activity.action}</p>
                <p className="text-gray-600">{activity.amount}</p>
              </div>
              <span className="text-sm text-gray-500">{activity.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const EmployeeClaimView = () => (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Claim Your Tokens</h2>
        <p className="text-gray-600">Withdraw tokens that have been unlocked according to your vesting schedule</p>
      </div>

      {/* Claim Interface */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="text-white" size={40} />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {employeeData.available.toLocaleString()} Tokens
          </h3>
          <p className="text-gray-600">Available to claim right now</p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
              <input 
                type="text" 
                value={employeeData.company}
                readOnly
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Employee Name</label>
              <input 
                type="text" 
                value={employeeData.name}
                readOnly
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        <button 
          className={`w-full py-6 rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] ${
            employeeData.available > 0 
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-xl' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={employeeData.available === 0}
        >
          <Download size={24} className="inline mr-3" />
          {employeeData.available > 0 ? `Claim ${employeeData.available.toLocaleString()} Tokens` : 'No Tokens Available'}
        </button>

        {employeeData.available === 0 && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <Clock className="text-orange-600" size={20} />
              <div>
                <p className="font-semibold text-orange-800">Next Release in {employeeData.nextRelease} Days</p>
                <p className="text-orange-600 text-sm">Your next batch of tokens will be available soon</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vesting Summary */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Your Vesting Summary</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-2xl">
            <p className="text-2xl font-bold text-gray-900">{employeeData.totalVested.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Allocated</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-2xl">
            <p className="text-2xl font-bold text-green-700">{employeeData.claimed.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Already Claimed</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-2xl">
            <p className="text-2xl font-bold text-blue-700">{employeeData.available.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Available Now</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-2xl">
            <p className="text-2xl font-bold text-purple-700">
              {(employeeData.totalVested - employeeData.claimed - employeeData.available).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Still Vesting</p>
          </div>
        </div>
      </div>
    </div>
  );

  // COMPANY DASHBOARD VIEWS (keeping the previous ones)
  const CompanyDashboard = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back! 👋</h2>
          <p className="text-gray-600">Here's what's happening with your vesting program today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <Calendar size={16} />
            <span className="text-sm font-medium">This Month</span>
          </button>
          <button 
            onClick={() => setActiveView('create')}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus size={16} />
            <span className="font-medium">Add Employee</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
        <StatCard
          icon={DollarSign}
          title="Total Allocated"
          value={`${(companyData.allocatedTokens / 1000).toFixed(0)}K`}
          subtitle="of 1M tokens"
          trend={12}
          color="green"
        />
        <StatCard
          icon={Users}
          title="Active Employees"
          value={companyData.employees}
          subtitle="8 vesting schedules"
          trend={8}
          color="blue"
          onClick={() => setActiveView('employees')}
        />
        <StatCard
          icon={TrendingUp}
          title="Claimed This Month"
          value="125K"
          subtitle="↑15% from last month"
          trend={15}
          color="purple"
        />
        <StatCard
          icon={Clock}
          title="Avg Cliff Period"
          value="12mo"
          subtitle="Standard duration"
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="group cursor-pointer" onClick={() => setActiveView('create')}>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 group-hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Plus className="text-green-600" size={20} />
                </div>
                <h4 className="font-semibold text-gray-900">Initialize Vesting</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">Set up a new token vesting program for your company</p>
              <button className="text-green-600 font-medium text-sm hover:text-green-700">
                Get Started →
              </button>
            </div>
          </div>
          
          <div className="group cursor-pointer" onClick={() => setActiveView('create')}>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 group-hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Users className="text-blue-600" size={20} />
                </div>
                <h4 className="font-semibold text-gray-900">Add Team Member</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">Create vesting schedule for a new employee</p>
              <button className="text-blue-600 font-medium text-sm hover:text-blue-700">
                Add Employee →
              </button>
            </div>
          </div>
          
          <div className="group cursor-pointer" onClick={() => setActiveView('analytics')}>
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 group-hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <TrendingUp className="text-purple-600" size={20} />
                </div>
                <h4 className="font-semibold text-gray-900">View Analytics</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">Track vesting progress and token distribution</p>
              <button className="text-purple-600 font-medium text-sm hover:text-purple-700">
                View Reports →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
          <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">View All</button>
        </div>
        <div className="space-y-4">
          {[
            { action: 'Token claim', user: 'Alice Johnson', amount: '5,000 tokens', time: '2 hours ago', type: 'claim' },
            { action: 'Employee added', user: 'David Wilson', amount: '45,000 tokens allocated', time: '1 day ago', type: 'add' },
            { action: 'Vesting started', user: 'Carol Davis', amount: 'Cliff period began', time: '3 days ago', type: 'start' }
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                activity.type === 'claim' ? 'bg-green-100' :
                activity.type === 'add' ? 'bg-blue-100' : 'bg-purple-100'
              }`}>
                {activity.type === 'claim' ? <DollarSign className="text-green-600" size={18} /> :
                 activity.type === 'add' ? <Plus className="text-blue-600" size={18} /> :
                 <Clock className="text-purple-600" size={18} />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.user} • {activity.amount}</p>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Other company views remain the same...
  const CreateEmployeeView = () => (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Add New Employee</h2>
        <p className="text-gray-600">Create a token vesting schedule for a new team member</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <form className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Employee Name</label>
              <input 
                type="text" 
                placeholder="John Doe"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Role/Position</label>
              <input 
                type="text" 
                placeholder="Senior Developer"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-colors"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vesting Configuration</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Total Vested Tokens</label>
                <input 
                  type="number" 
                  placeholder="50000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Cliff Time (seconds)</label>
                <input 
                  type="number" 
                  placeholder="31536000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">1 year = 31,536,000 seconds</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Unlock Interval (seconds)</label>
                <input 
                  type="number" 
                  placeholder="2592000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">1 month = 2,592,000 seconds</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Unlock Amount per Interval</label>
                <input 
                  type="number" 
                  placeholder="5000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <AlertTriangle className="text-blue-600" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Vesting Schedule Preview</h4>
                <p className="text-blue-800 text-sm">
                  This employee will receive 50,000 tokens with a cliff period, then periodic releases based on your configuration.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="button"
              className="flex-1 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Save as Draft
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Create Vesting Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const EmployeesView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Team Members</h2>
          <p className="text-gray-600">Manage vesting schedules for your team</p>
        </div>
        <button 
          onClick={() => setActiveView('create')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      <div className="grid gap-6">
        {employees.map(employee => (
          <div key={employee.id} 
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => setSelectedEmployee(employee)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{employee.avatar}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                  <p className="text-sm text-gray-500">{employee.role}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                employee.status === 'active' ? 'bg-green-100 text-green-700' :
                employee.status === 'cliff' ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {employee.status === 'cliff' ? 'In Cliff' : 'Active'}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Vesting Progress</span>
                <span className="font-medium">{employee.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${employee.progress}%` }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-semibold text-sm">{employee.totalVested.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Claimed</p>
                  <p className="font-semibold text-sm text-green-600">{employee.claimed.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Available</p>
                  <p className="font-semibold text-sm text-blue-600">{employee.available.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={14} />
                <span>Cliff: {employee.cliffDate}</span>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const EmployeeVestingView = () => (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Vesting Schedule</h2>
        <p className="text-gray-600">Complete breakdown of your token vesting plan</p>
      </div>

      {/* Vesting Overview */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Vesting Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Company</span>
                <span className="font-semibold">{employeeData.company}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Total Allocation</span>
                <span className="font-semibold">{employeeData.totalVested.toLocaleString()} tokens</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Vesting Start</span>
                <span className="font-semibold">{employeeData.vestingStart}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Vesting End</span>
                <span className="font-semibold">{employeeData.vestingEnd}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Release Schedule</span>
                <span className="font-semibold">{employeeData.releaseSchedule}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-600">Cliff Period</span>
                <span className="font-semibold">12 months</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Progress Visualization</h3>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      strokeDasharray={`${employeeData.progress}, 100`}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{employeeData.progress}%</span>
                  </div>
                </div>
                <p className="text-gray-600">Vesting Complete</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Claimed</span>
                  <span className="font-semibold text-green-600">{employeeData.claimed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Available</span>
                  <span className="font-semibold text-blue-600">{employeeData.available.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Remaining</span>
                  <span className="font-semibold text-purple-600">
                    {(employeeData.totalVested - employeeData.claimed - employeeData.available).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Vesting Timeline</h3>
        <div className="space-y-4">
          {[
            { date: '2023-06-01', event: 'Vesting Started', status: 'completed', type: 'start' },
            { date: '2024-06-01', event: 'Cliff Period Ended', amount: '10,000 tokens unlocked', status: 'completed', type: 'cliff' },
            { date: '2024-07-01', event: 'Monthly Release', amount: '2,500 tokens unlocked', status: 'completed', type: 'release' },
            { date: '2024-08-01', event: 'Monthly Release', amount: '2,500 tokens unlocked', status: 'completed', type: 'release' },
            { date: '2024-09-01', event: 'Monthly Release', amount: '2,500 tokens unlocked', status: 'available', type: 'release' },
            { date: '2024-10-01', event: 'Monthly Release', amount: '2,500 tokens', status: 'pending', type: 'release' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
              <div className={`w-4 h-4 rounded-full mt-1 ${
                item.status === 'completed' ? 'bg-green-500' : 
                item.status === 'available' ? 'bg-blue-500' : 'bg-gray-300'
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="font-medium text-gray-900">{item.date}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.status === 'completed' ? 'bg-green-100 text-green-700' :
                    item.status === 'available' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-gray-900 font-medium">{item.event}</p>
                {item.amount && <p className="text-sm text-gray-600">{item.amount}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const EmployeeHistoryView = () => (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Claim History</h2>
        <p className="text-gray-600">Your complete token claiming history</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="space-y-4">
          {[
            { date: '2024-08-15', amount: 5000, txHash: '5KJp...9X2m', status: 'completed' },
            { date: '2024-07-15', amount: 5000, txHash: '8Np2...4K7d', status: 'completed' },
            { date: '2024-06-15', amount: 10000, txHash: '2Qr5...8M3n', status: 'completed', note: 'Cliff release' },
          ].map((claim, i) => (
            <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Download className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{claim.amount.toLocaleString()} tokens claimed</p>
                  <p className="text-sm text-gray-600">{claim.date} {claim.note && `• ${claim.note}`}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Transaction</p>
                <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm">
                  {claim.txHash}
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <NavigationSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 capitalize">{activeView.replace(/([A-Z])/g, ' $1').trim()}</h1>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                userRole === 'company' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {userRole === 'company' ? 'Company Admin' : 'Employee'}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                <Bell size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700">
                  {isConnected ? 'Wallet Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {/* Company Views */}
          {userRole === 'company' && (
            <>
              {activeView === 'dashboard' && <CompanyDashboard />}
              {activeView === 'employees' && <EmployeesView />}
              {activeView === 'create' && <CreateEmployeeView />}
              {activeView === 'analytics' && (
                <div className="text-center py-20">
                  <TrendingUp size={64} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-600">We're building advanced analytics for your vesting program.</p>
                </div>
              )}
              {activeView === 'settings' && (
                <div className="text-center py-20">
                  <Settings size={64} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Settings Panel</h3>
                  <p className="text-gray-600">Customize your vesting platform settings and preferences.</p>
                </div>
              )}
            </>
          )}

          {/* Employee Views */}
          {userRole === 'employee' && (
            <>
              {activeView === 'dashboard' && <EmployeeDashboard />}
              {activeView === 'vesting' && <EmployeeVestingView />}
              {activeView === 'claim' && <EmployeeClaimView />}
              {activeView === 'history' && <EmployeeHistoryView />}
              {activeView === 'profile' && (
                <div className="text-center py-20">
                  <User size={64} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Profile Settings</h3>
                  <p className="text-gray-600">Manage your profile and notification preferences.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VestingPlatform;

















// import React, { useState } from 'react';
// import { 
//   Shield, Zap, TrendingUp, Users, Calendar, Clock, 
//   Wallet, Plus, ChevronRight, Star, Lock, Unlock,
//   ArrowUpRight, DollarSign, Activity, Settings,
//   Eye, EyeOff, Copy, ExternalLink, AlertTriangle
// } from 'lucide-react';

// const VestingPlatform = () => {
//   const [activeView, setActiveView] = useState('dashboard');
//   const [isConnected, setIsConnected] = useState(true);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [showPrivateKey, setShowPrivateKey] = useState(false);

//   // Mock data
//   const companyData = {
//     name: 'TechCorp',
//     totalTokens: 1000000,
//     allocatedTokens: 450000,
//     employees: 12,
//     activeVesting: 8
//   };

//   const employees = [
//     { 
//       id: 1, 
//       name: 'Alice Johnson', 
//       role: 'Senior Engineer', 
//       totalVested: 50000, 
//       claimed: 20000, 
//       available: 5000,
//       cliffDate: '2024-06-01',
//       status: 'active',
//       progress: 40,
//       avatar: '👩‍💻'
//     },
//     { 
//       id: 2, 
//       name: 'Bob Smith', 
//       role: 'Product Manager', 
//       totalVested: 75000, 
//       claimed: 45000, 
//       available: 0,
//       cliffDate: '2024-03-15',
//       status: 'active',
//       progress: 60,
//       avatar: '👨‍💼'
//     },
//     { 
//       id: 3, 
//       name: 'Carol Davis', 
//       role: 'Designer', 
//       totalVested: 30000, 
//       claimed: 0, 
//       available: 0,
//       cliffDate: '2024-12-01',
//       status: 'cliff',
//       progress: 0,
//       avatar: '👩‍🎨'
//     }
//   ];

//   const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = 'blue' }) => (
//     <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
//       <div className="flex items-center justify-between mb-4">
//         <div className={`p-3 rounded-2xl bg-${color}-50 group-hover:scale-110 transition-transform`}>
//           <Icon className={`text-${color}-600`} size={24} />
//         </div>
//         {trend && (
//           <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
//             <ArrowUpRight size={16} />
//             {Math.abs(trend)}%
//           </div>
//         )}
//       </div>
//       <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
//       <p className="text-gray-600 text-sm">{title}</p>
//       {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
//     </div>
//   );

//   const EmployeeCard = ({ employee, onClick }) => (
//     <div 
//       className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
//       onClick={() => onClick(employee)}
//     >
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <div className="text-3xl">{employee.avatar}</div>
//           <div>
//             <h3 className="font-semibold text-gray-900">{employee.name}</h3>
//             <p className="text-sm text-gray-500">{employee.role}</p>
//           </div>
//         </div>
//         <div className={`px-3 py-1 rounded-full text-xs font-medium ${
//           employee.status === 'active' ? 'bg-green-100 text-green-700' :
//           employee.status === 'cliff' ? 'bg-orange-100 text-orange-700' :
//           'bg-gray-100 text-gray-700'
//         }`}>
//           {employee.status === 'cliff' ? 'In Cliff' : 'Active'}
//         </div>
//       </div>
      
//       <div className="space-y-3">
//         <div className="flex justify-between text-sm">
//           <span className="text-gray-600">Vesting Progress</span>
//           <span className="font-medium">{employee.progress}%</span>
//         </div>
//         <div className="w-full bg-gray-200 rounded-full h-2">
//           <div 
//             className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
//             style={{ width: `${employee.progress}%` }}
//           />
//         </div>
        
//         <div className="grid grid-cols-3 gap-4 mt-4">
//           <div className="text-center">
//             <p className="text-xs text-gray-500">Total</p>
//             <p className="font-semibold text-sm">{employee.totalVested.toLocaleString()}</p>
//           </div>
//           <div className="text-center">
//             <p className="text-xs text-gray-500">Claimed</p>
//             <p className="font-semibold text-sm text-green-600">{employee.claimed.toLocaleString()}</p>
//           </div>
//           <div className="text-center">
//             <p className="text-xs text-gray-500">Available</p>
//             <p className="font-semibold text-sm text-blue-600">{employee.available.toLocaleString()}</p>
//           </div>
//         </div>
//       </div>
      
//       <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
//         <div className="flex items-center gap-2 text-sm text-gray-600">
//           <Calendar size={14} />
//           <span>Cliff: {employee.cliffDate}</span>
//         </div>
//         <ChevronRight size={16} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
//       </div>
//     </div>
//   );

//   const NavigationSidebar = () => (
//     <div className="w-80 bg-white shadow-2xl border-r border-gray-100 flex flex-col">
//       <div className="p-6 border-b border-gray-100">
//         <div className="flex items-center gap-3 mb-4">
//           <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
//             <Shield className="text-white" size={24} />
//           </div>
//           <div>
//             <h1 className="text-xl font-bold text-gray-900">VestLab</h1>
//             <p className="text-sm text-gray-500">Token Vesting Platform</p>
//           </div>
//         </div>
        
//         <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
//           <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
//             <span className="text-white text-sm font-bold">T</span>
//           </div>
//           <div className="flex-1">
//             <p className="font-medium text-sm">TechCorp</p>
//             <p className="text-xs text-gray-500">Company Admin</p>
//           </div>
//           <Settings size={16} className="text-gray-400" />
//         </div>
//       </div>
      
//       <nav className="flex-1 p-6">
//         <div className="space-y-2">
//           {[
//             { id: 'dashboard', label: 'Dashboard', icon: Activity },
//             { id: 'employees', label: 'Employees', icon: Users },
//             { id: 'create', label: 'Add Employee', icon: Plus },
//             { id: 'analytics', label: 'Analytics', icon: TrendingUp },
//             { id: 'settings', label: 'Settings', icon: Settings }
//           ].map(item => (
//             <button
//               key={item.id}
//               onClick={() => setActiveView(item.id)}
//               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
//                 activeView === item.id 
//                   ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
//                   : 'text-gray-600 hover:bg-gray-50'
//               }`}
//             >
//               <item.icon size={20} />
//               <span className="font-medium">{item.label}</span>
//             </button>
//           ))}
//         </div>
//       </nav>
      
//       <div className="p-6 border-t border-gray-100">
//         <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4 text-white">
//           <h3 className="font-semibold mb-2">Upgrade to Pro</h3>
//           <p className="text-sm text-purple-100 mb-3">Unlock advanced vesting features</p>
//           <button className="w-full bg-white/20 backdrop-blur rounded-lg py-2 text-sm font-medium hover:bg-white/30 transition-colors">
//             Learn More
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   const DashboardView = () => (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back! 👋</h2>
//           <p className="text-gray-600">Here's what's happening with your vesting program today.</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
//             <Calendar size={16} />
//             <span className="text-sm font-medium">This Month</span>
//           </button>
//           <button className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all">
//             <Plus size={16} />
//             <span className="font-medium">Add Employee</span>
//           </button>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
//         <StatCard
//           icon={DollarSign}
//           title="Total Allocated"
//           value={`${(companyData.allocatedTokens / 1000).toFixed(0)}K`}
//           subtitle="of 1M tokens"
//           trend={12}
//           color="green"
//         />
//         <StatCard
//           icon={Users}
//           title="Active Employees"
//           value={companyData.employees}
//           subtitle="8 vesting schedules"
//           trend={8}
//           color="blue"
//         />
//         <StatCard
//           icon={TrendingUp}
//           title="Claimed This Month"
//           value="125K"
//           subtitle="↑15% from last month"
//           trend={15}
//           color="purple"
//         />
//         <StatCard
//           icon={Clock}
//           title="Avg Cliff Period"
//           value="12mo"
//           subtitle="Standard duration"
//           color="orange"
//         />
//       </div>

//       {/* Quick Actions */}
//       <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
//         <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
//         <div className="grid md:grid-cols-3 gap-6">
//           <div className="group cursor-pointer">
//             <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 group-hover:shadow-lg transition-all">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="p-2 bg-green-100 rounded-xl">
//                   <Plus className="text-green-600" size={20} />
//                 </div>
//                 <h4 className="font-semibold text-gray-900">Initialize Vesting</h4>
//               </div>
//               <p className="text-sm text-gray-600 mb-4">Set up a new token vesting program for your company</p>
//               <button className="text-green-600 font-medium text-sm hover:text-green-700">
//                 Get Started →
//               </button>
//             </div>
//           </div>
          
//           <div className="group cursor-pointer">
//             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 group-hover:shadow-lg transition-all">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="p-2 bg-blue-100 rounded-xl">
//                   <Users className="text-blue-600" size={20} />
//                 </div>
//                 <h4 className="font-semibold text-gray-900">Add Team Member</h4>
//               </div>
//               <p className="text-sm text-gray-600 mb-4">Create vesting schedule for a new employee</p>
//               <button className="text-blue-600 font-medium text-sm hover:text-blue-700">
//                 Add Employee →
//               </button>
//             </div>
//           </div>
          
//           <div className="group cursor-pointer">
//             <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 group-hover:shadow-lg transition-all">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="p-2 bg-purple-100 rounded-xl">
//                   <TrendingUp className="text-purple-600" size={20} />
//                 </div>
//                 <h4 className="font-semibold text-gray-900">View Analytics</h4>
//               </div>
//               <p className="text-sm text-gray-600 mb-4">Track vesting progress and token distribution</p>
//               <button className="text-purple-600 font-medium text-sm hover:text-purple-700">
//                 View Reports →
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Recent Activity */}
//       <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
//           <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">View All</button>
//         </div>
//         <div className="space-y-4">
//           {[
//             { action: 'Token claim', user: 'Alice Johnson', amount: '5,000 tokens', time: '2 hours ago', type: 'claim' },
//             { action: 'Employee added', user: 'David Wilson', amount: '45,000 tokens allocated', time: '1 day ago', type: 'add' },
//             { action: 'Vesting started', user: 'Carol Davis', amount: 'Cliff period began', time: '3 days ago', type: 'start' }
//           ].map((activity, i) => (
//             <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
//               <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
//                 activity.type === 'claim' ? 'bg-green-100' :
//                 activity.type === 'add' ? 'bg-blue-100' : 'bg-purple-100'
//               }`}>
//                 {activity.type === 'claim' ? <DollarSign className="text-green-600" size={18} /> :
//                  activity.type === 'add' ? <Plus className="text-blue-600" size={18} /> :
//                  <Clock className="text-purple-600" size={18} />}
//               </div>
//               <div className="flex-1">
//                 <p className="font-medium text-gray-900">{activity.action}</p>
//                 <p className="text-sm text-gray-600">{activity.user} • {activity.amount}</p>
//               </div>
//               <span className="text-xs text-gray-400">{activity.time}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );

//   const EmployeesView = () => (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-900 mb-2">Team Members</h2>
//           <p className="text-gray-600">Manage vesting schedules for your team</p>
//         </div>
//         <button 
//           onClick={() => setActiveView('create')}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
//         >
//           <Plus size={18} />
//           Add Employee
//         </button>
//       </div>

//       <div className="grid gap-6">
//         {employees.map(employee => (
//           <EmployeeCard 
//             key={employee.id} 
//             employee={employee} 
//             onClick={setSelectedEmployee}
//           />
//         ))}
//       </div>
//     </div>
//   );

//   const CreateEmployeeView = () => (
//     <div className="max-w-4xl">
//       <div className="mb-8">
//         <h2 className="text-3xl font-bold text-gray-900 mb-2">Add New Employee</h2>
//         <p className="text-gray-600">Create a token vesting schedule for a new team member</p>
//       </div>

//       <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
//         <form className="space-y-8">
//           <div className="grid md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-semibold text-gray-900 mb-2">Employee Name</label>
//               <input 
//                 type="text" 
//                 placeholder="John Doe"
//                 className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-colors"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-semibold text-gray-900 mb-2">Role/Position</label>
//               <input 
//                 type="text" 
//                 placeholder="Senior Developer"
//                 className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-colors"
//               />
//             </div>
//           </div>

//           <div className="border-t border-gray-200 pt-8">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Vesting Configuration</h3>
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-900 mb-2">Total Vested Tokens</label>
//                 <input 
//                   type="number" 
//                   placeholder="50000"
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-colors"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-gray-900 mb-2">Cliff Period (months)</label>
//                 <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-colors">
//                   <option>12 months</option>
//                   <option>6 months</option>
//                   <option>18 months</option>
//                   <option>24 months</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-gray-900 mb-2">Vesting Duration</label>
//                 <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-colors">
//                   <option>4 years</option>
//                   <option>3 years</option>
//                   <option>5 years</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-gray-900 mb-2">Release Frequency</label>
//                 <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-colors">
//                   <option>Monthly</option>
//                   <option>Quarterly</option>
//                   <option>Annually</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-gray-900 mb-2">Tokens per Release</label>
//                 <input 
//                   type="number" 
//                   placeholder="1250"
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-colors"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
//             <div className="flex items-start gap-3">
//               <div className="p-2 bg-blue-100 rounded-xl">
//                 <AlertTriangle className="text-blue-600" size={20} />
//               </div>
//               <div>
//                 <h4 className="font-semibold text-blue-900 mb-2">Vesting Schedule Preview</h4>
//                 <p className="text-blue-800 text-sm">
//                   This employee will receive 50,000 tokens over 4 years, with a 12-month cliff. 
//                   After the cliff period, they'll receive 1,250 tokens monthly for the remaining 36 months.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="flex gap-4">
//             <button 
//               type="button"
//               className="flex-1 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
//             >
//               Save as Draft
//             </button>
//             <button 
//               type="submit"
//               className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
//             >
//               Create Vesting Schedule
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <NavigationSidebar />
      
//       <div className="flex-1 flex flex-col">
//         {/* Top Bar */}
//         <div className="bg-white border-b border-gray-200 px-8 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <h1 className="text-2xl font-bold text-gray-900 capitalize">{activeView}</h1>
//             </div>
            
//             <div className="flex items-center gap-4">
//               <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
//                 <Star size={20} className="text-gray-600" />
//               </button>
//               <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl">
//                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
//                 <span className="text-sm font-medium text-green-700">
//                   {isConnected ? 'Connected' : 'Disconnected'}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 p-8 overflow-auto">
//           {activeView === 'dashboard' && <DashboardView />}
//           {activeView === 'employees' && <EmployeesView />}
//           {activeView === 'create' && <CreateEmployeeView />}
//           {activeView === 'analytics' && (
//             <div className="text-center py-20">
//               <TrendingUp size={64} className="text-gray-400 mx-auto mb-4" />
//               <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics Coming Soon</h3>
//               <p className="text-gray-600">We're building advanced analytics for your vesting program.</p>
//             </div>
//           )}
//           {activeView === 'settings' && (
//             <div className="text-center py-20">
//               <Settings size={64} className="text-gray-400 mx-auto mb-4" />
//               <h3 className="text-xl font-bold text-gray-900 mb-2">Settings Panel</h3>
//               <p className="text-gray-600">Customize your vesting platform settings and preferences.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VestingPlatform;












// import React, { useState } from 'react';
// import { Calendar, Clock, Users, Wallet, Building2, Coins, TrendingUp, CheckCircle, AlertCircle, User, Plus, Download } from 'lucide-react';

// const VestingDashboard = () => {
//   const [activeTab, setActiveTab] = useState('company');
//   const [isConnected, setIsConnected] = useState(false);

//   // Mock data for demonstration
//   const [vestingData, setVestingData] = useState({
//     companyName: '',
//     totalTokens: '',
//     employees: [],
//     userRole: 'company' // or 'employee'
//   });

//   const [newEmployee, setNewEmployee] = useState({
//     name: '',
//     totalVestedTokens: '',
//     cliffTime: '',
//     unlockInterval: '',
//     unlockAmount: ''
//   });

//   const [claimData, setClaimData] = useState({
//     companyName: '',
//     employeeName: '',
//     availableToClaim: 0,
//     totalVested: 100000,
//     claimed: 30000
//   });

//   const connectWallet = () => {
//     setIsConnected(!isConnected);
//   };

//   const TabButton = ({ id, label, icon: Icon, active }) => (
//     <button
//       onClick={() => setActiveTab(id)}
//       className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
//         active 
//           ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
//           : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
//       }`}
//     >
//       <Icon size={18} />
//       {label}
//     </button>
//   );

//   const CompanyPanel = () => (
//     <div className="space-y-8">
//       {/* Initialize Vesting */}
//       <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
//         <div className="flex items-center gap-3 mb-6">
//           <div className="p-3 bg-purple-100 rounded-xl">
//             <Building2 className="text-purple-600" size={24} />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800">Initialize Vesting Program</h2>
//         </div>
        
//         <div className="grid md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
//             <input
//               type="text"
//               placeholder="Enter company name"
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//               value={vestingData.companyName}
//               onChange={(e) => setVestingData({...vestingData, companyName: e.target.value})}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Total Vesting Tokens</label>
//             <input
//               type="number"
//               placeholder="1000000"
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//               value={vestingData.totalTokens}
//               onChange={(e) => setVestingData({...vestingData, totalTokens: e.target.value})}
//             />
//           </div>
//         </div>
        
//         <button className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02]">
//           Initialize Vesting Program
//         </button>
//       </div>

//       {/* Add Employee */}
//       <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
//         <div className="flex items-center gap-3 mb-6">
//           <div className="p-3 bg-green-100 rounded-xl">
//             <Users className="text-green-600" size={24} />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800">Add Employee</h2>
//         </div>

//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name</label>
//             <input
//               type="text"
//               placeholder="John Doe"
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
//               value={newEmployee.name}
//               onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Total Vested Tokens</label>
//             <input
//               type="number"
//               placeholder="50000"
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
//               value={newEmployee.totalVestedTokens}
//               onChange={(e) => setNewEmployee({...newEmployee, totalVestedTokens: e.target.value})}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Cliff Time (seconds)</label>
//             <input
//               type="number"
//               placeholder="31536000"
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
//               value={newEmployee.cliffTime}
//               onChange={(e) => setNewEmployee({...newEmployee, cliffTime: e.target.value})}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Unlock Interval (seconds)</label>
//             <input
//               type="number"
//               placeholder="2592000"
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
//               value={newEmployee.unlockInterval}
//               onChange={(e) => setNewEmployee({...newEmployee, unlockInterval: e.target.value})}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Unlock Amount per Interval</label>
//             <input
//               type="number"
//               placeholder="5000"
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
//               value={newEmployee.unlockAmount}
//               onChange={(e) => setNewEmployee({...newEmployee, unlockAmount: e.target.value})}
//             />
//           </div>
//         </div>

//         <div className="mt-6 p-4 bg-blue-50 rounded-xl">
//           <div className="flex items-center gap-2 text-blue-700 text-sm">
//             <AlertCircle size={16} />
//             <span>Cliff time: Period before any tokens can be claimed. Unlock interval: How often tokens are released after cliff.</span>
//           </div>
//         </div>

//         <button className="mt-6 w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02]">
//           <Plus size={20} className="inline mr-2" />
//           Add Employee
//         </button>
//       </div>

//       {/* Employee List */}
//       <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
//         <h3 className="text-xl font-bold text-gray-800 mb-6">Current Employees</h3>
//         <div className="space-y-4">
//           {[1, 2, 3].map((i) => (
//             <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
//               <div className="flex items-center gap-4">
//                 <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
//                   {String.fromCharCode(64 + i)}
//                 </div>
//                 <div>
//                   <p className="font-semibold">Employee {i}</p>
//                   <p className="text-sm text-gray-500">50,000 tokens vested</p>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <p className="text-sm text-green-600 font-medium">Active</p>
//                 <p className="text-xs text-gray-400">12 months cliff</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );

//   const EmployeePanel = () => (
//     <div className="space-y-8">
//       {/* Vesting Overview */}
//       <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
//         <div className="flex items-center gap-4 mb-6">
//           <div className="p-3 bg-white/20 rounded-xl">
//             <Coins className="text-white" size={32} />
//           </div>
//           <div>
//             <h2 className="text-3xl font-bold">Your Vesting Overview</h2>
//             <p className="text-purple-100">Track your token vesting progress</p>
//           </div>
//         </div>

//         <div className="grid md:grid-cols-3 gap-6">
//           <div className="bg-white/10 backdrop-blur rounded-xl p-6">
//             <div className="flex items-center gap-2 mb-2">
//               <TrendingUp size={20} />
//               <span className="text-sm font-medium">Total Vested</span>
//             </div>
//             <p className="text-3xl font-bold">{claimData.totalVested.toLocaleString()}</p>
//             <p className="text-purple-200 text-sm">Tokens allocated</p>
//           </div>
//           <div className="bg-white/10 backdrop-blur rounded-xl p-6">
//             <div className="flex items-center gap-2 mb-2">
//               <CheckCircle size={20} />
//               <span className="text-sm font-medium">Claimed</span>
//             </div>
//             <p className="text-3xl font-bold">{claimData.claimed.toLocaleString()}</p>
//             <p className="text-purple-200 text-sm">Tokens received</p>
//           </div>
//           <div className="bg-white/10 backdrop-blur rounded-xl p-6">
//             <div className="flex items-center gap-2 mb-2">
//               <Download size={20} />
//               <span className="text-sm font-medium">Available</span>
//             </div>
//             <p className="text-3xl font-bold">{claimData.availableToClaim.toLocaleString()}</p>
//             <p className="text-purple-200 text-sm">Ready to claim</p>
//           </div>
//         </div>

//         <div className="mt-6">
//           <div className="flex justify-between text-sm mb-2">
//             <span>Vesting Progress</span>
//             <span>{Math.round((claimData.claimed / claimData.totalVested) * 100)}% complete</span>
//           </div>
//           <div className="w-full bg-white/20 rounded-full h-3">
//             <div 
//               className="bg-white rounded-full h-3 transition-all"
//               style={{ width: `${(claimData.claimed / claimData.totalVested) * 100}%` }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Claim Tokens */}
//       <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
//         <div className="flex items-center gap-3 mb-6">
//           <div className="p-3 bg-orange-100 rounded-xl">
//             <Wallet className="text-orange-600" size={24} />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800">Claim Tokens</h2>
//         </div>

//         <div className="grid md:grid-cols-2 gap-6 mb-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
//             <input
//               type="text"
//               placeholder="Enter company name"
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//               value={claimData.companyName}
//               onChange={(e) => setClaimData({...claimData, companyName: e.target.value})}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Your Employee Name</label>
//             <input
//               type="text"
//               placeholder="Enter your name as registered"
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//               value={claimData.employeeName}
//               onChange={(e) => setClaimData({...claimData, employeeName: e.target.value})}
//             />
//           </div>
//         </div>

//         <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-green-800 font-semibold text-lg">Tokens Available to Claim</p>
//               <p className="text-green-600">Based on your vesting schedule</p>
//             </div>
//             <div className="text-right">
//               <p className="text-3xl font-bold text-green-700">{claimData.availableToClaim.toLocaleString()}</p>
//               <p className="text-green-600 text-sm">Tokens ready</p>
//             </div>
//           </div>
//         </div>

//         <button 
//           className={`w-full py-4 rounded-xl font-semibold transition-all transform hover:scale-[1.02] ${
//             claimData.availableToClaim > 0 
//               ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:shadow-lg' 
//               : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//           }`}
//           disabled={claimData.availableToClaim === 0}
//         >
//           <Download size={20} className="inline mr-2" />
//           {claimData.availableToClaim > 0 ? 'Claim Available Tokens' : 'No Tokens Available Yet'}
//         </button>
//       </div>

//       {/* Vesting Timeline */}
//       <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
//         <h3 className="text-xl font-bold text-gray-800 mb-6">Vesting Timeline</h3>
//         <div className="space-y-4">
//           {[
//             { date: '2024-01-01', amount: 10000, status: 'claimed', type: 'Cliff Release' },
//             { date: '2024-04-01', amount: 5000, status: 'claimed', type: 'Quarterly Release' },
//             { date: '2024-07-01', amount: 5000, status: 'available', type: 'Quarterly Release' },
//             { date: '2024-10-01', amount: 5000, status: 'pending', type: 'Quarterly Release' },
//           ].map((event, i) => (
//             <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
//               <div className={`w-4 h-4 rounded-full ${
//                 event.status === 'claimed' ? 'bg-green-500' : 
//                 event.status === 'available' ? 'bg-orange-500' : 'bg-gray-300'
//               }`} />
//               <div className="flex-1">
//                 <div className="flex items-center gap-2">
//                   <Calendar size={16} className="text-gray-500" />
//                   <span className="font-medium">{event.date}</span>
//                   <span className="text-sm text-gray-500">• {event.type}</span>
//                 </div>
//                 <p className="text-sm text-gray-600 mt-1">{event.amount.toLocaleString()} tokens</p>
//               </div>
//               <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                 event.status === 'claimed' ? 'bg-green-100 text-green-700' :
//                 event.status === 'available' ? 'bg-orange-100 text-orange-700' :
//                 'bg-gray-100 text-gray-500'
//               }`}>
//                 {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
//       {/* Header */}
//       <div className="bg-white shadow-lg border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
//                 <Coins className="text-white" size={24} />
//               </div>
//               <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
//                 Solana Vesting
//               </h1>
//             </div>
//             <button
//               onClick={connectWallet}
//               className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all ${
//                 isConnected 
//                   ? 'bg-green-100 text-green-700 border border-green-200' 
//                   : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
//               }`}
//             >
//               <Wallet size={18} />
//               {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Tab Navigation */}
//         <div className="flex gap-4 mb-8">
//           <TabButton 
//             id="company" 
//             label="Company Dashboard" 
//             icon={Building2} 
//             active={activeTab === 'company'} 
//           />
//           <TabButton 
//             id="employee" 
//             label="Employee Portal" 
//             icon={User} 
//             active={activeTab === 'employee'} 
//           />
//         </div>

//         {/* Content */}
//         {!isConnected ? (
//           <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
//             <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
//               <Wallet className="text-purple-600" size={32} />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-800 mb-4">Connect Your Wallet</h2>
//             <p className="text-gray-600 mb-8">Connect your Solana wallet to access the token vesting platform</p>
//             <button 
//               onClick={connectWallet}
//               className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02]"
//             >
//               Connect Wallet
//             </button>
//           </div>
//         ) : (
//           <div>
//             {activeTab === 'company' && <CompanyPanel />}
//             {activeTab === 'employee' && <EmployeePanel />}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default VestingDashboard;





























// import { ConnectionProvider, useConnection, useWallet, WalletProvider } from "@solana/wallet-adapter-react"
// import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { clusterApiUrl, Keypair, LAMPORTS_PER_SOL, sendAndConfirmRawTransaction, SystemProgram, Transaction } from "@solana/web3.js";
// import { useEffect, useState } from "react"
// import "@solana/wallet-adapter-react-ui/styles.css";


// function GetBalance(){
//   let [bal,setBal]=useState(0);
//   let {connection}=useConnection();
//   let {publicKey}=useWallet();
  
//   useEffect(()=>{
//     async function getAccountDetails(){
//       if(publicKey && connection){ 
//         let accInfo=await connection.getAccountInfo(publicKey);
//         setBal(accInfo? accInfo?.lamports: 0);
//       }
//     }
//     getAccountDetails();
//     console.log("inside useeffect : ",connection,publicKey);

//   },[publicKey,connection])
  
//   return(
//     <div className="border p-4">
//       <h1 className="text-xl font-bold text-slate-300">Get Balance</h1>
//       <div className="flex gap-8 items-center">
//         <p className="text-red-300 text-xl">Bal : {bal}</p>
//         <p>Wallet Connected? {publicKey?'Yes':'No'}</p>
//       </div>
//       {/* <WalletMultiButton className="!bg-green-600 !text-yellow-500"/> */}
//     </div>
//   )
// }

// function Faucet(){
//   let {publicKey , sendTransaction}=useWallet();
//   let {connection}=useConnection();
//   let [txSig,setTxSig]=useState(null);
//   let [amountToFund,setAmountToFund]=useState(0);

//   let k=[48,182,182,234,169,224,236,113,52,199,47,66,39,2,163,52,183,44,45,27,127,49,133,151,64,70,248,16,46,218,234,198,42,180,5,68,243,235,189,56,197,37,17,85,205,189,100,191,64,74,171,3,37,193,199,195,213,54,156,198,228,15,248,188];

//   let funder=Keypair.fromSecretKey(Uint8Array.from(k));

//   async function fundMe(e){
//     e.preventDefault();
//     if(!publicKey || !connection){
//       return <p>Connect wallet first</p>
//     }
//     let tx=new Transaction().add(
//       SystemProgram.transfer({
//         fromPubkey:funder.publicKey,
//         toPubkey:publicKey,
//         lamports:amountToFund
//       })
//     );
//     tx.recentBlockhash=(await connection.getLatestBlockhash()).blockhash;
//     tx.sign(funder);
//     let txStatus=await sendTransaction(tx,connection,{signers:[funder]});
//     // let txStatus=await sendAndConfirmRawTransaction(connection,tx.serialize());
//     console.log("find tx sig : ",txStatus);
//     setTxSig(txStatus);
//   }
//   return(
//     <div>
//       <h1 className="text-green-400">Faucet</h1>
//       <form onSubmit={e=>fundMe(e)}>
//         <input type="number" placeholder="enter sol amount" step="any" 
//           className="placeholder:text-teal-200 border border-slate-200" onChange={(e)=>{
//           setAmountToFund(Number(e.target.value)*LAMPORTS_PER_SOL);
//         }}/>
//         <button type="submit" className="border px-2 py-1 text-teal-300">Fund me</button>    
//           {txSig? <p>{txSig}</p>:<></>}
//       </form>
//     </div>
//   )
// }

// function SolTransfer(){
//   let {connection}=useConnection();
//   let {publicKey, sendTransaction}=useWallet();

//   const [amount,setAmount]=useState(0);
//   const [reciever,setReciever]=useState<null|String>(null);
//   const [sig,setSig]=useState<null|String>(null);
//   const [bal,setBal]=useState(0);
  
  
//   async function sendSol(event){
//     event.preventDefault();
//     if(!publicKey || !connection){
//       return <p>Connect wallet first</p>;
//     }
//     let tx=new Transaction().add(
//       SystemProgram.transfer({
//         fromPubkey:publicKey,
//         toPubkey:reciever,
//         lamports:amount
//       })
//     );
//     tx.recentBlockhash=(await connection.getLatestBlockhash()).blockhash;
//     let txStatus=await sendTransaction(tx,connection);
//     console.log("transfer sig : ",txStatus);
//     setSig(txStatus);
//   }

//   useEffect(()=>{
//     async function getAccountBal(){
//       if(!publicKey || !connection){return}
//       let acc=await connection.getAccountInfo(publicKey);
//       setBal(acc? acc?.lamports/LAMPORTS_PER_SOL: 0);
//     }
//     getAccountBal();
//   },[connection,publicKey])
//   return(
//     <div className="w-screen flex justify-center">
//       <div className="bg-slate-700 rounded-xl w-1/2 border p-4">
//         <form onSubmit={event=>sendSol(event)} className="flex flex-col gap-1">
//         <div className="flex justify-between items-center mb-2">
//           <p className="text-2xl font-semibold text-orange-500">Send SOL</p>
//           <button type="submit" className="bg-orange-600 text-slate-100 px-6 py-1 rounded-lg text-lg font-semibold">Send</button>
//         </div>
//           <p className="text-slate-300 italic">Enter reciever pubkey</p>
//           <input type="text" className="w-full border-b-2 border-b-slate-300 mb-3 text-slate-200 outline-0"
//            placeholder="Reciever Public Key" onChange={e=>setReciever(e.target.value)}/>
//           <p className="text-slate-300 italic">Enter amount to send</p>
//           <input type="number" className="w-full border-b-[2px] border-b-slate-300 mb-4 outline-0 text-slate-200"
//             step="any" placeholder="Amount of SOL"
//             onChange={e=>setAmount(Number(e.target.value)*LAMPORTS_PER_SOL)}/>
//           <div className="border-2 border-slate-500 py-2 px-4 rounded-lg">
//             <div className="flex">
//               <p className="text-slate-300  w-1/2">Tx Signature : </p>
//               <a className="text-slate-300 underline  w-1/2 truncate" href={`https://explorer.solana.com/tx/${sig}?cluster=devnet`} target="_blank">
//                 {`https://explorer.solana.com/tx/${sig}?cluster=devnet`}
//             </a>
//             </div>
//             <div className="flex">
//               <p className="text-slate-300  w-1/2">Account Balance : </p>
//               <p className="text-slate-300  w-/2">{bal}</p>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

// function App() {
//   let endpoint=clusterApiUrl("devnet");
//   return (
//       <ConnectionProvider endpoint={endpoint}>
//         <WalletProvider wallets={[]}>
//           <WalletModalProvider>
//             <div className="bg-black w-screen h-screen">

//             <h1>App</h1>
//             <WalletMultiButton/>
//             <GetBalance/>
//             <Faucet/>
//             <SolTransfer/>
//             </div>
//         </WalletModalProvider>
//       </WalletProvider>
//     </ConnectionProvider>
//   )
// }

// export default App


