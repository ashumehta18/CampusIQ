import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import subjectService from '../../services/subjectService';
import enrollmentService from '../../services/enrollmentService';
import attendanceService from '../../services/attendanceService';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

const STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

const statusStyle = {
  PRESENT: 'bg-green-100 text-green-700 border-green-300',
  ABSENT: 'bg-red-100 text-red-700 border-red-300',
  LATE: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  EXCUSED: 'bg-blue-100 text-blue-700 border-blue-300',
};

const FacultyAttendance = () => {
  const { data: subjects } = useFetch(subjectService.getMySubjects);

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [enrollments, setEnrollments] = useState([]);
  const [attendance, setAttendance] = useState({}); // { studentId: { status, remarks } }
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  // Track existing records for the selected date (for showing "already marked" state)
  const [existingRecords, setExistingRecords] = useState([]);

  // When subject changes, load enrolled students
  useEffect(() => {
    if (!selectedSubject) { setEnrollments([]); return; }
    const load = async () => {
      setLoadingStudents(true);
      try {
        const res = await enrollmentService.getStudentsBySubject(selectedSubject);
        setEnrollments(res.data.data);
        // Default all to PRESENT
        const defaults = {};
        res.data.data.forEach((en) => {
          defaults[en.student._id] = { status: 'PRESENT', remarks: '' };
        });
        setAttendance(defaults);
      } catch {
        toast.error('Failed to load students');
      } finally {
        setLoadingStudents(false);
      }
    };
    load();
  }, [selectedSubject]);

  // When subject + date changes, load existing records to pre-fill
  useEffect(() => {
    if (!selectedSubject || !selectedDate) return;
    const load = async () => {
      try {
        const res = await attendanceService.getAttendance({
          subjectId: selectedSubject,
          date: selectedDate,
        });
        const records = res.data.data;
        setExistingRecords(records);
        if (records.length > 0) {
          const filled = {};
          records.forEach((r) => {
            filled[r.student._id] = { status: r.status, remarks: r.remarks || '' };
          });
          setAttendance((prev) => ({ ...prev, ...filled }));
        }
      } catch {
        // No existing records is fine — silently ignore
      }
    };
    load();
  }, [selectedSubject, selectedDate]);

  const setStatus = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  };

  const setRemarks = (studentId, remarks) => {
    setAttendance((prev) => ({ ...prev, [studentId]: { ...prev[studentId], remarks } }));
  };

  const markAll = (status) => {
    const updated = {};
    enrollments.forEach((en) => {
      updated[en.student._id] = { status, remarks: attendance[en.student._id]?.remarks || '' };
    });
    setAttendance(updated);
  };

  const handleSubmit = async () => {
    if (!selectedSubject || !selectedDate) {
      return toast.error('Select a subject and date first');
    }
    if (enrollments.length === 0) {
      return toast.error('No students enrolled in this subject');
    }

    const records = enrollments.map((en) => ({
      studentId: en.student._id,
      status: attendance[en.student._id]?.status || 'ABSENT',
      remarks: attendance[en.student._id]?.remarks || '',
    }));

    setSaving(true);
    try {
      await attendanceService.markBulk({
        subjectId: selectedSubject,
        date: selectedDate,
        records,
      });
      toast.success('Attendance saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter((a) => a.status === 'PRESENT').length;
  const lateCount = Object.values(attendance).filter((a) => a.status === 'LATE').length;
  const absentCount = Object.values(attendance).filter((a) => a.status === 'ABSENT').length;

  return (
    <div>
      <PageHeader title="Mark Attendance" subtitle="Select a subject and date to mark attendance" />

      {/* Controls */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select subject</option>
              {subjects?.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </Card>

      {/* Student list */}
      {!selectedSubject ? (
        <EmptyState icon="📋" title="Select a subject to begin" />
      ) : loadingStudents ? (
        <Spinner />
      ) : enrollments.length === 0 ? (
        <EmptyState icon="👥" title="No students enrolled in this subject" />
      ) : (
        <Card>
          {/* Summary bar */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex gap-4 text-sm">
              <span className="text-green-600 font-medium">Present: {presentCount}</span>
              <span className="text-yellow-600 font-medium">Late: {lateCount}</span>
              <span className="text-red-600 font-medium">Absent: {absentCount}</span>
              <span className="text-gray-400">Total: {enrollments.length}</span>
            </div>
            <div className="flex gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => markAll(s)}
                  className="text-xs px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-600"
                >
                  All {s}
                </button>
              ))}
            </div>
          </div>

          {existingRecords.length > 0 && (
            <div className="mb-4 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              Attendance already marked for this date — you are editing existing records.
            </div>
          )}

          {/* Student rows */}
          <div className="space-y-3">
            {enrollments.map((en, idx) => {
              const student = en.student;
              const current = attendance[student._id] || { status: 'PRESENT', remarks: '' };
              return (
                <div key={student._id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                  <span className="text-gray-400 text-sm w-6">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{student.user?.name}</p>
                    <p className="text-xs text-gray-400">{student.enrollmentNumber}</p>
                  </div>
                  {/* Status buttons */}
                  <div className="flex gap-1">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(student._id, s)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition font-medium ${
                          current.status === s
                            ? statusStyle[s]
                            : 'border-gray-200 text-gray-400 hover:border-gray-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {/* Remarks */}
                  <input
                    type="text"
                    placeholder="Remarks"
                    value={current.remarks}
                    onChange={(e) => setRemarks(student._id, e.target.value)}
                    className="w-28 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-400"
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition"
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FacultyAttendance;
