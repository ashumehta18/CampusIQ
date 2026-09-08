import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import subjectService from '../../services/subjectService';
import assignmentService from '../../services/assignmentService';
import submissionService from '../../services/submissionService';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { getDeadlineInfo, urgencyStyle } from '../../utils/deadlineUtils';

const emptyForm = { title: '', description: '', deadline: '', maxMarks: 10 };

const statusVariant = { submitted: 'blue', graded: 'green', returned: 'yellow' };

const FacultyAssignments = () => {
  const { data: subjects } = useFetch(subjectService.getMySubjects);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Submissions modal
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Grade modal
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marksAwarded: '', feedback: '', status: 'graded' });
  const [grading, setGrading] = useState(false);

  const loadAssignments = async (subjectId) => {
    if (!subjectId) { setAssignments([]); return; }
    setLoadingAssignments(true);
    try {
      const res = await assignmentService.getAll({ subjectId });
      setAssignments(res.data.data);
    } catch {
      toast.error('Failed to load assignments');
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => { loadAssignments(selectedSubject); }, [selectedSubject]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await assignmentService.create({ ...form, subjectId: selectedSubject });
      toast.success('Assignment created — students notified');
      setShowCreateModal(false);
      setForm(emptyForm);
      loadAssignments(selectedSubject);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const openSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionsModal(true);
    setLoadingSubmissions(true);
    try {
      const res = await submissionService.getByAssignment(assignment._id);
      setSubmissions(res.data.data);
    } catch {
      toast.error('Failed to load submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const openGrade = (submission) => {
    setSelectedSubmission(submission);
    setGradeForm({
      marksAwarded: submission.marksAwarded ?? '',
      feedback: submission.feedback || '',
      status: 'graded',
    });
    setShowGradeModal(true);
  };

  const handleGrade = async () => {
    setGrading(true);
    try {
      await submissionService.grade(selectedSubmission._id, {
        marksAwarded: Number(gradeForm.marksAwarded),
        feedback: gradeForm.feedback,
        status: gradeForm.status,
      });
      toast.success('Submission graded');
      setShowGradeModal(false);
      // Refresh submissions list
      const res = await submissionService.getByAssignment(selectedAssignment._id);
      setSubmissions(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setGrading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await assignmentService.delete(id);
      toast.success('Assignment deleted');
      loadAssignments(selectedSubject);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const field = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div>
      <PageHeader title="Assignments" subtitle="Create and manage assignments for your subjects" />

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
              + New Assignment
            </button>
          )}
        </div>
      </Card>

      {!selectedSubject ? (
        <EmptyState icon="📌" title="Select a subject to view assignments" />
      ) : loadingAssignments ? (
        <Spinner />
      ) : assignments.length === 0 ? (
        <EmptyState icon="📌" title="No assignments yet" description="Create your first assignment" />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const dl = getDeadlineInfo(a.deadline);
            return (
              <Card key={a._id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-semibold text-gray-800">{a.title}</h3>
                    {a.description && (
                      <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{a.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${urgencyStyle[dl.urgency]}`}>
                        {dl.label}
                      </span>
                      <span className="text-xs text-gray-400">Max: {a.maxMarks} marks</span>
                    </div>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button
                      onClick={() => openSubmissions(a)}
                      className="text-sm text-green-600 hover:underline font-medium"
                    >
                      Submissions
                    </button>
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="text-sm text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Assignment Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Assignment">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Title *</label>
            <input name="title" required value={form.title} onChange={field}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <textarea name="description" rows={3} value={form.description} onChange={field}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Deadline *</label>
              <input name="deadline" type="datetime-local" required value={form.deadline} onChange={field}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Max Marks</label>
              <input name="maxMarks" type="number" min={1} value={form.maxMarks} onChange={field}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-60">
              {saving ? 'Creating...' : 'Create & Notify Students'}
            </button>
            <button type="button" onClick={() => setShowCreateModal(false)}
              className="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Submissions Modal */}
      <Modal
        isOpen={showSubmissionsModal}
        onClose={() => setShowSubmissionsModal(false)}
        title={`Submissions — ${selectedAssignment?.title}`}
      >
        {loadingSubmissions ? (
          <Spinner />
        ) : submissions.length === 0 ? (
          <EmptyState icon="📭" title="No submissions yet" />
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {submissions.map((sub) => (
              <div key={sub._id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{sub.student?.user?.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge label={sub.status} variant={statusVariant[sub.status] || 'gray'} />
                    {sub.isLate && <Badge label="Late" variant="red" />}
                    {sub.marksAwarded !== null && sub.marksAwarded !== undefined && (
                      <span className="text-xs text-gray-500">
                        {sub.marksAwarded}/{selectedAssignment?.maxMarks}
                      </span>
                    )}
                  </div>
                  {sub.submissionUrl && (
                    <a href={sub.submissionUrl} target="_blank" rel="noreferrer"
                      className="text-xs text-blue-500 hover:underline mt-0.5 block truncate">
                      {sub.submissionUrl}
                    </a>
                  )}
                </div>
                {sub.status !== 'graded' && (
                  <button
                    onClick={() => openGrade(sub)}
                    className="text-xs text-green-600 hover:underline ml-3 shrink-0"
                  >
                    Grade
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Grade Modal */}
      <Modal
        isOpen={showGradeModal}
        onClose={() => setShowGradeModal(false)}
        title={`Grade — ${selectedSubmission?.student?.user?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Marks Awarded (max: {selectedAssignment?.maxMarks})
            </label>
            <input
              type="number"
              min={0}
              max={selectedAssignment?.maxMarks}
              value={gradeForm.marksAwarded}
              onChange={(e) => setGradeForm({ ...gradeForm, marksAwarded: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Feedback</label>
            <textarea
              rows={3}
              value={gradeForm.feedback}
              onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select
              value={gradeForm.status}
              onChange={(e) => setGradeForm({ ...gradeForm, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="graded">Graded</option>
              <option value="returned">Returned for revision</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleGrade} disabled={grading}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-60">
              {grading ? 'Saving...' : 'Save Grade'}
            </button>
            <button onClick={() => setShowGradeModal(false)}
              className="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FacultyAssignments;
