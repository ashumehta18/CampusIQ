import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import attendanceService from '../../services/attendanceService';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { AttendanceBar } from '../faculty/FacultyStudents';

const statusVariant = {
  PRESENT: 'green',
  ABSENT: 'red',
  LATE: 'yellow',
  EXCUSED: 'blue',
};

const StudentAttendance = () => {
  const { data: summary, loading: summaryLoading } = useFetch(attendanceService.getSummary);
  const { data: records, loading: recordsLoading } = useFetch(attendanceService.getMyAttendance);
  const [activeTab, setActiveTab] = useState('summary');

  return (
    <div>
      <PageHeader title="My Attendance" subtitle="Track your attendance across all subjects" />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {['summary', 'history'].map((tab) => (
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
          <EmptyState icon="📋" title="No attendance data yet" />
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
                      label={item.alert.severity === 'HIGH' ? '⚠️ Critical' : '⚠️ Low Attendance'}
                      variant="red"
                    />
                  ) : item.percentage !== null ? (
                    <Badge label="On Track" variant="green" />
                  ) : (
                    <Badge label="No Data" variant="gray" />
                  )}
                </div>
                <AttendanceBar percentage={item.percentage} />
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span>Classes held: <strong>{item.total}</strong></span>
                  <span>Attended: <strong>{item.attended}</strong></span>
                  <span>Absent: <strong>{item.total - item.attended}</strong></span>
                </div>
                {item.alert && (
                  <p className="mt-2 text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                    {item.alert.message || 'Attendance below 75% threshold'}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )
      )}

      {activeTab === 'history' && (
        recordsLoading ? <Spinner /> : !records?.length ? (
          <EmptyState icon="📅" title="No attendance records found" />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Subject</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {records.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4 text-gray-600">
                        {new Date(r.date).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 pr-4 font-medium text-gray-800">{r.subject?.name}</td>
                      <td className="py-3 pr-4">
                        <Badge label={r.status} variant={statusVariant[r.status]} />
                      </td>
                      <td className="py-3 text-gray-400 text-xs">{r.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}
    </div>
  );
};

export default StudentAttendance;
