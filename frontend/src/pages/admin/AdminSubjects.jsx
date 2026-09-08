import { useState } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import subjectService from '../../services/subjectService';
import departmentService from '../../services/departmentService';
import facultyService from '../../services/facultyService';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

const emptyForm = { name: '', code: '', department: '', faculty: '', semester: '', credits: 3, description: '' };

const AdminSubjects = () => {
  const { data: subjects, loading, error, refetch } = useFetch(subjectService.getAll);
  const { data: departments } = useFetch(departmentService.getAll);
  const { data: facultyList } = useFetch(facultyService.getAllFaculty);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (sub) => {
    setEditing(sub);
    setForm({
      name: sub.name, code: sub.code,
      department: sub.department?._id || '',
      faculty: sub.faculty?._id || '',
      semester: sub.semester, credits: sub.credits,
      description: sub.description,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await subjectService.update(editing._id, form);
        toast.success('Subject updated');
      } else {
        await subjectService.create(form);
        toast.success('Subject created');
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const field = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div>
      <PageHeader
        title="Subjects"
        subtitle="Manage all subjects and faculty assignments"
        action={
          <button onClick={openCreate} className="bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700">
            + Add Subject
          </button>
        }
      />

      {loading ? <Spinner /> : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : !subjects?.length ? (
        <EmptyState icon="📚" title="No subjects yet" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                  {['Subject', 'Code', 'Department', 'Faculty', 'Sem', 'Credits', ''].map((h) => (
                    <th key={h} className="pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subjects.map((sub) => (
                  <tr key={sub._id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-800">{sub.name}</td>
                    <td className="py-3 pr-4"><Badge label={sub.code} variant="blue" /></td>
                    <td className="py-3 pr-4 text-gray-500">{sub.department?.name}</td>
                    <td className="py-3 pr-4 text-gray-500">{sub.faculty?.user?.name || '—'}</td>
                    <td className="py-3 pr-4 text-gray-500">{sub.semester}</td>
                    <td className="py-3 pr-4 text-gray-500">{sub.credits}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => openEdit(sub)} className="text-xs text-purple-600 hover:underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Subject' : 'Add Subject'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Subject Name *</label>
              <input name="name" required value={form.name} onChange={field}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Code *</label>
              <input name="code" required value={form.code} onChange={field}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Department *</label>
              <select name="department" required value={form.department} onChange={field}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Select</option>
                {departments?.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Faculty</label>
              <select name="faculty" value={form.faculty} onChange={field}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Unassigned</option>
                {facultyList?.map((f) => <option key={f._id} value={f._id}>{f.user?.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Semester *</label>
              <select name="semester" required value={form.semester} onChange={field}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Select</option>
                {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Credits</label>
              <input name="credits" type="number" min={1} max={6} value={form.credits} onChange={field}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <input name="description" value={form.description} onChange={field}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-60">
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
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

export default AdminSubjects;
