import { useState } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import assignmentService from '../../services/assignmentService';
import submissionService from '../../services/submissionService';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { getDeadlineInfo, urgencyStyle } from '../../utils/deadlineUtils';

const statusVariant = { submitted: 'blue', graded: 'green', returned: 'yellow' };

const StudentAssignments = () => {
  const { data: assignments, loading, error } = useFetch(assignmentService.getAll);
  const { data: mySubmissions, refetch: refetchSubmissions } = useFetch(submissionService.getMySubmissions);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  // Map assignmentId → submission for quick lookup
  const submissionMap = {};
  mySubmissions?.forEach((s) => {
    submissionMap[s.assignment._id] = s;
  });

  const openSubmit = (assignment) => {
    setSelectedAssignment(assignment);
    const existing = submissionMap[assignment._id];
    setSubmissionUrl(existing?.submissionUrl || '');
    setShowSubmitModal(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const existing = submissionMap[selectedAssignment._id];
      if (existing) {
        await submissionService.update(existing._id, { submissionUrl });
        toast.success('Submission updated');
      } else {
        await submissionService.submit({ assignmentId: selectedAssignment._id, submissionUrl });
        const dl = getDeadlineInfo(selectedAssignment.deadline);
        toast.success(dl.urgency === 'overdue' ? 'Submitted (late)' : 'Submitted successfully');
      }
      setShowSubmitModal(false);
      refetchSubmissions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const pending = assignments?.filter((a) => !submissionMap[a._id]) || [];
  const submitted = assignments?.filter((a) => submissionMap[a._id]) || [];
  const displayed = activeTab === 'pending' ? pending : submitted;

  return (
    <div>
      <PageHeader title="Assignments" subtitle="View and submit your assignments" />

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'pending', label: `Pending (${pending.length})` },
          { key: 'submitted', label: `Submitted (${submitted.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === key ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon="📌"
          title={activeTab === 'pending' ? 'No pending assignments' : 'No submitted assignments'}
        />
      ) : (
        <div className="space-y-3">
          {displayed.map((a) => {
            const dl = getDeadlineInfo(a.deadline);
            const submission = submissionMap[a._id];
            return (
              <Card key={a._id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-semibold text-gray-800">{a.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {a.subject?.name} ({a.subject?.code}) &nbsp;·&nbsp; Max: {a.maxMarks} marks
                    </p>
                    {a.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${urgencyStyle[dl.urgency]}`}>
                        {dl.label}
                      </span>
                      {submission && (
                        <>
                          <Badge label={submission.status} variant={statusVariant[submission.status] || 'gray'} />
                          {submission.isLate && <Badge label="Late" variant="red" />}
                          {submission.marksAwarded !== null && submission.marksAwarded !== undefined && (
                            <span className="text-xs text-gray-500 font-medium">
                              Grade: {submission.marksAwarded}/{a.maxMarks}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    {submission?.feedback && (
                      <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 mt-2">
                        Feedback: {submission.feedback}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {(!submission || submission.status === 'returned') && (
                      <button
                        onClick={() => openSubmit(a)}
                        className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700"
                      >
                        {submission ? 'Resubmit' : 'Submit'}
                      </button>
                    )}
                    {submission && submission.status !== 'returned' && (
                      <button
                        onClick={() => openSubmit(a)}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Update
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submit Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title={`Submit — ${selectedAssignment?.title}`}
      >
        <div className="space-y-4">
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <p>Subject: <strong>{selectedAssignment?.subject?.name}</strong></p>
            <p className="mt-0.5">
              Deadline: <strong>{selectedAssignment && new Date(selectedAssignment.deadline).toLocaleString()}</strong>
            </p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Submission URL / Reference
            </label>
            <input
              type="text"
              placeholder="https://drive.google.com/... or any reference link"
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Paste a Google Drive link, GitHub URL, or any reference. File upload will be added in a future version.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
              {submitting ? 'Submitting...' : submissionMap[selectedAssignment?._id] ? 'Update Submission' : 'Submit'}
            </button>
            <button onClick={() => setShowSubmitModal(false)}
              className="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentAssignments;
