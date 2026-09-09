import { Link } from 'react-router-dom';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import useFetch from '../../hooks/useFetch';
import attendanceService from '../../services/attendanceService';
import marksService from '../../services/marksService';
import assignmentService from '../../services/assignmentService';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { getDeadlineInfo, urgencyStyle } from '../../utils/deadlineUtils';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { data: attendanceSummary, loading: attLoading } = useFetch(attendanceService.getSummary);
  const { data: marksSummary, loading: marksLoading } = useFetch(marksService.getSummary);
  const { data: assignments, loading: assignLoading } = useFetch(assignmentService.getAll);

  const overallAttendance = (() => {
    if (!attendanceSummary?.length) return null;
    const withData = attendanceSummary.filter((s) => s.percentage !== null);
    if (!withData.length) return null;
    return Math.round(withData.reduce((sum, s) => sum + s.percentage, 0) / withData.length);
  })();

  const overallMarks = (() => {
    if (!marksSummary?.length) return null;
    const withData = marksSummary.filter((s) => s.averagePercentage !== null);
    if (!withData.length) return null;
    return Math.round(withData.reduce((sum, s) => sum + s.averagePercentage, 0) / withData.length);
  })();

  const upcoming = assignments
    ?.filter((a) => new Date(a.deadline) > new Date())
    .slice(0, 4) || [];

  const attendanceAlerts = attendanceSummary?.filter((s) => s.alert) || [];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-stone-800 tracking-tight">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-stone-400 text-sm mt-1">Here's your academic overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Attendance"
          value={overallAttendance !== null ? `${overallAttendance}%` : '—'}
          icon="📋"
          color={overallAttendance !== null && overallAttendance < 75 ? 'red' : 'brown'}
        />
        <StatCard
          label="Avg Score"
          value={overallMarks !== null ? `${overallMarks}%` : '—'}
          icon="🎯"
          color={overallMarks !== null && overallMarks < 60 ? 'red' : 'green'}
        />
        <StatCard
          label="Subjects"
          value={attendanceSummary?.length ?? '—'}
          icon="📚"
          color="purple"
        />
        <StatCard
          label="Notifications"
          value={unreadCount}
          icon="🔔"
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance per subject */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">Attendance by Subject</h3>
            <Link to="/student/attendance" className="text-xs font-medium hover:underline" style={{ color: '#a0522d' }}>
              View all
            </Link>
          </div>
          {attLoading ? <Spinner size="sm" /> : !attendanceSummary?.length ? (
            <p className="text-sm text-stone-400">No attendance data yet</p>
          ) : (
            <div className="space-y-3">
              {attendanceSummary.map((item) => (
                <div key={item.subject._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-700 truncate pr-2">{item.subject.name}</span>
                    <span className={`font-medium shrink-0 ${
                      item.percentage === null ? 'text-stone-400'
                      : item.percentage < 75 ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      {item.percentage !== null ? `${item.percentage}%` : 'No data'}
                    </span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ background: '#f0ebe4' }}>
                    <div
                      className={`h-1.5 rounded-full ${
                        item.percentage === null ? 'w-0'
                        : item.percentage < 75 ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${item.percentage ?? 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Marks per subject */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">Performance by Subject</h3>
            <Link to="/student/marks" className="text-xs font-medium hover:underline" style={{ color: '#a0522d' }}>
              View all
            </Link>
          </div>
          {marksLoading ? <Spinner size="sm" /> : !marksSummary?.length ? (
            <p className="text-sm text-stone-400">No marks data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="20%"
                outerRadius="90%"
                data={marksSummary
                  .filter((s) => s.averagePercentage !== null)
                  .map((s, i) => ({
                    name: s.subject.name,
                    value: s.averagePercentage,
                    fill: ['#a0522d', '#10b981', '#c4854a', '#8b5cf6', '#ef4444'][i % 5],
                  }))}
              >
                <RadialBar dataKey="value" background />
                <Tooltip formatter={(v) => `${v}%`} />
              </RadialBarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming assignments */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">Upcoming Assignments</h3>
            <Link to="/student/assignments" className="text-xs font-medium hover:underline" style={{ color: '#a0522d' }}>
              View all
            </Link>
          </div>
          {assignLoading ? <Spinner size="sm" /> : upcoming.length === 0 ? (
            <p className="text-sm text-stone-400">No upcoming assignments</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((a) => {
                const dl = getDeadlineInfo(a.deadline);
                return (
                  <div key={a._id} className="flex items-center justify-between">
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-medium text-stone-800 truncate">{a.title}</p>
                      <p className="text-xs text-stone-400">{a.subject?.name}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${urgencyStyle[dl.urgency]}`}>
                      {dl.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Academic alerts */}
        <Card>
          <h3 className="font-semibold text-stone-700 mb-4">Academic Alerts</h3>
          {attLoading || marksLoading ? <Spinner size="sm" /> : (
            <>
              {attendanceAlerts.length === 0 && marksSummary?.every((s) => !s.alert) ? (
                <div className="flex items-center gap-2 text-emerald-600">
                  <span className="text-2xl">✅</span>
                  <p className="text-sm font-medium">All good! No academic alerts.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {attendanceAlerts.map((item) => (
                    <div key={item.subject._id} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                      <span className="text-red-500 text-sm">⚠️</span>
                      <div>
                        <p className="text-xs font-medium text-red-700">{item.subject.name}</p>
                        <p className="text-xs text-red-600">Attendance: {item.percentage}% (below 75%)</p>
                      </div>
                      <Badge label="Attendance" variant="red" />
                    </div>
                  ))}
                  {marksSummary?.filter((s) => s.alert).map((item) => (
                    <div key={item.subject._id} className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg">
                      <span className="text-orange-500 text-sm">📉</span>
                      <div>
                        <p className="text-xs font-medium text-orange-700">{item.subject.name}</p>
                        <p className="text-xs text-orange-600">Avg score: {item.averagePercentage}%</p>
                      </div>
                      <Badge label="Performance" variant="yellow" />
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-stone-400 mt-3">* Rule-based alerts — not AI predictions</p>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
