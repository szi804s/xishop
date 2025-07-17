import React from 'react';

// In a real application, these stats would be fetched from a dedicated API endpoint
// that aggregates data from the database.
const superAdminStats = {
  totalUsers: 1428,
  totalShops: 315,
  totalRevenue: 54321.67,
};

// A simple component to display a single statistic card.
const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
  <div className="bg-muted rounded-lg p-6 flex items-center space-x-4">
    <div className="bg-primary/10 text-primary p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default function SuperAdminDashboard() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard 
          title="Total Users" 
          value={superAdminStats.totalUsers.toLocaleString()} 
          icon={<UsersIcon />} 
        />
        <StatCard 
          title="Total Shops" 
          value={superAdminStats.totalShops.toLocaleString()} 
          icon={<StoreIcon />} 
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${superAdminStats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={<DollarSignIcon />} 
        />
      </div>
      {/* Here you would add tables for User Management and Shop Management */}
    </div>
  );
}

// SVG Icons for the cards (typically you'd use a library like lucide-react)
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const StoreIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M2 7h20"/><path d="M12 7V2"/></svg>
);
const DollarSignIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
); 