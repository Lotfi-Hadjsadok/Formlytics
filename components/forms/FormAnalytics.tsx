"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Legend,
  ComposedChart
} from "recharts"
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Target, Users, Clock } from "lucide-react"

interface FormAnalyticsProps {
  dailyResponses: Array<{
    date: string
    responses: number
    displayDate: string
  }>
  fieldAnalytics: Array<{
    fieldId: string
    fieldLabel: string
    fieldType: string
    totalResponses: number
    completionRate: number
    optionCounts?: Record<string, number>
    ratingCounts?: Record<string, number>
    averageRating?: number
  }>
}

const COLORS = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Teal
  '#45B7D1', // Sky Blue
  '#96CEB4', // Mint Green
  '#FFEAA7', // Soft Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Seafoam
  '#F7DC6F', // Golden Yellow
  '#BB8FCE', // Light Purple
  '#85C1E9', // Light Blue
  '#F8C471', // Peach
  '#82E0AA', // Light Green
  '#F1948A', // Salmon
  '#85C1E9', // Powder Blue
  '#D7BDE2'  // Lavender
]

const GRADIENT_COLORS = {
  primary: ['#3B82F6', '#1D4ED8'],
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  danger: ['#EF4444', '#DC2626'],
  purple: ['#8B5CF6', '#7C3AED'],
  cyan: ['#06B6D4', '#0891B2']
}

export function FormAnalytics({ dailyResponses, fieldAnalytics }: FormAnalyticsProps) {
  // Prepare data for response trend chart
  const responseTrendData = dailyResponses.map(day => ({
    ...day,
    name: day.displayDate
  }))

  // Prepare data for field value analytics
  const fieldsWithValueData = fieldAnalytics.filter(field => 
    field.optionCounts && Object.keys(field.optionCounts).length > 0
  )

  // Check if we have data to display
  const hasResponseData = responseTrendData.length > 0
  const hasFieldValueData = fieldsWithValueData.length > 0

  return (
    <div className="space-y-6">
      {/* Response Trends */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div>Response Trends</div>
              <p className="text-sm font-normal text-gray-600 mt-1">Last 30 days activity</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasResponseData ? (
            <div className="h-[350px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={250}>
                <AreaChart data={responseTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GRADIENT_COLORS.primary[0]} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={GRADIENT_COLORS.primary[1]} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    interval="preserveStartEnd"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6B7280' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelFormatter={(label) => `📅 ${label}`}
                    formatter={(value: any) => [
                      <span className="font-semibold text-blue-600">{value}</span>, 
                      'Responses'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="responses"
                    stroke={GRADIENT_COLORS.primary[0]}
                    strokeWidth={3}
                    fill="url(#colorResponses)"
                    dot={{ fill: GRADIENT_COLORS.primary[0], strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: GRADIENT_COLORS.primary[0], strokeWidth: 2, fill: 'white' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[350px] w-full flex flex-col items-center justify-center text-gray-500">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <TrendingUp className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium">No response data available</p>
              <p className="text-sm">Start collecting responses to see trends</p>
            </div>
          )}
        </CardContent>
      </Card>




      {/* Field-Specific Value Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {fieldAnalytics.filter(field => 
          ['select', 'radio', 'checkbox', 'rating'].includes(field.fieldType) && 
          ((field.optionCounts && Object.keys(field.optionCounts).length > 0) || field.ratingCounts)
        ).map((field, index) => (
          <Card key={field.fieldId} className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Target className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="truncate">{field.fieldLabel}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {field.fieldType}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {field.completionRate.toFixed(1)}% completion
                    </Badge>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {field.fieldType === 'rating' && field.ratingCounts && (
                <div className="space-y-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {field.averageRating?.toFixed(1)}/5
                    </div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <div className="flex justify-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <span 
                          key={i} 
                          className={`text-lg ${i < Math.floor(field.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 text-sm">Rating Distribution</h4>
                    {Object.entries(field.ratingCounts)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([rating, count]) => (
                        <div key={rating} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-12">
                            <span className="text-sm font-medium">{rating}</span>
                            <span className="text-yellow-400">★</span>
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
                              style={{ 
                                width: `${(count / field.totalResponses) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-700 w-8 text-right">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {(field.fieldType === 'select' || field.fieldType === 'radio' || field.fieldType === 'checkbox') && field.optionCounts && (
                <div className="space-y-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-600">
                      {Object.keys(field.optionCounts).length} Options
                    </div>
                    <p className="text-xs text-gray-600">Total available choices</p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 text-sm">Option Selection</h4>
                    {Object.entries(field.optionCounts)
                      .sort(([, a], [, b]) => b - a)
                      .map(([option, count], optionIndex) => (
                        <div key={option} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-gray-700 truncate block">
                              {option}
                            </span>
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div 
                              className="h-3 rounded-full transition-all duration-500" 
                              style={{ 
                                width: `${(count / field.totalResponses) * 100}%`,
                                backgroundColor: COLORS[optionIndex % COLORS.length]
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-2 w-16 justify-end">
                            <span className="text-sm font-semibold text-gray-700">{count}</span>
                            <span className="text-xs text-gray-500">
                              ({((count / field.totalResponses) * 100).toFixed(0)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  {/* Option Distribution Pie Chart */}
                  {Object.keys(field.optionCounts).length > 1 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-700 text-sm mb-3">Visual Distribution</h4>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(field.optionCounts).map(([option, count]) => ({
                                name: option.length > 15 ? option.substring(0, 15) + '...' : option,
                                value: count,
                                fullName: option
                              }))}
                              cx="50%"
                              cy="50%"
                              outerRadius={60}
                              innerRadius={20}
                              dataKey="value"
                              stroke="white"
                              strokeWidth={2}
                            >
                              {Object.entries(field.optionCounts).map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                              formatter={(value: any, name, props) => [
                                <span className="font-semibold text-green-600">{value}</span>, 
                                props?.payload?.fullName || name
                              ]}
                              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
