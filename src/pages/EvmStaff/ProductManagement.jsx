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
import { getAllModelColorsThunk } from '@store/slices/modelColorSlice';

function ProductManagement({ onBack }) {
  const dispatch = useDispatch();
  const { items: models, colorsOfSelectedModel, status: modelStatus } = useSelector((s) => s.models);
  const { items: colors, status: colorStatus } = useSelector((s) => s.colors);

  const [activeTab, setActiveTab] = useState('models');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedColorId, setSelectedColorId] = useState('');

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
    dispatch(getAllModelColorsThunk());
  }, [dispatch]);

  const [seedModels, setSeedModels] = useState([]);
  const loadSeedIfNeeded = async () => {
    if (seedModels.length) return seedModels;
    try {
      const url = new URL('../../../abc.txt', import.meta.url).href;
      const res = await fetch(url);
      const text = await res.text();
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : [];
      setSeedModels(arr);
      return arr;
    } catch {
      setSeedModels([]);
      return [];
    }
  };

  const seedDataToApi = async () => {
    const data = await loadSeedIfNeeded();
    if (!data.length) return alert('Không tìm thấy dữ liệu mẫu');
    if (!confirm(`Nạp ${data.length} mẫu xe vào hệ thống?`)) return;
    try {
      for (const m of data) {
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

  const fetchColorsForModel = (model) => {
    if (!model) return;
    setSelectedModel(model);
    dispatch(getColorsByModelNameThunk(model.modelName));
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
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

        <div className="p-6 space-y-6">
          {/* Filters */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <input placeholder="Tìm theo tên mẫu" className="border rounded-xl px-3 py-2" onChange={() => {}} />
            <input placeholder="Lọc theo năm" type="number" className="border rounded-xl px-3 py-2" onChange={() => {}} />
            <select className="border rounded-xl px-3 py-2" onChange={() => {}}>
              <option value="">Lọc theo màu</option>
              {colors.map(c => (<option key={c.colorId} value={c.colorName}>{c.colorName}</option>))}
            </select>
            <select className="border rounded-xl px-3 py-2" onChange={() => {}}>
              <option value="">Lọc theo body type</option>
              {Array.from(new Set(models.map(m => m.bodyType).filter(Boolean))).map(bt => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
          </div>
          {activeTab === 'models' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách mẫu xe</h3>
                <div className="flex gap-2">
                  <button onClick={seedDataToApi} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition">Nạp dữ liệu mẫu</button>
                  <button onClick={openCreateModel} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">Thêm mẫu xe</button>
                </div>
              </div>
              {/* Cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {models.map((m) => (
                  <div key={m.modelId} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition">
                    <div className="h-32 bg-gradient-to-r from-emerald-50 to-gray-50"/>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-base font-semibold text-gray-900">{m.modelName}</div>
                          <div className="text-xs text-gray-500">{m.bodyType || '—'} • {m.modelYear || '—'}</div>
                        </div>
                        <div className="text-emerald-600 font-semibold">{m.price ? `${Number(m.price).toLocaleString('vi-VN')}₫` : '—'}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>Pin: <span className="font-medium text-gray-800">{m.batteryCapacity ?? '—'} kWh</span></div>
                        <div>Tầm: <span className="font-medium text-gray-800">{m.range ?? '—'} km</span></div>
                        <div>HP: <span className="font-medium text-gray-800">{m.powerHp ?? '—'}</span></div>
                        <div>0-100: <span className="font-medium text-gray-800">{m.acceleration ?? '—'} s</span></div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button onClick={() => fetchColorsForModel(m)} className="px-2 py-1 text-xs rounded-lg border border-gray-300 hover:bg-gray-50">Màu</button>
                        <button onClick={() => openEditModel(m)} className="px-2 py-1 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Sửa</button>
                        <button onClick={() => removeModel(m.modelId)} className="px-2 py-1 text-xs rounded-lg border border-red-300 text-red-700 hover:bg-red-50">Xóa</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Colors of selected model */}
              {(
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-700">
                      {selectedModel ? (
                        <span>Màu của mẫu: <span className="font-semibold">{selectedModel.modelName}</span></span>
                      ) : (
                        <span>Chọn mẫu và bấm "Màu" để xem/đổi màu</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedColorId}
                        onChange={(e) => setSelectedColorId(e.target.value)}
                        className="border rounded-lg px-2 py-1 text-sm"
                        disabled={!selectedModel}
                      >
                        <option value="" disabled>Chọn màu…</option>
                        {colors.map((c) => (
                          <option key={c.colorId || c.id} value={c.colorId || c.id}>{c.colorName}</option>
                        ))}
                      </select>
                      <button
                        onClick={async () => {
                          const colorIdNum = Number(selectedColorId);
                          if (!selectedModel?.modelId || !colorIdNum) return;
                          try {
                            await dispatch(addColorToModelThunk({ modelId: selectedModel.modelId, colorId: colorIdNum })).unwrap();
                            await dispatch(getColorsByModelNameThunk(selectedModel.modelName));
                            setSuccessMsg('Đã thêm màu cho mẫu');
                            setTimeout(() => setSuccessMsg(''), 1500);
                          } catch (err) {
                            alert(err?.message || 'Không thể thêm màu');
                          }
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm disabled:opacity-50"
                        disabled={!selectedModel || !selectedColorId}
                      >Thêm màu</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colorsOfSelectedModel?.map((c, idx) => (
                      <span key={idx} className="inline-flex items-center gap-2 px-2 py-1 text-xs bg-white border border-gray-200 text-gray-700 rounded-full shadow-sm">
                        {c.colorName || c}
                        <button
                          onClick={async () => {
                            if (!selectedModel?.modelId) return;
                            try {
                              await dispatch(removeColorFromModelThunk({ modelId: selectedModel.modelId, colorId: c.colorId || c.id })).unwrap();
                              await dispatch(getColorsByModelNameThunk(selectedModel.modelName));
                            } catch (err) {
                              alert(err?.message || 'Không thể xóa màu');
                            }
                          }}
                          title="Xóa"
                          className="hover:text-red-600"
                        >×</button>
                      </span>
                    ))}
                    {(!colorsOfSelectedModel || colorsOfSelectedModel.length === 0) && (
                      <span className="text-xs text-gray-500">Chưa có màu nào</span>
                    )}
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