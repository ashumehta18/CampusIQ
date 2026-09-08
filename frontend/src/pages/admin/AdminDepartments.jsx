import { useState } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import departmentService from '../../services/departmentService';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

const emptyForm = { name: '', code: '', description: '', hodName: '' };

const AdminDepartments = () => {
  const { data: departments, loading, error, refetch } = useFetch(departmentService.getAll);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // holds department being edited
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (dept) => {
    setEditing(dept);
    setForm({ name: dept.name, code: dept.code, description: dept.description, hodName: dept.hodName });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await departmentService.update(editing._id, form);
        toast.success('Department updated');
      } else {
        await departmentService.create(form);
        toast.success('Department created');
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="Manage academic departments"
        action={
          <button
            onClick={openCreate}
            className="bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            + Add Department
          </button>
        }
      />

      {loading ? <Spinner /> : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : !departments?.length ? (
        <EmptyState icon="🏛️" title="No departments yet" description="Create your first department to get started" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Card key={dept._id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{dept.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{dept.code}</p>
                </div>
                <Badge label={dept.isActive ? 'Active' : 'Inactive'} variant={dept.isActive ? 'green' : 'red'} />
              </div>
              {dept.hodName && (
                <p className="text-sm text-gray-500 mt-2">HOD: {dept.hodName}</p>
              )}
              {dept.description && (
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{dept.description}</p>
              )}
              <button
                onClick={() => openEdit(dept)}
                className="mt-4 text-sm text-purple-600 hover:underline"
              >
                Edit
              </button>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Department' : 'Add Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Department Name', name: 'name', required: true },
            { label: 'Code (e.g. CSE)', name: 'code', required: true },
            { label: 'HOD Name', name: 'hodName' },
            { label: 'Description', name: 'description' },
          ].map(({ label, name, required }) => (
            <div key={name}>
              <label className="block text-sm text-gray-600 mb-1">{label}</label>
              <input
                type="text"
                required={required}
                value={form[name]}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDepartments;
