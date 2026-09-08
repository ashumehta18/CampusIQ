import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import subjectService from '../../services/subjectService';
import assessmentService from '../../services/assessmentService';
import enrollmentService from '../../services/enrollmentService';
import marksService from '../../services/marksService';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

const ASSESSMENT_TYPES = ['Quiz', 'Assignment', 'Midterm', 'Internal', 'Practical', 'Final'];
const typeVariant = {
  Quiz: 'blue', Assignment: 'gray', Midterm: 'yellow',
  Internal: 'purple', Practical: 'green', Final: 'red',
};

const emptyForm = { title: '', type: 'Quiz', maxMarks: '', weightage: '', date: '', description: '' };

const FacultyAssessments = () => {
  const { data: subjects } = useFetch(subjectService.getMySubjects);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [assessments, setAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  // Create assessment modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Enter marks modal
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [marksInput, setMarksInput] = useState({}); // { studentId: { marksObtained, remarks } }
  const [savingMarks, setSavingMarks] = useState(false);

  const loadAssessments = async (subjectId) => {
    if (!subjectId) { setAssessments([]); return; }
    setLoadingAssessments(true);
    try {
      const res = await assessmentService.getBySubject(subjectId);
      setAssessments(res.data.data);
    } catch {
      toast.error('Failed to load assessments');
    } finally {
      setLoadingAssessments(false);
    }
  };

  useEffect(() => { loadAssessments(selectedSubject); }, [selectedSubject]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await assessmentService.create({ ...form, subjectId: selectedSubject });
      toast.success('Assessment created');
      setShowCreateModal(false);
      setForm(emptyForm);
      loadAssessments(selectedSubject);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const openMarksModal = async (assessment) => {
    setSelectedAssessment(assessment);
    setShowMarksModal(true);
    try {
      // Load enrolled students
      const enrollRes = await enrollmentService.getStudentsBySubject(selectedSubject);
      const enrolled = enrollRes.data.data;
      setEnrollments(enrolled);

      // Pre-fill existing marks
      const marksRes = await marksService.getByAssessment(assessment._id);
      const existing = marksRes.data.data;
      const filled = {};
      enrolled.forEach((en) => {
        const found = existing.find((m) => m.student._id === en.student._id);
        filled[en.student._id] = {
          marksObtained: found ? String(found.marksObtained) : '',
          remarks: found?.remarks || '',
        };
      });
      setMarksInput(filled);
    } catch {
      toast.error('Failed to load students');
    }
  };

  const handleSaveMarks = async () => {
    const marks = enrollments
      .filter((en) => marksInput[en.student._id]?.marksObtained !== '')
      .map((en) => ({
        studentId: en.student._id,
        marksObtained: Number(marksInput[en.student._id].marksObtained),
        remarks: marksInput[en.student._id].remarks || '',
      }));

    if (marks.length === 0) return toast.error('Enter at least one mark');

    setSavingMarks(true);
    try {
      await marksService.enterBulk({ assessmentId: selectedAssessment._id, marks });
      toast.success('Marks saved');
      setShowMarksModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save marks');
    } finally {
      setSavingMarks(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assessment and all its marks?')) return;
    try {
      await assessmentService.delete(id);
      toast.success('Assessment deleted');
      loadAssessments(selectedSubject);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const field = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div>
      <PageHeader title="Assessments" subtitle="Create assessments and enter student marks" />

      {/* Subject selector */}
      <Card className="mb-6">
        <label className="block text-sm text-gray-600 mb-1">Select Subject</label>
        <div className="flex gap-3 items-center">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="flex-1 md:w-80 md:flex-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select subject</option>
            {subjects?.map((s) => (
              <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
            ))}
          </select>
          {selectedSubject && (
            <button
              onClick={() => { setForm(emptyForm); setShowCreateModal(true); }}
              className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700"
            >
              + New Assessment
            </button>
          )}
        </div>
      </Card>

      {/* Assessment list */}
      {!selectedSubject ? (
        <EmptyState icon="📝" title="Select a subject to view assessments" />
      ) : loadingAssessments ? (
        <Spinner />
      ) : assessments.length === 0 ? (
        <EmptyState icon="📝" title="No assessments yet" description="Create your first assessment" />
      ) : (
        <div className="space-y-3">
          {assessments.map((a) => (
            <Card key={a._id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Badge label={a.type} variant={typeVariant[a.type] || 'gray'} />
                  <div>
                    <h3 className="font-semibold text-gray-800">{a.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Max: {a.maxMarks} marks &nbsp;·&nbsp;
                      {new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {a.weightage > 0 && ` · Weightage: ${a.weightage}%`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => openMarksModal(a)}
                    className="text-sm text-green-600 hover:underline font-medium"
                  >
                    Enter Marks
                  </button>
                  <button
                    onClick={() => handleDelete(a._id)}
                    className="text-sm text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {a.description && (
                <p className="text-sm text-gray-400 mt-2">{a.description}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Assessment Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Assessment">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Title *</label>
            <input name="title" required value={form.title} onChange={field}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Type *</label>
              <select name="type" value={form.type} onChange={field}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                {ASSESSMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Max Marks *</label>
              <input name="maxMarks" type="number" min={1} required value={form.maxMarks} onChange={field}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date *</label>
              <input name="date" type="date" required value={form.date} onChange={field}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Weightage (%)</label>
              <input name="weightage" type="number" min={0} max={100} value={form.weightage} onChange={field}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <input name="description" value={form.description} onChange={field}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-60">
              {saving ? 'Creating...' : 'Create Assessment'}
            </button>
            <button type="button" onClick={() => setShowCreateModal(false)}
              className="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Enter Marks Modal */}
      <Modal
        isOpen={showMarksModal}
        onClose={() => setShowMarksModal(false)}
        title={`Enter Marks — ${selectedAssessment?.title}`}
      >
        <div className="mb-3 text-xs text-gray-500">
          Max marks: <strong>{selectedAssessment?.maxMarks}</strong>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {enrollments.map((en, idx) => {
            const s = en.student;
            const val = marksInput[s._id] || { marksObtained: '', remarks: '' };
            return (
              <div key={s._id} className="flex items-center gap-3">
                <span className="text-gray-400 text-xs w-5">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{s.user?.name}</p>
                  <p className="text-xs text-gray-400">{s.enrollmentNumber}</p>
                </div>
                <input
                  type="number"
                  min={0}
                  max={selectedAssessment?.maxMarks}
                  placeholder="Marks"
                  value={val.marksObtained}
                  onChange={(e) =>
                    setMarksInput((prev) => ({
                      ...prev,
                      [s._id]: { ...prev[s._id], marksObtained: e.target.value },
                    }))
                  }
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                />
                <input
                  type="text"
                  placeholder="Remarks"
                  value={val.remarks}
                  onChange={(e) =>
                    setMarksInput((prev) => ({
                      ...prev,
                      [s._id]: { ...prev[s._id], remarks: e.target.value },
                    }))
                  }
                  className="w-24 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-400"
                />
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleSaveMarks} disabled={savingMarks}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-60">
            {savingMarks ? 'Saving...' : 'Save Marks'}
          </button>
          <button onClick={() => setShowMarksModal(false)}
            className="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default FacultyAssessments;
