import React, { useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,

  Edit2,
  Trash2,
  UserPlus,
  CheckCircle,
  XCircle,
  AlertCircle } from
'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

// Mock Data
const initialUsers = [
{ id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Donor', status: 'Active', joined: '2023-01-15' },
{ id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Admin', status: 'Active', joined: '2023-02-20' },
{ id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Volunteer', status: 'Inactive', joined: '2023-03-10' },
{ id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'Donor', status: 'Active', joined: '2023-04-05' },
{ id: 5, name: 'Evan Wright', email: 'evan@example.com', role: 'Donor', status: 'Pending', joined: '2023-05-12' },
{ id: 6, name: 'Fiona Green', email: 'fiona@example.com', role: 'Volunteer', status: 'Active', joined: '2023-06-18' },
{ id: 7, name: 'George Hall', email: 'george@example.com', role: 'Donor', status: 'Banned', joined: '2023-07-22' }];


import { toast } from 'sonner';

export default function UsersPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t('users', 'Users'));
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const isRtl = i18n.dir() === 'rtl';

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDelete = (id) => {
    if (confirm(t('delete_user_confirm', 'Are you sure you want to delete this user?'))) {
      setUsers(users.filter((u) => u.id !== id));
      toast.success(t('user_deleted', 'User deleted successfully'));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newUser = {
      id: editingUser ? editingUser.id : users.length + 1,
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      status: formData.get('status'),
      joined: editingUser ? editingUser.joined : new Date().toISOString().split('T')[0]
    };

    if (editingUser) {
      setUsers(users.map((u) => u.id === newUser.id ? newUser : u));
    } else {
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
    toast.success(t('user_saved', 'User saved successfully'));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('manage_users', 'Users Management')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('manage_users_desc', 'Manage users, roles, and permissions.')}</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          
          <UserPlus size={16} />
          {t('add_new_user', 'Add New User')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className={clsx("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400", isRtl ? "right-3" : "left-3")} />
          <input
            type="text"
            placeholder={t('search_users', 'Search by name or email...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={clsx(
              "w-full py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent",
              isRtl ? "pr-10 pl-4" : "pl-10 pr-4"
            )} />
          
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2">
            
            <option value="All">{t('all_roles', 'All Roles')}</option>
            <option value="Admin">{t('admin', 'Admin')}</option>
            <option value="Donor">{t('donor', 'Donor')}</option>
            <option value="Volunteer">{t('volunteer', 'Volunteer')}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className={clsx("w-full text-sm text-gray-500", isRtl ? "text-right" : "text-left")}>
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th scope="col" className={clsx("px-6 py-3", isRtl ? "text-right" : "text-left")}>{t('name', 'Name')}</th>
                <th scope="col" className={clsx("px-6 py-3", isRtl ? "text-right" : "text-left")}>{t('role', 'Role')}</th>
                <th scope="col" className={clsx("px-6 py-3", isRtl ? "text-right" : "text-left")}>{t('status', 'Status')}</th>
                <th scope="col" className={clsx("px-6 py-3", isRtl ? "text-right" : "text-left")}>{t('joined', 'Joined')}</th>
                <th scope="col" className={clsx("px-6 py-3", isRtl ? "text-left" : "text-right")}>{t('actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ?
              filteredUsers.map((user) =>
              <tr key={user.id} className="bg-white border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                    user.role === 'Admin' ? "bg-purple-50 text-purple-700 border-purple-100" :
                    user.role === 'Donor' ? "bg-blue-50 text-blue-700 border-blue-100" :
                    "bg-amber-50 text-amber-700 border-amber-100"
                  )}>
                        {t(user.role.toLowerCase(), user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {user.status === 'Active' && <CheckCircle size={14} className="text-green-500" />}
                        {user.status === 'Inactive' && <XCircle size={14} className="text-gray-400" />}
                        {user.status === 'Pending' && <AlertCircle size={14} className="text-amber-500" />}
                        {user.status === 'Banned' && <XCircle size={14} className="text-red-500" />}
                        <span className={clsx(
                      "text-xs font-medium",
                      user.status === 'Active' ? "text-green-700" :
                      user.status === 'Inactive' ? "text-gray-500" :
                      user.status === 'Pending' ? "text-amber-700" :
                      "text-red-700"
                    )}>
                         {t(user.status.toLowerCase(), user.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {user.joined}
                    </td>
                    <td className={clsx("px-6 py-4", isRtl ? "text-left" : "text-right")}>
                      <div className={clsx("flex items-center gap-2", isRtl ? "justify-start" : "justify-end")}>
                        <button
                      onClick={() => handleEdit(user)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      
                          <Edit2 size={16} />
                        </button>
                        <button
                      onClick={() => handleDelete(user.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
              ) :

              <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    {t('no_users_found', 'No users found matching your search.')}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        
        {/* Pagination Mock */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
           <span className="text-sm text-gray-500">{i18n.language.startsWith('ar') ?
             <span>عرض <span className="font-semibold text-gray-900">1-{filteredUsers.length}</span> من <span className="font-semibold text-gray-900">{users.length}</span></span> :
             <span>Showing <span className="font-semibold text-gray-900">1-{filteredUsers.length}</span> of <span className="font-semibold text-gray-900">{users.length}</span></span>
          }</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm border border-gray-200 rounded bg-white text-gray-400 cursor-not-allowed">{t('previous', 'Previous')}</button>
            <button className="px-3 py-1 text-sm border border-gray-200 rounded bg-white text-gray-700 hover:bg-gray-50">{t('next', 'Next')}</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen &&
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900">{editingUser ? t('edit_user', 'Edit User') : t('add_new_user', 'Add New User')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                  <XCircle size={20} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('full_name', 'Full Name')}</label>
                  <input
                  name="name"
                  defaultValue={editingUser?.name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 outline-none" />
                
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('email', 'Email Address')}</label>
                  <input
                  name="email"
                  type="email"
                  defaultValue={editingUser?.email}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 outline-none" />
                
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('role', 'Role')}</label>
                    <select
                    name="role"
                    defaultValue={editingUser?.role || 'Donor'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 outline-none">
                    
                      <option value="Admin">{t('admin', 'Admin')}</option>
                      <option value="Donor">{t('donor', 'Donor')}</option>
                      <option value="Volunteer">{t('volunteer', 'Volunteer')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('status', 'Status')}</label>
                    <select
                    name="status"
                    defaultValue={editingUser?.status || 'Active'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 outline-none">
                    
                      <option value="Active">{t('active', 'Active')}</option>
                      <option value="Inactive">{t('inactive', 'Inactive')}</option>
                      <option value="Pending">{t('pending', 'Pending')}</option>
                      <option value="Banned">{t('banned', 'Banned')}</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  
                    {t('cancel', 'Cancel')}
                  </button>
                  <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-700 rounded-lg hover:bg-red-800">
                  
                    {t('save_changes', 'Save Changes')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

}