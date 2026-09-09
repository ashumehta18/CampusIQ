import useFetch from '../../hooks/useFetch';
import adminService from '../../services/adminService';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const AdminAnalytics = () => {
  const { data: analytics, loading, error } = useFetch(adminService.getAnalytics);

  return (
    <div>
      <PageHeader title="System Analytics" subtitle="Platform-wide academic statistics" />

      {loading ? <Spinner /> : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Students" value={analytics?.totalStudents} icon="🎓" color="blue" />
            <StatCard label="Faculty" value={analytics?.totalFaculty} icon="👨🏫" color="green" />
            <StatCard label="Subjects" value={analytics?.totalSubjects} icon="📚" color="purple" />
            <StatCard label="Enrollments" value={analytics?.totalEnrollments} icon="📋" color="yellow" />
          </div>

          <Card>
            <h3 className="font-semibold text-gray-700 mb-4">Students per Department</h3>
            {!analytics?.studentsByDept?.length ? (
              <p className="text-sm text-gray-400">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={analytics.studentsByDept.map((d) => ({
                    name: d.code || d.name?.slice(0, 8) || 'N/A',
                    students: d.count,
                    full: d.name,
                  }))}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v) => [v, 'Students']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.full || label}
                  />
                  <Bar dataKey="students" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-700 mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {[
                { label: 'Total Users', value: (analytics?.totalStudents || 0) + (analytics?.totalFaculty || 0) + (analytics?.totalAdmins || 0) },
                { label: 'Departments', value: analytics?.totalDepartments },
                { label: 'Attendance Records', value: analytics?.totalAttendanceRecords },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{value ?? '—'}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
