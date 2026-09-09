import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import useFetch from '../../hooks/useFetch';
import adminService from '../../services/adminService';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';

const COLORS = ['#a0522d', '#10b981', '#c4854a', '#8b5cf6', '#ef4444', '#06b6d4'];

const AdminDashboard = () => {
  const { data: analytics, loading } = useFetch(adminService.getAnalytics);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Admin Dashboard</h2>
          <p className="text-stone-400 text-sm mt-1">System overview</p>
        </div>
        <Spinner />
      </div>
    );
  }

  const deptChartData = analytics?.studentsByDept?.map((d) => ({
    name: d.code || d.name?.slice(0, 6) || 'N/A',
    students: d.count,
    full: d.name,
  })) || [];

  const pieData = [
    { name: 'Students', value: analytics?.totalStudents || 0 },
    { name: 'Faculty',  value: analytics?.totalFaculty  || 0 },
    { name: 'Admins',   value: analytics?.totalAdmins   || 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Admin Dashboard</h2>
        <p className="text-stone-400 text-sm mt-1">System-wide overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students"  value={analytics?.totalStudents  ?? '—'} icon="🎓" color="brown"  />
        <StatCard label="Total Faculty"   value={analytics?.totalFaculty   ?? '—'} icon="👨‍🏫" color="green"  />
        <StatCard label="Departments"     value={analytics?.totalDepartments ?? '—'} icon="🏛️" color="purple" />
        <StatCard label="Subjects"        value={analytics?.totalSubjects  ?? '—'} icon="📚" color="yellow" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Enrollments"        value={analytics?.totalEnrollments        ?? '—'} icon="📋" color="brown"  />
        <StatCard label="Attendance Records" value={analytics?.totalAttendanceRecords  ?? '—'} icon="✅" color="green"  />
        <StatCard label="Admins"             value={analytics?.totalAdmins             ?? '—'} icon="🔑" color="purple" />
        {/* Quick links card */}
        <div
          className="bg-white rounded-2xl p-5 flex items-center gap-4"
          style={{ border: '1px solid #ede8e1', boxShadow: '0 1px 8px rgba(160,82,45,0.06)' }}
        >
          <div
            className="text-xl p-3 rounded-xl shrink-0"
            style={{ background: '#fdf3e7', color: '#a0522d', border: '1px solid #e8c9a0' }}
          >
            🔗
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">Quick Links</p>
            <div className="flex flex-col gap-0.5 mt-1">
              <Link to="/admin/users"       className="text-xs font-medium hover:underline" style={{ color: '#a0522d' }}>Users</Link>
              <Link to="/admin/enrollments" className="text-xs font-medium hover:underline" style={{ color: '#a0522d' }}>Enrollments</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-stone-700 mb-4">Students by Department</h3>
          {!deptChartData.length ? (
            <p className="text-sm text-stone-400">No department data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe4" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#78716c' }} />
                <Tooltip
                  formatter={(v) => [v, 'Students']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.full || label}
                  contentStyle={{ borderRadius: 10, border: '1px solid #ede8e1', fontSize: 12 }}
                />
                <Bar dataKey="students" fill="#a0522d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-stone-700 mb-4">User Distribution</h3>
          {!analytics ? (
            <p className="text-sm text-stone-400">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, name) => [v, name]}
                  contentStyle={{ borderRadius: 10, border: '1px solid #ede8e1', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {deptChartData.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">Department Breakdown</h3>
            <Link to="/admin/departments" className="text-xs font-medium hover:underline" style={{ color: '#a0522d' }}>
              Manage
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide border-b" style={{ color: '#a8a29e', borderColor: '#f0ebe4' }}>
                  <th className="pb-3 pr-4 font-semibold">Department</th>
                  <th className="pb-3 pr-4 font-semibold">Code</th>
                  <th className="pb-3 font-semibold">Students</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.studentsByDept?.map((d, i) => (
                  <tr key={i} className="border-b transition hover:bg-amber-50/40" style={{ borderColor: '#f5f0eb' }}>
                    <td className="py-3 pr-4 font-medium text-stone-800">{d.name || '—'}</td>
                    <td className="py-3 pr-4 text-stone-500">{d.code || '—'}</td>
                    <td className="py-3 font-semibold" style={{ color: '#a0522d' }}>{d.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
