import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X, Plus, Trash2, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const RequisitionModal = ({ requisition, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    priority: 'medium',
    required_date: '',
    notes: ''
  });
  const [items, setItems] = useState([{
    inventory_id: '',
    item_name: '',
    description: '',
    quantity_requested: 1,
    unit_id: '',
    estimated_unit_cost: 0,
    notes: ''
  }]);
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    fetchDropdownData();
    
    if (requisition) {
      setFormData({
        title: requisition.title,
        description: requisition.description || '',
        department: requisition.department || '',
        priority: requisition.priority,
        required_date: requisition.required_date ? requisition.required_date.split('T')[0] : '',
        notes: requisition.notes || ''
      });
      
      // Fetch requisition items if editing
      fetchRequisitionItems();
    }
  }, [requisition]);

  const fetchDropdownData = async () => {
    try {
      const [inventoryRes, unitsRes] = await Promise.all([
        axios.get('/api/inventory'),
        axios.get('/api/units')
      ]);
      
      setInventory(inventoryRes.data);
      setUnits(unitsRes.data);
    } catch (error) {
      toast.error('Error fetching dropdown data');
    }
  };

  const fetchRequisitionItems = async () => {
    try {
      const response = await axios.get(`/api/requisitions/${requisition.id}`);
      if (response.data.items && response.data.items.length > 0) {
        setItems(response.data.items.map(item => ({
          inventory_id: item.inventory_id || '',
          item_name: item.item_name,
          description: item.description || '',
          quantity_requested: item.quantity_requested,
          unit_id: item.unit_id || '',
          estimated_unit_cost: item.estimated_unit_cost,
          notes: item.notes || ''
        })));
      }
    } catch (error) {
      console.error('Error fetching requisition items:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate items
    const validItems = items.filter(item => item.item_name.trim() && item.quantity_requested > 0);
    if (validItems.length === 0) {
      toast.error('Please add at least one valid item');
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        items: validItems
      };

      if (requisition) {
        await axios.put(`/api/requisitions/${requisition.id}`, submitData);
        toast.success('Requisition updated successfully');
      } else {
        await axios.post('/api/requisitions', submitData);
        toast.success('Requisition created successfully');
      }
      
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Auto-fill item details when inventory item is selected
      if (field === 'inventory_id' && value) {
        const selectedItem = inventory.find(item => item.id == value);
        if (selectedItem) {
          newItems[index].item_name = selectedItem.name;
          newItems[index].description = selectedItem.description || '';
          newItems[index].unit_id = selectedItem.base_unit_id || '';
          newItems[index].estimated_unit_cost = selectedItem.unit_price || 0;
        }
      }
      
      return newItems;
    });
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      inventory_id: '',
      item_name: '',
      description: '',
      quantity_requested: 1,
      unit_id: '',
      estimated_unit_cost: 0,
      notes: ''
    }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const getTotalCost = () => {
    return items.reduce((sum, item) => sum + (item.quantity_requested * item.estimated_unit_cost), 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {requisition ? 'Edit Requisition' : 'New Requisition'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            title="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="form-input"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter requisition title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  className="form-input"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Enter department"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority *
                </label>
                <select
                  name="priority"
                  required
                  className="form-select"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Date
                </label>
                <input
                  type="date"
                  name="required_date"
                  className="form-input"
                  value={formData.required_date}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  className="form-input"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter requisition description"
                />
              </div>
            </div>

            {/* Items Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Requested Items</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="btn-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Item {index + 1}</h4>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-900"
                          title="Remove Item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Inventory Item
                        </label>
                        <select
                          className="form-select text-sm"
                          value={item.inventory_id}
                          onChange={(e) => handleItemChange(index, 'inventory_id', e.target.value)}
                        >
                          <option value="">Select from inventory</option>
                          {inventory.map(invItem => (
                            <option key={invItem.id} value={invItem.id}>
                              {invItem.name} ({invItem.sku})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Item Name *
                        </label>
                        <input
                          type="text"
                          className="form-input text-sm"
                          value={item.item_name}
                          onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                          placeholder="Enter item name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="form-input text-sm"
                          value={item.quantity_requested}
                          onChange={(e) => handleItemChange(index, 'quantity_requested', parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Unit
                        </label>
                        <select
                          className="form-select text-sm"
                          value={item.unit_id}
                          onChange={(e) => handleItemChange(index, 'unit_id', e.target.value)}
                        >
                          <option value="">Select unit</option>
                          {units.map(unit => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name} ({unit.abbreviation})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Estimated Cost ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-input text-sm"
                          value={item.estimated_unit_cost}
                          onChange={(e) => handleItemChange(index, 'estimated_unit_cost', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Total Cost
                        </label>
                        <input
                          type="text"
                          className="form-input text-sm bg-gray-100"
                          value={`$${(item.quantity_requested * item.estimated_unit_cost).toFixed(2)}`}
                          readOnly
                        />
                      </div>

                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Description
                        </label>
                        <textarea
                          rows="2"
                          className="form-input text-sm"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Enter item description"
                        />
                      </div>

                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Notes
                        </label>
                        <textarea
                          rows="2"
                          className="form-input text-sm"
                          value={item.notes}
                          onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                          placeholder="Additional notes for this item"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Cost Summary */}
              <div className="bg-blue-50 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Total Estimated Cost:</span>
                  <span className="text-lg font-bold text-blue-900">${getTotalCost().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                name="notes"
                rows="3"
                className="form-input"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes or special instructions"
              />
            </div>
          </form>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
            onClick={handleSubmit}
          >
            {loading ? 'Saving...' : (requisition ? 'Update Requisition' : 'Create Requisition')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequisitionModal;