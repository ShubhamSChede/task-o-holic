// src/components/dashboard/statistics-charts.tsx
"use client";

import { useState } from 'react';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';

type StatisticsData = {
  todosByPriority: {
    priority: string;
    count: number;
  }[];
  todosByStatus: {
    status: string;
    count: number;
  }[];
  todosByTag: {
    tag: string;
    count: number;
  }[];
  completionRateOverTime: {
    date: string;
    rate: number;
  }[];
};

type StatisticsChartsProps = {
  data: StatisticsData;
};

export default function StatisticsCharts({ data }: StatisticsChartsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  
  // Colors for charts – updated to match cyan/emerald theme
  const COLORS = ['#22d3ee', '#34d399', '#fbbf24', '#38bdf8', '#a855f7'];
  
  // Filter completion rate data based on time range
  const getFilteredCompletionData = () => {
    const now = new Date();
    const dates = data.completionRateOverTime.filter(item => {
      const itemDate = new Date(item.date);
      if (timeRange === 'week') {
        // Last 7 days
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return itemDate >= weekAgo;
      } else if (timeRange === 'month') {
        // Last 30 days
        const monthAgo = new Date(now);
        monthAgo.setDate(now.getDate() - 30);
        return itemDate >= monthAgo;
      } else {
        // Last 365 days
        const yearAgo = new Date(now);
        yearAgo.setDate(now.getDate() - 365);
        return itemDate >= yearAgo;
      }
    });
    
    return dates;
  };
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.9)]">
          <h3 className="mb-4 text-lg font-medium text-slate-50">Tasks by priority</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.todosByPriority}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="priority" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                <Bar dataKey="count" fill="#22d3ee" name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Status Distribution */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.9)]">
          <h3 className="mb-4 text-lg font-medium text-slate-50">Tasks by status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.todosByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8b5cf6"
                  dataKey="count"
                  nameKey="status"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.todosByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Tags Distribution */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.9)]">
        <h3 className="mb-4 text-lg font-medium text-slate-50">Tasks by tag</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.todosByTag.slice(0, 10)}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis dataKey="tag" type="category" stroke="#64748b" />
              <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
              <Bar dataKey="count" fill="#34d399" name="Tasks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Completion Rate Over Time */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.9)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-slate-50">Completion rate over time</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === 'week' 
                  ? 'bg-cyan-400 text-slate-950' 
                  : 'bg-slate-900 text-slate-300'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === 'month' 
                  ? 'bg-cyan-400 text-slate-950' 
                  : 'bg-slate-900 text-slate-300'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === 'year' 
                  ? 'bg-cyan-400 text-slate-950' 
                  : 'bg-slate-900 text-slate-300'
              }`}
            >
              Year
            </button>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={getFilteredCompletionData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                domain={[0, 100]} 
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Completion Rate']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="rate"
                name="Completion Rate"
                stroke="#22d3ee"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}