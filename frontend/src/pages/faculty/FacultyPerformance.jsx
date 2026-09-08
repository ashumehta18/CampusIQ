import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import subjectService from '../../services/subjectService';
import marksService from '../../services/marksService';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { AttendanceBar } from './FacultyStudents';

const FacultyPerformance = () => {
  const { data: subjects } = useFetch(subjectService.getMySubjects);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSummary = async (subjectId) => {
    setSelectedSubject(subjectId);
    if (!subjectId) { setSummary(null); return; }
    setLoading(true);
    try {
      const res = await marksService.getSubjectSummary(subjectId);
      setSummary(res.data.data);
    } catch {
      setSummary([]);
    } finally {
      setLoading(false);
    }
  };

  const needsAttention = summary?.filter((s) => s.needsAttention) || [];

  return (
    <div>
      <PageHeader title="Performance Overview" subtitle="Academic performance summary for your subjects" />

      <Card className="mb-6">
        <label className="block text-sm text-gray-600 mb-1">Select Subject</label>
        <select
          value={selectedSubject}
          onChange={(e) => loadSummary(e.target.value)}
          className="w-full md:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select subject</option>
          {subjects?.map((s) => (
            <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
          ))}
        </select>
      </Card>

      {!selectedSubject ? (
        <EmptyState icon="📊" title="Select a subject to view performance" />
      ) : loading ? (
        <Spinner />
      ) : !summary?.length ? (
        <EmptyState icon="📊" title="No data available" description="Create assessments and enter marks first" />
      ) : (
        <>
          {needsAttention.length > 0 && (
            <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-orange-800 mb-1">
                📉 Performance Alert — Rule-Based ({needsAttention.length} student{needsAttention.length > 1 ? 's' : ''})
              </p>
              <p className="text-xs text-orange-700">
                Students with average score below 60%. This is a rule-based alert, not an AI prediction.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {needsAttention.map((s) => (
                  <span key={s.student._id} className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                    {s.student.user?.name} — {s.averagePercentage ?? 'N/A'}%
                  </span>
                ))}
              </div>
            </div>
          )}

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                    <th className="pb-3 pr-4">Student</th>
                    <th className="pb-3 pr-4">Attempted</th>
                    <th className="pb-3 pr-4 w-48">Avg Score</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {summary.map((s) => (
                    <tr key={s.student._id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-gray-800">{s.student.user?.name}</p>
                        <p className="text-xs text-gray-400">{s.student.enrollmentNumber}</p>
                      </td>
                      <td className="py-3 pr-4 text-gray-500">
                        {s.attempted} / {s.totalAssessments}
                      </td>
                      <td className="py-3 pr-4">
                        <AttendanceBar percentage={s.averagePercentage} />
                      </td>
                      <td className="py-3">
                        {s.averagePercentage === null ? (
                          <Badge label="No Data" variant="gray" />
                        ) : s.needsAttention ? (
                          <Badge label="Needs Attention" variant="red" />
                        ) : s.averagePercentage < 75 ? (
                          <Badge label="Average" variant="yellow" />
                        ) : (
                          <Badge label="Good" variant="green" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default FacultyPerformance;
