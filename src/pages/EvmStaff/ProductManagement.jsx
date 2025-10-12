import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllModelsThunk,
  createModelThunk,
  updateModelThunk,
  deleteModelThunk,
  getColorsByModelNameThunk,
} from '@store/slices/modelSlice';
import {
  getAllColorsThunk,
  createColorThunk,
  updateColorThunk,
  deleteColorThunk,
} from '@store/slices/colorSlice';
import seedText from '../../../abc.txt?raw';

function ProductManagement({ onBack }) {
  const dispatch = useDispatch();
  const { items: models, colorsOfSelectedModel, status: modelStatus } = useSelector((s) => s.models);
  const { items: colors, status: colorStatus } = useSelector((s) => s.colors);

  const [activeTab, setActiveTab] = useState('models');
  const [successMsg, setSuccessMsg] = useState('');

  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);

  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState(null);

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
  const [colorForm, setColorForm] = useState({ colorName: '' });

  useEffect(() => {
    dispatch(getAllModelsThunk());
    dispatch(getAllColorsThunk());
  }, [dispatch]);

  const seedModels = useMemo(() => {
    try {
      const parsed = JSON.parse(seedText);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [seedText]);

  const seedDataToApi = async () => {
    if (!seedModels.length) return alert('Không tìm thấy dữ liệu mẫu');
    if (!confirm(`Nạp ${seedModels.length} mẫu xe vào hệ thống?`)) return;
    try {
      for (const m of seedModels) {
        // backend expects the same property names as swagger
        await dispatch(createModelThunk(m)).unwrap();
      }
      setSuccessMsg('Đã nạp dữ liệu mẫu');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      alert(err?.message || 'Nạp dữ liệu thất bại');
    }
  };

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

  const fetchColorsForModel = (modelName) => {
    dispatch(getColorsByModelNameThunk(modelName));
  };

  return (
    <div className="px-6 space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-600 mt-1">Quản lý mẫu xe và màu sắc theo Redux</p>
        </div>
        {onBack && (
          <button onClick={onBack} className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Quay lại
          </button>
        )}
      </div>

      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 text-sm">{successMsg}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'models', name: 'Mẫu xe', icon: '🚗' },
              { id: 'colors', name: 'Màu sắc', icon: '🎨' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === tab.id ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <span className="mr-2">{tab.icon}</span>{tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'models' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách mẫu xe</h3>
                <div className="flex gap-2">
                  <button onClick={seedDataToApi} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition">Nạp dữ liệu mẫu</button>
                  <button onClick={openCreateModel} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">Thêm mẫu xe</button>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
                <table className="min-w-[1200px] w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên mẫu</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Năm</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pin (kWh)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tầm hoạt động (km)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Công suất (hp)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô-men (Nm)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">0-100 (s)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chỗ ngồi</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kiểu dáng</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                      <th className="px-4 py-3"/>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {modelStatus === 'loading' && (
                      <tr><td className="px-4 py-4 text-sm text-gray-500" colSpan={12}>Đang tải...</td></tr>
                    )}
                    {models.map((m) => (
                      <tr key={m.modelId || m.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{m.modelName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{m.modelYear || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{m.batteryCapacity ?? m.battery_capacity ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{m.range ?? m.range_km ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{m.powerHp ?? m.power_hp ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{m.torqueNm ?? m.torque_nm ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{m.acceleration ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{m.seatingCapacity ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{m.price?.toLocaleString?.('vi-VN') || m.price || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{m.bodyType || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate" title={m.description}>{m.description || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                          <button onClick={() => fetchColorsForModel(m.modelName)} className="text-blue-600 hover:text-blue-800 mr-3">Màu</button>
                          <button onClick={() => openEditModel(m)} className="text-emerald-600 hover:text-emerald-800 mr-3">Sửa</button>
                          <button onClick={() => removeModel(m.modelId)} className="text-red-600 hover:text-red-800">Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Colors of selected model */}
              {colorsOfSelectedModel?.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="text-sm text-gray-700 mb-2">Màu của mẫu đã chọn:</div>
                  <div className="flex flex-wrap gap-2">
                    {colorsOfSelectedModel.map((c, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">{c.colorName || c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách màu sắc</h3>
                <button onClick={openCreateColor} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">Thêm màu</button>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên màu</th>
                      <th className="px-4 py-3"/>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {colorStatus === 'loading' && (
                      <tr><td className="px-4 py-4 text-sm text-gray-500" colSpan={2}>Đang tải...</td></tr>
                    )}
                    {colors.map((c) => (
                      <tr key={c.colorId || c.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{c.colorName}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                          <button onClick={() => openEditColor(c)} className="text-emerald-600 hover:text-emerald-800 mr-3">Sửa</button>
                          <button onClick={() => removeColor(c.colorId)} className="text-red-600 hover:text-red-800">Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Model modal */}
      {modelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModelModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{editingModel ? 'Cập nhật' : 'Thêm'} mẫu xe</h3>
              <button onClick={() => setModelModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100"><svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <form onSubmit={submitModel} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên mẫu</label>
                <input value={modelForm.modelName} onChange={(e) => setModelForm(v => ({ ...v, modelName: e.target.value }))} className="w-full border rounded-xl px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Năm</label>
                <input type="number" value={modelForm.modelYear} onChange={(e) => setModelForm(v => ({ ...v, modelYear: Number(e.target.value) }))} className="w-full border rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dung lượng pin (kWh)</label>
                <input type="number" value={modelForm.batteryCapacity} onChange={(e) => setModelForm(v => ({ ...v, batteryCapacity: Number(e.target.value) }))} className="w-full border rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tầm hoạt động (km)</label>
                <input type="number" value={modelForm.range} onChange={(e) => setModelForm(v => ({ ...v, range: Number(e.target.value) }))} className="w-full border rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Công suất (hp)</label>
                <input type="number" value={modelForm.powerHp} onChange={(e) => setModelForm(v => ({ ...v, powerHp: Number(e.target.value) }))} className="w-full border rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô-men xoắn (Nm)</label>
                <input type="number" value={modelForm.torqueNm} onChange={(e) => setModelForm(v => ({ ...v, torqueNm: Number(e.target.value) }))} className="w-full border rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tăng tốc 0-100 (s)</label>
                <input type="number" step="0.1" value={modelForm.acceleration} onChange={(e) => setModelForm(v => ({ ...v, acceleration: Number(e.target.value) }))} className="w-full border rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số chỗ ngồi</label>
                <input type="number" value={modelForm.seatingCapacity} onChange={(e) => setModelForm(v => ({ ...v, seatingCapacity: Number(e.target.value) }))} className="w-full border rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
                <input type="number" value={modelForm.price} onChange={(e) => setModelForm(v => ({ ...v, price: Number(e.target.value) }))} className="w-full border rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kiểu dáng</label>
                <input value={modelForm.bodyType} onChange={(e) => setModelForm(v => ({ ...v, bodyType: e.target.value }))} className="w-full border rounded-xl px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea value={modelForm.description} onChange={(e) => setModelForm(v => ({ ...v, description: e.target.value }))} className="w-full border rounded-xl px-3 py-2" rows={3} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModelModalOpen(false)} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">{editingModel ? 'Lưu' : 'Tạo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Color modal */}
      {colorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setColorModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{editingColor ? 'Cập nhật' : 'Thêm'} màu</h3>
              <button onClick={() => setColorModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100"><svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <form onSubmit={submitColor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên màu</label>
                <input value={colorForm.colorName} onChange={(e) => setColorForm(v => ({ ...v, colorName: e.target.value }))} className="w-full border rounded-xl px-3 py-2" required />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setColorModalOpen(false)} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">{editingColor ? 'Lưu' : 'Tạo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;