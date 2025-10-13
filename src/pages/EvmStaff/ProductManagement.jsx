import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllModelsThunk,
  createModelThunk,
  updateModelThunk,
  deleteModelThunk,
  getColorsByModelNameThunk,
  addColorToModelThunk,
  removeColorFromModelThunk,
} from '@store/slices/modelSlice';
import {
  getAllColorsThunk,
  createColorThunk,
  updateColorThunk,
  deleteColorThunk,
} from '@store/slices/colorSlice';

function ProductManagement({ onBack }) {
  const dispatch = useDispatch();
  const { items: models, status: modelStatus } = useSelector((s) => s.models);
  const { items: colors } = useSelector((s) => s.colors);

  const [successMsg, setSuccessMsg] = useState('');
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);

  // Track colors for each model
  const [modelColorsMap, setModelColorsMap] = useState({});
  // Track which model is showing color dropdown
  const [addingColorToModel, setAddingColorToModel] = useState(null);
  const [selectedColorId, setSelectedColorId] = useState('');

  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [colorForm, setColorForm] = useState({ colorName: '' });

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingModel, setViewingModel] = useState(null);

  const blankModel = useMemo(() => ({
    modelName: '',
    modelYear: '',
    batteryCapacity: '',
    range: '',
    powerHp: '',
    torqueNm: '',
    acceleration: '',
    seatingCapacity: '',
    price: '',
    bodyType: '',
    description: '',
  }), []);

  const [modelForm, setModelForm] = useState(blankModel);

  useEffect(() => {
    dispatch(getAllModelsThunk());
    dispatch(getAllColorsThunk());
  }, [dispatch]);

  // Fetch colors for all models
  useEffect(() => {
    if (models.length > 0) {
      models.forEach((model) => {
        dispatch(getColorsByModelNameThunk(model.modelName))
          .unwrap()
          .then((response) => {
            const colors = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
            setModelColorsMap(prev => ({
              ...prev,
              [model.modelId]: colors
            }));
          })
          .catch(() => {
            setModelColorsMap(prev => ({
              ...prev,
              [model.modelId]: []
            }));
          });
      });
    }
  }, [models.length, dispatch]);

  const openCreateModel = () => {
    setEditingModel(null);
    setModelForm(blankModel);
    setModelModalOpen(true);
  };

  const openEditModel = (m) => {
    setEditingModel(m);
    setModelForm({
      modelId: m.modelId,
      modelName: m.modelName || '',
      modelYear: m.modelYear || '',
      batteryCapacity: m.batteryCapacity || '',
      range: m.range || m.range_km || '',
      powerHp: m.powerHp || m.power_hp || '',
      torqueNm: m.torqueNm || m.torque_nm || '',
      acceleration: m.acceleration || '',
      seatingCapacity: m.seatingCapacity || '',
      price: m.price || '',
      bodyType: m.bodyType || m.body_type || '',
      description: m.description || '',
    });
    setModelModalOpen(true);
  };

  const submitModel = async (e) => {
    e.preventDefault();
    try {
      if (editingModel) {
        await dispatch(updateModelThunk(modelForm)).unwrap();
        setSuccessMsg('Đã cập nhật mẫu xe');
      } else {
        await dispatch(createModelThunk(modelForm)).unwrap();
        setSuccessMsg('Đã tạo mẫu xe');
      }
      setModelModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      alert(err?.message || 'Lỗi thao tác mẫu xe');
    }
  };

  const removeModel = async (id) => {
    if (!confirm('Xóa mẫu xe này?')) return;
    try {
      await dispatch(deleteModelThunk(id)).unwrap();
      setSuccessMsg('Đã xóa mẫu xe');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      alert(err?.message || 'Không thể xóa');
    }
  };

  const openCreateColor = () => {
    setEditingColor(null);
    setColorForm({ colorName: '' });
    setColorModalOpen(true);
  };

  const openEditColor = (c) => {
    setEditingColor(c);
    setColorForm({ colorId: c.colorId, colorName: c.colorName || '' });
    setColorModalOpen(true);
  };

  const submitColor = async (e) => {
    e.preventDefault();
    try {
      if (editingColor) {
        await dispatch(updateColorThunk(colorForm)).unwrap();
        setSuccessMsg('Đã cập nhật màu sắc');
      } else {
        await dispatch(createColorThunk(colorForm)).unwrap();
        setSuccessMsg('Đã tạo màu sắc');
      }
      setColorModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      alert(err?.message || 'Lỗi thao tác màu');
    }
  };

  const removeColor = async (id) => {
    if (!confirm('Xóa màu này?')) return;
    try {
      await dispatch(deleteColorThunk(id)).unwrap();
      setSuccessMsg('Đã xóa màu');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      alert(err?.message || 'Không thể xóa');
    }
  };

  const toggleAddColor = (modelId) => {
    if (addingColorToModel === modelId) {
      setAddingColorToModel(null);
      setSelectedColorId('');
    } else {
      setAddingColorToModel(modelId);
      setSelectedColorId('');
    }
  };

  const handleAddColor = async (model) => {
    if (!selectedColorId) {
      alert('Vui lòng chọn màu');
      return;
    }

    const colorToAdd = colors.find(c => c.colorId === parseInt(selectedColorId));
    if (!colorToAdd) return;

    try {
      await dispatch(addColorToModelThunk({
        modelName: model.modelName,
        colorName: colorToAdd.colorName,
      })).unwrap();

      // Refresh colors for this model
      const response = await dispatch(getColorsByModelNameThunk(model.modelName)).unwrap();
      const updatedColors = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setModelColorsMap(prev => ({
        ...prev,
        [model.modelId]: updatedColors
      }));

      setSuccessMsg(`Đã thêm màu ${colorToAdd.colorName}`);
      setAddingColorToModel(null);
      setSelectedColorId('');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      alert(err?.message || 'Không thể thêm màu');
    }
  };

  const handleRemoveColor = async (model, color) => {
    if (!confirm(`Xóa màu ${color.colorName}?`)) return;

    try {
      await dispatch(removeColorFromModelThunk({
        modelName: model.modelName,
        colorName: color.colorName,
        colorId: color.colorId,
      })).unwrap();

      // Refresh colors for this model
      const response = await dispatch(getColorsByModelNameThunk(model.modelName)).unwrap();
      const updatedColors = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setModelColorsMap(prev => ({
        ...prev,
        [model.modelId]: updatedColors
      }));

      setSuccessMsg(`Đã xóa màu ${color.colorName}`);
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      alert(err?.message || 'Không thể xóa màu');
    }
  };

  // Get available colors for a specific model
  const getAvailableColors = (modelId) => {
    const modelColors = modelColorsMap[modelId] || [];
    const assignedColorIds = modelColors.map(c => c.colorId);
    return colors.filter(c => !assignedColorIds.includes(c.colorId));
  };

  const openModelDetail = (model) => {
    setViewingModel(model);
    setDetailModalOpen(true);
  };

  return (
    <div className="px-6 space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý mẫu xe và màu sắc</p>
        </div>
        {onBack && (
          <button onClick={onBack} className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors bg-white text-gray-900">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Quay lại
          </button>
        )}
      </div>

      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 text-sm">{successMsg}</div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Danh sách mẫu xe</h3>
            <div className="flex gap-2">
              <button onClick={openCreateColor} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition bg-white text-gray-900">
                Quản lý màu sắc
              </button>
              <button onClick={openCreateModel} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition bg-white text-gray-900">
                Thêm mẫu xe
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {models.map((m) => {
              const modelColors = modelColorsMap[m.modelId] || [];
              const availableColors = getAvailableColors(m.modelId);
              const isAddingColor = addingColorToModel === m.modelId;

              return (
                <div key={m.modelId} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition">
                  {/* Make the image area clickable */}
                  <div 
                    className="h-32 bg-gradient-to-r from-emerald-50 to-gray-50 cursor-pointer hover:from-emerald-100 hover:to-gray-100 transition"
                    onClick={() => openModelDetail(m)}
                  />
                  <div className="p-4 space-y-3">
                    {/* Model info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-base font-semibold text-gray-900">{m.modelName}</div>
                        <div className="text-xs text-gray-500">{m.bodyType || '—'} • {m.modelYear || '—'}</div>
                      </div>
                      <div className="text-emerald-600 font-semibold text-sm">{m.price ? `${Number(m.price).toLocaleString('vi-VN')}₫` : '—'}</div>
                    </div>
                    
                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>Pin: <span className="font-medium text-gray-800">{m.batteryCapacity ?? '—'} kWh</span></div>
                      <div>Tầm: <span className="font-medium text-gray-800">{m.range ?? '—'} km</span></div>
                      <div>HP: <span className="font-medium text-gray-800">{m.powerHp ?? '—'}</span></div>
                      <div>0-100: <span className="font-medium text-gray-800">{m.acceleration ?? '—'} s</span></div>
                    </div>

                    {/* Colors section */}
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700">Màu sắc ({modelColors.length})</span>
                      </div>
                      
                      {/* Color badges */}
                      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                        {modelColors.map((color) => (
                          <span 
                            key={color.colorId} 
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium group hover:bg-emerald-100 transition bg-white text-gray-900"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            {color.colorName}
                            <button
                              onClick={() => handleRemoveColor(m, color)}
                              className="ml-0.5 hover:bg-emerald-200 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                        
                        {/* Add color button/dropdown */}
                        {!isAddingColor && availableColors.length > 0 && (
                          <button
                            onClick={() => toggleAddColor(m.modelId)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-dashed border-gray-300 text-gray-600 text-xs font-medium hover:border-emerald-500 hover:text-emerald-600 transition bg-white text-gray-900"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Thêm
                          </button>
                        )}
                      </div>

                      {/* Inline add color dropdown */}
                      {isAddingColor && (
                        <div className="flex gap-2 pt-1">
                          <select
                            value={selectedColorId}
                            onChange={(e) => setSelectedColorId(e.target.value)}
                            className="flex-1 text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-gray-900"
                            autoFocus
                          >
                            <option value="">-- Chọn màu --</option>
                            {availableColors.map((c) => (
                              <option key={c.colorId} value={c.colorId}>{c.colorName}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAddColor(m)}
                            disabled={!selectedColorId}
                            className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition bg-white text-gray-900"
                          >
                            OK
                          </button>
                          <button
                            onClick={() => toggleAddColor(m.modelId)}
                            className="px-2 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition bg-white text-gray-900"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions - ADD VIEW DETAIL BUTTON */}
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => openModelDetail(m)} 
                        className="flex-1 px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition bg-white text-gray-900"
                      >
                        Chi tiết
                      </button>
                      <button onClick={() => openEditModel(m)} className="flex-1 px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition bg-white text-gray-900">
                        Sửa
                      </button>
                      <button onClick={() => removeModel(m.modelId)} className="flex-1 px-3 py-2 text-sm rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition bg-white text-gray-900">
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Model modal */}
      {modelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModelModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl border border-gray-200 p-6 max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{editingModel ? 'Cập nhật' : 'Thêm'} mẫu xe</h3>
              <button onClick={() => setModelModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100"><svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <form onSubmit={submitModel} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên mẫu</label>
                <input value={modelForm.modelName} onChange={(e) => setModelForm(v => ({ ...v, modelName: e.target.value }))} className="w-full border rounded-xl px-3 py-2 bg-white text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Năm</label>
                <input type="number" value={modelForm.modelYear} onChange={(e) => setModelForm(v => ({ ...v, modelYear: Number(e.target.value) }))} className="w-full border rounded-xl px-3 py-2 bg-white text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dung lượng pin (kWh)</label>
                <input type="number" value={modelForm.batteryCapacity} onChange={(e) => setModelForm(v => ({ ...v, batteryCapacity: Number(e.target.value) }))} className="w-full border rounded-xl px-3 py-2 bg-white text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tầm hoạt động (km)</label>
                <input type="number" value={modelForm.range} onChange={(e) => setModelForm(v => ({ ...v, range: Number(e.target.value) }))} className="w-full border rounded-xl px-3 py-2 bg-white text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Công suất (hp)</label>
                <input type="number" value={modelForm.powerHp} onChange={(e) => setModelForm(v => ({ ...v, powerHp: Number(e.target.value) }))} className="w-full border rounded-xl px-3 py-2 bg-white text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô-men xoắn (Nm)</label>
                <input type="number" value={modelForm.torqueNm} onChange={(e) => setModelForm(v => ({ ...v, torqueNm: Number(e.target.value) }))} className="w-full border rounded-xl px-3 py-2 bg-white text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tăng tốc 0-100 (s)</label>
                <input type="number" step="0.1" value={modelForm.acceleration} onChange={(e) => setModelForm(v => ({ ...v, acceleration: Number(e.target.value) }))} className="w-full border rounded-xl px-3 py-2 bg-white text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số chỗ ngồi</label>
                <input type="number" value={modelForm.seatingCapacity} onChange={(e) => setModelForm(v => ({ ...v, seatingCapacity: Number(e.target.value) }))} className="w-full border rounded-xl px-3 py-2 bg-white text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
                <input type="number" value={modelForm.price} onChange={(e) => setModelForm(v => ({ ...v, price: Number(e.target.value) }))} className="w-full border rounded-xl px-3 py-2 bg-white text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kiểu dáng</label>
                <input value={modelForm.bodyType} onChange={(e) => setModelForm(v => ({ ...v, bodyType: e.target.value }))} className="w-full border rounded-xl px-3 py-2 bg-white text-gray-900" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea value={modelForm.description} onChange={(e) => setModelForm(v => ({ ...v, description: e.target.value }))} className="w-full border rounded-xl px-3 py-2 bg-white text-gray-900" rows={3} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModelModalOpen(false)} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white text-gray-900">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 bg-white text-gray-900">{editingModel ? 'Lưu' : 'Tạo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Color Management Modal */}
      {colorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setColorModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-200 p-6 max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quản lý màu sắc</h3>
              <button onClick={() => setColorModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Add new color form */}
            {!editingColor && (
              <form onSubmit={submitColor} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Thêm màu mới</h4>
                <div className="flex gap-3">
                  <input
                    value={colorForm.colorName}
                    onChange={(e) => setColorForm(v => ({ ...v, colorName: e.target.value }))}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
                    placeholder="Tên màu (VD: Đỏ, Xanh Dương, Trắng Ngọc Trai)"
                    required
                  />
                  <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition bg-white text-gray-900">
                    Thêm
                  </button>
                </div>
              </form>
            )}

            {/* List of colors */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Danh sách màu ({colors.length})
              </h4>
              {colors.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Chưa có màu nào. Thêm màu đầu tiên!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {colors.map((c) => (
                    <div key={c.colorId} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:shadow-md transition">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 border-2 border-white shadow"></div>
                        <span className="font-medium text-gray-900">{c.colorName}</span>
                      </div>
                      <button
                        onClick={() => removeColor(c.colorId)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-600"
                        title="Xóa màu"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalOpen && viewingModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetailModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-200 max-h-[90vh] overflow-y-auto m-4">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-6 rounded-t-2xl bg-white text-gray-900">
              <div className="flex items-start justify-between">
                <div className="text-white">
                  <h2 className="text-2xl font-bold">{viewingModel.modelName}</h2>
                  <p className="text-emerald-100 mt-1">{viewingModel.bodyType} • {viewingModel.modelYear}</p>
                  <p className="text-3xl font-bold mt-3">
                    {viewingModel.price ? `${Number(viewingModel.price).toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                  </p>
                </div>
                <button 
                  onClick={() => setDetailModalOpen(false)} 
                  className="p-2 rounded-lg hover:bg-white/20 transition text-white"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Specifications Grid */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Dung lượng pin</div>
                    <div className="text-lg font-semibold text-gray-900">{viewingModel.batteryCapacity || '—'} kWh</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Tầm hoạt động</div>
                    <div className="text-lg font-semibold text-gray-900">{viewingModel.range || '—'} km</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Công suất</div>
                    <div className="text-lg font-semibold text-gray-900">{viewingModel.powerHp || '—'} HP</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Mô-men xoắn</div>
                    <div className="text-lg font-semibold text-gray-900">{viewingModel.torqueNm || '—'} Nm</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Tăng tốc 0-100</div>
                    <div className="text-lg font-semibold text-gray-900">{viewingModel.acceleration || '—'} giây</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Số chỗ ngồi</div>
                    <div className="text-lg font-semibold text-gray-900">{viewingModel.seatingCapacity || '—'} người</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {viewingModel.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 leading-relaxed">{viewingModel.description}</p>
                  </div>
                </div>
              )}

              {/* Available Colors */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Màu sắc có sẵn ({modelColorsMap[viewingModel.modelId]?.length || 0})
                </h3>
                {(!modelColorsMap[viewingModel.modelId] || modelColorsMap[viewingModel.modelId].length === 0) ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Chưa có màu nào cho mẫu xe này</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {modelColorsMap[viewingModel.modelId].map((color) => (
                      <div key={color.colorId} className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 border-4 border-white shadow-lg mb-3"></div>
                        <div className="font-medium text-gray-900">{color.colorName}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button 
                  onClick={() => {
                    setDetailModalOpen(false);
                    openEditModel(viewingModel);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition font-medium bg-white text-gray-900"
                >
                  Chỉnh sửa thông tin
                </button>
                <button 
                  onClick={() => setDetailModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium bg-white text-gray-900"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;