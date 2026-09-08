import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import marksService from '../../services/marksService';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { AttendanceBar } from '../faculty/FacultyStudents';

const typeVariant = {
  Quiz: 'blue', Assignment: 'gray', Midterm: 'yellow',
  Internal: 'purple', Practical: 'green', Final: 'red',
};

const StudentMarks = () => {
  const { data: summary, loading: summaryLoading } = useFetch(marksService.getSummary);
  const { data: allMarks, loading: marksLoading } = useFetch(marksService.getMyMarks);
  const [activeTab, setActiveTab] = useState('summary');

  return (
    <div>
      <PageHeader title="My Marks" subtitle="View your assessment scores and performance" />

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {['summary', 'all marks'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition capitalize ${
              activeTab === tab ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'summary' && (
        summaryLoading ? <Spinner /> : !summary?.length ? (
          <EmptyState icon="🎯" title="No marks data yet" />
        ) : (
          <div className="space-y-4">
            {summary.map((item) => (
              <Card key={item.subject._id}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.subject.name}</h3>
                    <p className="text-xs text-gray-400">{item.subject.code}</p>
                  </div>
                  {item.alert ? (
                    <Badge
                      label={item.alert.severity === 'HIGH' ? '⚠️ Poor Performance' : '⚠️ Below Average'}
                      variant={item.alert.severity === 'HIGH' ? 'red' : 'yellow'}
                    />
                  ) : item.averagePercentage !== null ? (
                    <Badge label="Good Standing" variant="green" />
                  ) : (
                    <Badge label="No Data" variant="gray" />
                  )}
                </div>
                <AttendanceBar percentage={item.averagePercentage} />
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span>Total assessments: <strong>{item.totalAssessments}</strong></span>
                  <span>Attempted: <strong>{item.attempted}</strong></span>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {activeTab === 'all marks' && (
        marksLoading ? <Spinner /> : !allMarks?.length ? (
          <EmptyState icon="📝" title="No marks recorded yet" />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                    <th className="pb-3 pr-4">Assessment</th>
                    <th className="pb-3 pr-4">Subject</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Score</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allMarks.map((m) => {
                    const pct = Math.round((m.marksObtained / m.assessment.maxMarks) * 100);
                    return (
                      <tr key={m._id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4 font-medium text-gray-800">{m.assessment.title}</td>
                        <td className="py-3 pr-4 text-gray-500">{m.assessment.subject?.name}</td>
                        <td className="py-3 pr-4">
                          <Badge label={m.assessment.type} variant={typeVariant[m.assessment.type] || 'gray'} />
                        </td>
                        <td className="py-3 pr-4">
                          <span className="font-semibold text-gray-800">{m.marksObtained}</span>
                          <span className="text-gray-400"> / {m.assessment.maxMarks}</span>
                          <span className={`ml-2 text-xs font-medium ${pct >= 60 ? 'text-green-600' : 'text-red-500'}`}>
                            ({pct}%)
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">
                          {m.assessment.date
                            ? new Date(m.assessment.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="py-3 text-gray-400 text-xs">{m.remarks || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}
    </div>
  );
};

export default StudentMarks;
