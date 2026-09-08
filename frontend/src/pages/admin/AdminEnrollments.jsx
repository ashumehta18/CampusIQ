import { useState } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import enrollmentService from '../../services/enrollmentService';
import studentService from '../../services/studentService';
import subjectService from '../../services/subjectService';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

const emptyForm = { studentId: '', subjectId: '', academicYear: '' };

const AdminEnrollments = () => {
  const { data: enrollments, loading, error, refetch } = useFetch(enrollmentService.getAll);
  const { data: students } = useFetch(studentService.getAllStudents);
  const { data: subjects } = useFetch(subjectService.getAll);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const field = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await enrollmentService.create(form);
      toast.success('Student enrolled');
      setShowModal(false);
      setForm(emptyForm);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id, studentName) => {
    if (!window.confirm(`Remove enrollment for ${studentName}?`)) return;
    try {
      await enrollmentService.deactivate(id);
      toast.success('Enrollment removed');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      <PageHeader
        title="Enrollments"
        subtitle="Manage student subject enrollments"
        action={
          <button onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700">
            + Enroll Student
          </button>
        }
      />

      {loading ? <Spinner /> : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : !enrollments?.length ? (
        <EmptyState icon="📋" title="No enrollments yet" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                  {['Student', 'Subject', 'Semester', 'Academic Year', 'Status', ''].map((h) => (
                    <th key={h} className="pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {enrollments.map((en) => (
                  <tr key={en._id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-800">{en.student?.user?.name}</td>
                    <td className="py-3 pr-4 text-gray-600">{en.subject?.name}</td>
                    <td className="py-3 pr-4 text-gray-500">{en.subject?.semester}</td>
                    <td className="py-3 pr-4 text-gray-500">{en.academicYear}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${en.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {en.isActive ? 'Active' : 'Removed'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {en.isActive && (
                        <button
                          onClick={() => handleRemove(en._id, en.student?.user?.name)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Enroll Student">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Student *</label>
            <select name="studentId" required value={form.studentId} onChange={field}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">Select student</option>
              {students?.map((s) => (
                <option key={s._id} value={s._id}>{s.user?.name} — {s.enrollmentNumber}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Subject *</label>
            <select name="subjectId" required value={form.subjectId} onChange={field}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">Select subject</option>
              {subjects?.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.code}) — Sem {s.semester}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Academic Year *</label>
            <input name="academicYear" required placeholder="e.g. 2024-2025" value={form.academicYear} onChange={field}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-60">
              {saving ? 'Enrolling...' : 'Enroll'}
            </button>
            <button type="button" onClick={() => setShowModal(false)}
              className="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminEnrollments;
