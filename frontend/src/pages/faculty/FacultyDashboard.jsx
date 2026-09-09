import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import subjectService from '../../services/subjectService';
import attendanceService from '../../services/attendanceService';
import assignmentService from '../../services/assignmentService';
import submissionService from '../../services/submissionService';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const { data: subjects, loading: subjectsLoading } = useFetch(subjectService.getMySubjects);
  const { data: assignments } = useFetch(assignmentService.getAll);

  const [attendanceData, setAttendanceData] = useState([]);
  const [attLoading, setAttLoading] = useState(false);
  const [needsAttention, setNeedsAttention] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState(0);

  useEffect(() => {
    if (!subjects?.length) return;
    const loadData = async () => {
      setAttLoading(true);
      try {
        const summaries = await Promise.all(
          subjects.map((s) =>
            attendanceService.getSubjectSummary(s._id)
              .then((res) => ({ subject: s, data: res.data.data }))
              .catch(() => ({ subject: s, data: [] }))
          )
        );
        const chartData = summaries.map(({ subject, data }) => {
          const withData = data.filter((s) => s.percentage !== null);
          const avg = withData.length
            ? Math.round(withData.reduce((sum, s) => sum + s.percentage, 0) / withData.length)
            : 0;
          return { name: subject.code, avg, full: subject.name };
        });
        setAttendanceData(chartData);
        const attention = [];
        summaries.forEach(({ subject, data }) => {
          data.filter((s) => s.needsAttention).forEach((s) => {
            attention.push({ ...s, subjectName: subject.name });
          });
        });
        setNeedsAttention(attention.slice(0, 6));
      } finally {
        setAttLoading(false);
      }
    };
    loadData();
  }, [subjects]);

  useEffect(() => {
    if (!assignments?.length) return;
    const countPending = async () => {
      let total = 0;
      await Promise.all(
        assignments.slice(0, 10).map((a) =>
          submissionService.getByAssignment(a._id)
            .then((res) => { total += res.data.data.filter((s) => s.status === 'submitted').length; })
            .catch(() => {})
        )
      );
      setPendingSubmissions(total);
    };
    countPending();
  }, [assignments]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 tracking-tight">
          Welcome, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-stone-400 text-sm mt-1">Faculty overview for this semester</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Subjects"    value={subjects?.length ?? '—'}  icon="📚" color="green"  />
        <StatCard label="Assignments"    value={assignments?.length ?? '—'} icon="📌" color="brown"  />
        <StatCard label="Pending Grades" value={pendingSubmissions}         icon="📝" color="yellow" />
        <StatCard label="Attention Needed" value={needsAttention.length}   icon="⚠️" color="red"    />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">Avg Attendance by Subject</h3>
            <Link to="/faculty/students" className="text-xs font-medium hover:underline" style={{ color: '#a0522d' }}>
              Details
            </Link>
          </div>
          {attLoading || subjectsLoading ? <Spinner size="sm" /> : !attendanceData.length ? (
            <p className="text-sm text-stone-400">No attendance data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attendanceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe4" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#78716c' }} />
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Avg Attendance']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.full || label}
                  contentStyle={{ borderRadius: 10, border: '1px solid #ede8e1', fontSize: 12 }}
                />
                <Bar dataKey="avg" fill="#a0522d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">My Subjects</h3>
            <Link to="/faculty/subjects" className="text-xs font-medium hover:underline" style={{ color: '#a0522d' }}>
              View all
            </Link>
          </div>
          {subjectsLoading ? <Spinner size="sm" /> : !subjects?.length ? (
            <p className="text-sm text-stone-400">No subjects assigned yet</p>
          ) : (
            <div className="space-y-2">
              {subjects.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center justify-between p-2.5 rounded-xl transition"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fdf8f3')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <p className="text-sm font-medium text-stone-800">{s.name}</p>
                    <p className="text-xs text-stone-400">{s.department?.name} · Sem {s.semester}</p>
                  </div>
                  <Badge label={s.code} variant="brown" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {needsAttention.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold text-stone-700">Students Requiring Attention</h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#fdf3e7', color: '#92400e' }}>
              Rule-based · Not AI
            </span>
          </div>
          <p className="text-xs text-stone-400 mb-3">Students with attendance below 75% across your subjects.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {needsAttention.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
              >
                <div>
                  <p className="text-sm font-medium text-stone-800">{s.student?.user?.name}</p>
                  <p className="text-xs text-stone-500">{s.subjectName}</p>
                </div>
                <span className="text-sm font-bold text-red-600">{s.percentage}%</span>
              </div>
            ))}
          </div>
          <Link to="/faculty/students" className="text-xs font-medium hover:underline mt-3 block" style={{ color: '#a0522d' }}>
            View full attendance report →
          </Link>
        </Card>
      )}
    </div>
  );
};

export default FacultyDashboard;
