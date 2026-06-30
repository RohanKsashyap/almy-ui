import React, { useState, useEffect } from 'react';
import {
  X,
  Tag,
  FileText,
  LayoutGrid,
  Upload,
  Link as LinkIcon,
  Hash,
  Plus,
  Trash2,
  Navigation,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { Category } from '../../services/adminService';

interface SubCategoryForm {
  _id?: string;
  name: string;
  slug: string;
  link: string;
  displayOrder: number;
  isActive: boolean;
}

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  initialCategory?: Category;
  onAddSubCategory?: (categoryId: string, data: SubCategoryForm) => Promise<void>;
  onUpdateSubCategory?: (categoryId: string, subId: string, data: Partial<SubCategoryForm>) => Promise<void>;
  onDeleteSubCategory?: (categoryId: string, subId: string) => Promise<void>;
}

export default function CategoryManagementModal({
  isOpen,
  onClose,
  onSave,
  initialCategory,
  onAddSubCategory,
  onUpdateSubCategory,
  onDeleteSubCategory
}: CategoryManagementModalProps) {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    link: '',
    displayOrder: 0,
    isActive: true,
    showInNav: true
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [subCatForm, setSubCatForm] = useState<SubCategoryForm>({
    name: '',
    slug: '',
    link: '',
    displayOrder: 0,
    isActive: true
  });
  const [subCategories, setSubCategories] = useState<SubCategoryForm[]>([]);
  const [showSubCatSection, setShowSubCatSection] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  useEffect(() => {
    if (initialCategory) {
      setForm({
        name: initialCategory.name || '',
        slug: initialCategory.slug || '',
        description: initialCategory.description || '',
        link: initialCategory.link || '',
        displayOrder: initialCategory.displayOrder || 0,
        isActive: initialCategory.isActive ?? true,
        showInNav: initialCategory.showInNav ?? true
      });
      setPreview(initialCategory.imageUrl || '');
      setSubCategories(
        (initialCategory.subCategories || []).map((s) => ({
          _id: s._id,
          name: s.name,
          slug: s.slug,
          link: s.link || '',
          displayOrder: s.displayOrder,
          isActive: s.isActive
        }))
      );
    } else {
      setForm({ name: '', slug: '', description: '', link: '', displayOrder: 0, isActive: true, showInNav: true });
      setPreview('');
      setSubCategories([]);
    }
    setFile(null);
    setSubCatForm({ name: '', slug: '', link: '', displayOrder: 0, isActive: true });
    setEditingSubId(null);
  }, [initialCategory, isOpen]);

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    setForm((prev) => ({ ...prev, name, slug: initialCategory ? prev.slug : slug }));
  };

  const handleSubNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    setSubCatForm((prev) => ({ ...prev, name, slug: editingSubId ? prev.slug : slug }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('slug', form.slug);
    formData.append('description', form.description);
    formData.append('link', form.link);
    formData.append('displayOrder', String(form.displayOrder));
    formData.append('isActive', String(form.isActive));
    formData.append('showInNav', String(form.showInNav));
    if (file) formData.append('image', file);
    onSave(formData);
  };

  const handleAddSubCat = async () => {
    if (!subCatForm.name.trim()) return;
    if (initialCategory && onAddSubCategory) {
      await onAddSubCategory(initialCategory._id, subCatForm);
    } else {
      // Local state only (new category not yet saved)
      setSubCategories((prev) => [...prev, { ...subCatForm, _id: `temp-${Date.now()}` }]);
    }
    setSubCatForm({ name: '', slug: '', link: '', displayOrder: 0, isActive: true });
    setEditingSubId(null);
  };

  const handleEditSubCat = (sub: SubCategoryForm) => {
    setEditingSubId(sub._id || null);
    setSubCatForm({ ...sub });
  };

  const handleUpdateSubCat = async () => {
    if (!subCatForm.name.trim() || !editingSubId) return;
    if (initialCategory && onUpdateSubCategory) {
      await onUpdateSubCategory(initialCategory._id, editingSubId, subCatForm);
    } else {
      setSubCategories((prev) =>
        prev.map((s) => (s._id === editingSubId ? { ...subCatForm, _id: editingSubId } : s))
      );
    }
    setSubCatForm({ name: '', slug: '', link: '', displayOrder: 0, isActive: true });
    setEditingSubId(null);
  };

  const handleDeleteSubCat = async (subId: string) => {
    if (initialCategory && onDeleteSubCategory) {
      await onDeleteSubCategory(initialCategory._id, subId);
    } else {
      setSubCategories((prev) => prev.filter((s) => s._id !== subId));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-fadeIn" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-slideUp max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {initialCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <p className="text-gray-400 text-sm font-medium mt-0.5">
              Organize your product catalog with collections.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="p-8 overflow-y-auto">
          <form id="category-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Image */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-900">Category Image</label>
                <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-100 transition-all relative overflow-hidden group flex flex-col items-center justify-center gap-2">
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
                        <Upload size={20} className="text-red-500" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-gray-400">Upload Image</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Category Name</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      required
                      className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-red-200 outline-none"
                      placeholder="e.g. Occasions"
                      value={form.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Slug</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      required
                      className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-red-200 outline-none"
                      placeholder="occasions"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Nav Link (optional)</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-red-200 outline-none"
                      placeholder="/shop?category=occasions"
                      value={form.link}
                      onChange={(e) => setForm({ ...form, link: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Display Order</label>
                  <div className="relative">
                    <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-red-200 outline-none"
                      placeholder="0"
                      value={form.displayOrder}
                      onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Description</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 text-gray-400" size={18} />
                <textarea
                  className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-red-200 outline-none h-20 resize-none"
                  placeholder="Enter category description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${form.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                    <LayoutGrid size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Active</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {form.isActive ? 'Visible' : 'Hidden'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${form.showInNav ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                    <Navigation size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Show in Nav</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {form.showInNav ? 'In navbar' : 'Hidden'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={form.showInNav}
                    onChange={(e) => setForm({ ...form, showInNav: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>

            {/* Subcategories Section (only for existing categories) */}
            {initialCategory && (
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowSubCatSection(!showSubCatSection)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-bold text-gray-900">
                    Subcategories ({subCategories.length})
                  </span>
                  {showSubCatSection ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>

                {showSubCatSection && (
                  <div className="p-5 space-y-4">
                    {/* Existing subcategories */}
                    {subCategories.length > 0 && (
                      <div className="space-y-2">
                        {subCategories.map((sub) => (
                          <div key={sub._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sub.isActive ? 'bg-green-400' : 'bg-gray-300'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{sub.name}</p>
                              <p className="text-xs text-gray-400 truncate">{sub.link || `/shop?sub=${sub.slug}`}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleEditSubCat(sub)}
                              className="text-xs text-blue-500 hover:text-blue-700 font-medium px-2"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => sub._id && handleDeleteSubCat(sub._id)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add / Edit subcategory form */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3">
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                        {editingSubId ? 'Edit Subcategory' : 'Add Subcategory'}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">Name *</label>
                          <input
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                            placeholder="e.g. Birthday Parties"
                            value={subCatForm.name}
                            onChange={(e) => handleSubNameChange(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">Slug</label>
                          <input
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                            placeholder="birthday-parties"
                            value={subCatForm.slug}
                            onChange={(e) => setSubCatForm({ ...subCatForm, slug: e.target.value })}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">Link (optional)</label>
                          <input
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                            placeholder="/shop?type=birthday"
                            value={subCatForm.link}
                            onChange={(e) => setSubCatForm({ ...subCatForm, link: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">Display Order</label>
                          <input
                            type="number"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                            value={subCatForm.displayOrder}
                            onChange={(e) => setSubCatForm({ ...subCatForm, displayOrder: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="flex items-end pb-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={subCatForm.isActive}
                              onChange={(e) => setSubCatForm({ ...subCatForm, isActive: e.target.checked })}
                              className="w-4 h-4 accent-blue-500"
                            />
                            <span className="text-sm text-gray-700 font-medium">Active</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {editingSubId && (
                          <button
                            type="button"
                            onClick={() => { setEditingSubId(null); setSubCatForm({ name: '', slug: '', link: '', displayOrder: 0, isActive: true }); }}
                            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={editingSubId ? handleUpdateSubCat : handleAddSubCat}
                          disabled={!subCatForm.name.trim()}
                          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                        >
                          <Plus size={15} />
                          {editingSubId ? 'Update' : 'Add Subcategory'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-8 py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl text-sm font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-8 py-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-red-200"
              >
                {initialCategory ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
