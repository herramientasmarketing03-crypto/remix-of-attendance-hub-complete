import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { DEPARTMENTS, Department, DepartmentStats } from '@/types/attendance';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

interface AttendanceChartsProps {
  departmentStats: DepartmentStats[];
  employees: { id: string; department: string; status: string }[];
  attendanceRecords: { 
    date: string; 
    employee_id: string; 
    days_attended: number; 
    tardy_count: number;
    absences: number;
  }[];
}

export function AttendanceCharts({ departmentStats, employees, attendanceRecords }: AttendanceChartsProps) {
  // Prepare bar chart data from real department stats
  const attendanceData = useMemo(() => {
    return departmentStats.map(stat => ({
      name: DEPARTMENTS[stat.department]?.name || stat.department,
      asistencia: stat.attendanceRate,
      color: DEPARTMENTS[stat.department]?.color || 'hsl(var(--primary))',
    }));
  }, [departmentStats]);

  // Prepare pie chart data - employee distribution by department
  const pieData = useMemo(() => {
    const deptCounts: Record<string, number> = {};
    employees.forEach(emp => {
      if (emp.status === 'active') {
        deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
      }
    });
    
    return Object.entries(deptCounts).map(([dept, count]) => ({
      name: DEPARTMENTS[dept as Department]?.name || dept,
      value: count,
      color: DEPARTMENTS[dept as Department]?.color || 'hsl(var(--primary))',
    }));
  }, [employees]);

  // Calculate weekly trend from attendance records (last 5 business days)
  const weeklyData = useMemo(() => {
    const today = new Date();
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const last5Days: { day: string; date: string }[] = [];
    
    // Get last 5 weekdays
    let daysCollected = 0;
    let daysBack = 0;
    while (daysCollected < 5 && daysBack < 14) {
      const d = new Date(today);
      d.setDate(d.getDate() - daysBack);
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
        last5Days.unshift({
          day: days[dayOfWeek],
          date: d.toISOString().split('T')[0],
        });
        daysCollected++;
      }
      daysBack++;
    }

    const totalEmployees = employees.filter(e => e.status === 'active').length;

    return last5Days.map(({ day, date }) => {
      const dayRecords = attendanceRecords.filter(r => r.date === date);
      const present = dayRecords.filter(r => r.days_attended > 0).length;
      const tardies = dayRecords.reduce((acc, r) => acc + r.tardy_count, 0);
      
      return {
        day,
        asistencia: totalEmployees > 0 ? Math.round((present / totalEmployees) * 100) : 0,
        tardanzas: tardies,
      };
    });
  }, [attendanceRecords, employees]);

  const hasData = departmentStats.length > 0 || pieData.length > 0;

  if (!hasData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
            No hay datos de asistencia disponibles
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-5 h-5 text-primary" />
            Asistencia por Departamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Asistencia']}
                />
                <Bar 
                  dataKey="asistencia" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Sin datos de asistencia
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Distribución de Empleados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${value}`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-muted-foreground">{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Sin empleados registrados
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Trend */}
      <Card className="glass-card lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-primary" />
            Tendencia Semanal (Últimos 5 días hábiles)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="asistencia" 
                  name="% Asistencia"
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tardanzas" 
                  name="Tardanzas"
                  stroke="hsl(var(--warning))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--warning))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              Sin datos de tendencia semanal
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
