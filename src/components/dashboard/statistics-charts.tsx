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
  
  // Colors for charts - updated to match purple theme
  const COLORS = ['#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#fb7185'];
  
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
        <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-200">
          <h3 className="text-lg font-medium mb-4 text-purple-800">Tasks by Priority</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.todosByPriority}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                <Bar dataKey="count" fill="#8b5cf6" name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Status Distribution */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-200">
          <h3 className="text-lg font-medium mb-4 text-purple-800">Tasks by Status</h3>
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
      <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-200">
        <h3 className="text-lg font-medium mb-4 text-purple-800">Tasks by Tag</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.todosByTag.slice(0, 10)}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="tag" type="category" />
              <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
              <Bar dataKey="count" fill="#a855f7" name="Tasks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Completion Rate Over Time */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-purple-800">Completion Rate Over Time</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === 'week' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === 'month' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === 'year' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
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
              <CartesianGrid strokeDasharray="3 3" />
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
                stroke="#8b5cf6"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}