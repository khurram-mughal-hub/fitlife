import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const ProgressChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-500 border border-slate-700 border-dashed rounded-lg bg-slate-800/50">
                No progress data available yet.
            </div>
        );
    }

    // Format Date for X Axis
    const formattedData = data.map(item => ({
        ...item,
        dateStr: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    }));

    return (
        <div className="h-64 w-full bg-slate-800/80 p-4 rounded-xl border border-white/10">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={formattedData}
                    margin={{
                        top: 5,
                        right: 10,
                        left: 0,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                        dataKey="dateStr"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                        tickLine={{ stroke: '#4B5563' }}
                    />
                    <YAxis
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                        tickLine={{ stroke: '#4B5563' }}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                        itemStyle={{ color: '#F3F4F6' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#F59E0B" // Accent color (yellow/amber)
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                        name="Weight (kg)"
                    />
                    <Line
                        type="monotone"
                        dataKey="bmi"
                        stroke="#10B981" // Green
                        strokeWidth={2}
                        name="BMI"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ProgressChart;
