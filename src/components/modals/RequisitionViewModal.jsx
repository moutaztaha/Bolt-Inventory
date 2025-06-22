import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  X, 
  Calendar, 
  User, 
  Package, 
  DollarSign, 
  Clock, 
  Check, 
  AlertTriangle,
  FileText,
  MessageSquare,
  Edit
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const RequisitionViewModal = ({ requisitionId, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [requisition, setRequisition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [approvalAction, setApprovalAction] = useState('');
  const [approvalComments, setApprovalComments] = useState('');

  useEffect(() => {
    if (requisitionId) {
      fetchRequisition();
    }
  }, [requisitionId]);

  const fetchRequisition = async () => {
    try {
      const response = await axios.get(`/api/requisitions/${requisitionId}`);
      setRequisition(response.data);
    } catch (error) {
      toast.error('Error fetching requisition details');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async () => {
    try {
      await axios.post(`/api/requisitions/${requisitionId}/approve`, {
        action: approvalAction,
        comments: approvalComments
      });
      
      toast.success(`Requisition ${approvalAction}d successfully`);
      setShowApprovalForm(false);
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || `Error ${approvalAction}ing requisition`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'fulfilled': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canApprove = () => {
    return (user.role === 'admin' || user.role === 'manager') &&
           (requisition?.status === 'submitted' || requisition?.status === 'pending_approval');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!requisition) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Requisition Details</h2>
            <p className="text-sm text-gray-600">{requisition.requisition_number}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            title="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Header Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{requisition.title}</h3>
                {requisition.description && (
                  <p className="text-sm text-gray-600">{requisition.description}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(requisition.status)}`}>
                    {requisition.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(requisition.priority)}`}>
                    {requisition.priority.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-1" />
                  {requisition.requested_by_name}
                </div>
                
                {requisition.department && (
                  <div className="text-sm text-gray-600">
                    Department: {requisition.department}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  Requested: {new Date(requisition.requested_date).toLocaleDateString()}
                </div>
                
                {requisition.required_date && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    Required: {new Date(requisition.required_date).toLocaleDateString()}
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Total: ${requisition.total_estimated_cost?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>
          </div>

          {/* Approval Actions */}
          {canApprove() && !showApprovalForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Approval Required</h4>
                  <p className="text-sm text-blue-700">This requisition is waiting for your approval.</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setApprovalAction('approve');
                      setShowApprovalForm(true);
                    }}
                    className="btn-success flex items-center"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setApprovalAction('reject');
                      setShowApprovalForm(true);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Approval Form */}
          {showApprovalForm && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-yellow-900 mb-3">
                {approvalAction === 'approve' ? 'Approve' : 'Reject'} Requisition
              </h4>
              <textarea
                className="form-input mb-3"
                rows="3"
                placeholder={`Enter ${approvalAction === 'approve' ? 'approval notes' : 'rejection reason'}...`}
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleApproval}
                  className={`${approvalAction === 'approve' ? 'btn-success' : 'bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded'}`}
                >
                  Confirm {approvalAction === 'approve' ? 'Approval' : 'Rejection'}
                </button>
                <button
                  onClick={() => setShowApprovalForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Requested Items</h3>
            <div className="space-y-3">
              {requisition.items?.map((item, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.item_name}</h4>
                      {item.inventory_sku && (
                        <p className="text-sm text-gray-500">SKU: {item.inventory_sku}</p>
                      )}
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600">Quantity</div>
                      <div className="font-medium">
                        {item.quantity_requested} {item.unit_abbr || 'units'}
                      </div>
                      {item.quantity_approved > 0 && (
                        <div className="text-sm text-green-600">
                          Approved: {item.quantity_approved}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600">Unit Cost</div>
                      <div className="font-medium">${item.estimated_unit_cost?.toFixed(2) || '0.00'}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600">Total Cost</div>
                      <div className="font-medium">${item.total_estimated_cost?.toFixed(2) || '0.00'}</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                        item.status === 'approved' ? 'bg-green-100 text-green-800' :
                        item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {item.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600">Notes: {item.notes}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          {requisition.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Notes</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{requisition.notes}</p>
              </div>
            </div>
          )}

          {/* Approval History */}
          {requisition.approvals && requisition.approvals.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval History</h3>
              <div className="space-y-3">
                {requisition.approvals.map((approval, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{approval.approver_name}</div>
                        <div className="text-sm text-gray-600">
                          Level {approval.approval_level} • {new Date(approval.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        approval.status === 'approved' ? 'bg-green-100 text-green-800' :
                        approval.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {approval.status.toUpperCase()}
                      </span>
                    </div>
                    {approval.comments && (
                      <div className="mt-2 text-sm text-gray-700">
                        <MessageSquare className="h-4 w-4 inline mr-1" />
                        {approval.comments}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {requisition.status === 'rejected' && requisition.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-900">Rejection Reason</h4>
                  <p className="text-sm text-red-700 mt-1">{requisition.rejection_reason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequisitionViewModal;