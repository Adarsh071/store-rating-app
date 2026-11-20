import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import {
  Users, Store, Star, Plus, Search, Filter, ArrowUpDown,
  CheckCircle, AlertCircle, Eye, X, ArrowUp, ArrowDown
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [activeTab, setActiveTab] = useState('stores'); // 'stores' or 'users'

  // Stores State
  const [stores, setStores] = useState([]);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeFilterName, setStoreFilterName] = useState('');
  const [storeFilterEmail, setStoreFilterEmail] = useState('');
  const [storeFilterAddress, setStoreFilterAddress] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('name');
  const [storeSortOrder, setStoreSortOrder] = useState('asc');

  // Users State
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userFilterName, setUserFilterName] = useState('');
  const [userFilterEmail, setUserFilterEmail] = useState('');
  const [userFilterAddress, setUserFilterAddress] = useState('');
  const [userFilterRole, setUserFilterRole] = useState('');
  const [userSortBy, setUserSortBy] = useState('name');
  const [userSortOrder, setUserSortOrder] = useState('asc');

  // Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);

  // Form States
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'NORMAL_USER'
  });
  const [storeForm, setStoreForm] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: ''
  });
  const [modalMessage, setModalMessage] = useState({ text: '', type: '' });
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  // Fetch Stores
  const fetchStores = async () => {
    try {
      const res = await api.get('/admin/stores', {
        params: {
          search: storeSearch,
          name: storeFilterName,
          email: storeFilterEmail,
          address: storeFilterAddress,
          sortBy: storeSortBy,
          sortOrder: storeSortOrder
        }
      });
      setStores(res.data.stores);
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', {
        params: {
          search: userSearch,
          name: userFilterName,
          email: userFilterEmail,
          address: userFilterAddress,
          role: userFilterRole,
          sortBy: userSortBy,
          sortOrder: userSortOrder
        }
      });
      setUsersList(res.data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStores();
    }, 200);
    return () => clearTimeout(timer);
  }, [storeSearch, storeFilterName, storeFilterEmail, storeFilterAddress, storeSortBy, storeSortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 200);
    return () => clearTimeout(timer);
  }, [userSearch, userFilterName, userFilterEmail, userFilterAddress, userFilterRole, userSortBy, userSortOrder]);

  const toggleStoreSort = (field) => {
    if (storeSortBy === field) {
      setStoreSortOrder(storeSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setStoreSortBy(field);
      setStoreSortOrder('asc');
    }
  };

  const toggleUserSort = (field) => {
    if (userSortBy === field) {
      setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setUserSortBy(field);
      setUserSortOrder('asc');
    }
  };

  // Add User Submission
  const handleAddUser = async (e) => {
    e.preventDefault();
    setModalMessage({ text: '', type: '' });

    if (userForm.name.trim().length < 20 || userForm.name.trim().length > 60) {
      setModalMessage({ text: 'Name must be between 20 and 60 characters.', type: 'error' });
      return;
    }
    if (userForm.password.length < 8 || userForm.password.length > 16) {
      setModalMessage({ text: 'Password must be 8-16 characters.', type: 'error' });
      return;
    }
    const hasUpperCase = /[A-Z]/.test(userForm.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(userForm.password);
    if (!hasUpperCase || !hasSpecialChar) {
      setModalMessage({ text: 'Password must contain at least 1 uppercase and 1 special character.', type: 'error' });
      return;
    }

    try {
      setModalLoading(true);
      await api.post('/admin/users', userForm);
      setModalMessage({ text: 'User created successfully!', type: 'success' });
      setUserForm({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
      fetchUsers();
      fetchStats();
      setTimeout(() => {
        setIsAddUserModalOpen(false);
        setModalMessage({ text: '', type: '' });
      }, 1200);
    } catch (err) {
      setModalMessage({ text: err.response?.data?.message || 'Failed to create user.', type: 'error' });
    } finally {
      setModalLoading(false);
    }
  };

  // Add Store Submission
  const handleAddStore = async (e) => {
    e.preventDefault();
    setModalMessage({ text: '', type: '' });

    if (!storeForm.name || storeForm.name.length > 60) {
      setModalMessage({ text: 'Store Name is required (max 60 characters).', type: 'error' });
      return;
    }

    try {
      setModalLoading(true);
      await api.post('/admin/stores', storeForm);
      setModalMessage({ text: 'Store added successfully!', type: 'success' });
      setStoreForm({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
      fetchStats();
      setTimeout(() => {
        setIsAddStoreModalOpen(false);
        setModalMessage({ text: '', type: '' });
      }, 1200);
    } catch (err) {
      setModalMessage({ text: err.response?.data?.message || 'Failed to add store.', type: 'error' });
    } finally {
      setModalLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-admin">Admin</span>;
      case 'STORE_OWNER':
        return <span className="badge badge-owner">Store Owner</span>;
      default:
        return <span className="badge badge-user">Normal User</span>;
    }
  };

  return (
    <div>
      <Navbar />

      <main className="container">
        {/* Page Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
              System Administrator Dashboard
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: 4 }}>
              Manage users, registered stores, view ratings, and system statistics.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setModalMessage({ text: '', type: '' });
                setIsAddStoreModalOpen(true);
              }}
            >
              <Plus size={18} />
              <span>Add New Store</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setModalMessage({ text: '', type: '' });
                setIsAddUserModalOpen(true);
              }}
            >
              <Plus size={18} />
              <span>Add New User</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 18, borderLeft: '4px solid #4f46e5' }}>
            <div style={{ padding: 14, borderRadius: 14, background: '#eef2ff', color: '#4f46e5' }}>
              <Users size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Total Users
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                {stats.totalUsers}
              </h2>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 18, borderLeft: '4px solid #10b981' }}>
            <div style={{ padding: 14, borderRadius: 14, background: '#ecfdf5', color: '#10b981' }}>
              <Store size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Total Stores
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                {stats.totalStores}
              </h2>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 18, borderLeft: '4px solid #f59e0b' }}>
            <div style={{ padding: 14, borderRadius: 14, background: '#fef3c7', color: '#f59e0b' }}>
              <Star size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Total Ratings
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                {stats.totalRatings}
              </h2>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 12, borderBottom: '2px solid #e2e8f0', marginBottom: 24 }}>
          <button
            onClick={() => setActiveTab('stores')}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'none',
              fontSize: '1rem',
              fontWeight: 700,
              color: activeTab === 'stores' ? '#4f46e5' : '#64748b',
              borderBottom: activeTab === 'stores' ? '3px solid #4f46e5' : '3px solid transparent',
              marginBottom: -2,
              cursor: 'pointer'
            }}
          >
            Stores Listing ({stores.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'none',
              fontSize: '1rem',
              fontWeight: 700,
              color: activeTab === 'users' ? '#4f46e5' : '#64748b',
              borderBottom: activeTab === 'users' ? '3px solid #4f46e5' : '3px solid transparent',
              marginBottom: -2,
              cursor: 'pointer'
            }}
          >
            Users Listing ({usersList.length})
          </button>
        </div>

        {/* ===================== TAB 1: STORES ===================== */}
        {activeTab === 'stores' && (
          <div>
            {/* Filter Bar for Stores */}
            <div className="card" style={{ marginBottom: 20, padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by Name..."
                  value={storeFilterName}
                  onChange={(e) => setStoreFilterName(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by Email..."
                  value={storeFilterEmail}
                  onChange={(e) => setStoreFilterEmail(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by Address..."
                  value={storeFilterAddress}
                  onChange={(e) => setStoreFilterAddress(e.target.value)}
                />
                {(storeFilterName || storeFilterEmail || storeFilterAddress) && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setStoreFilterName('');
                      setStoreFilterEmail('');
                      setStoreFilterAddress('');
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Stores Table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => toggleStoreSort('name')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Store Name</span>
                        {storeSortBy === 'name' && (storeSortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </div>
                    </th>
                    <th className="sortable" onClick={() => toggleStoreSort('email')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Email</span>
                        {storeSortBy === 'email' && (storeSortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </div>
                    </th>
                    <th className="sortable" onClick={() => toggleStoreSort('address')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Address</span>
                        {storeSortBy === 'address' && (storeSortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </div>
                    </th>
                    <th className="sortable" onClick={() => toggleStoreSort('rating')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Rating</span>
                        {storeSortBy === 'rating' && (storeSortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </div>
                    </th>
                    <th>Total Reviews</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        No stores found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    stores.map((store) => (
                      <tr key={store.id}>
                        <td style={{ fontWeight: 600 }}>{store.name}</td>
                        <td style={{ color: '#475569' }}>{store.email}</td>
                        <td style={{ color: '#475569', maxWidth: 280 }}>{store.address}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Star size={16} fill="#f59e0b" color="#f59e0b" />
                            <span style={{ fontWeight: 700, color: '#b45309' }}>
                              {parseFloat(store.rating || 0).toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td>{store.total_ratings} ratings</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: USERS ===================== */}
        {activeTab === 'users' && (
          <div>
            {/* Filter Bar for Users */}
            <div className="card" style={{ marginBottom: 20, padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by Name..."
                  value={userFilterName}
                  onChange={(e) => setUserFilterName(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by Email..."
                  value={userFilterEmail}
                  onChange={(e) => setUserFilterEmail(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by Address..."
                  value={userFilterAddress}
                  onChange={(e) => setUserFilterAddress(e.target.value)}
                />
                <select
                  className="form-input"
                  value={userFilterRole}
                  onChange={(e) => setUserFilterRole(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">System Administrator</option>
                  <option value="NORMAL_USER">Normal User</option>
                  <option value="STORE_OWNER">Store Owner</option>
                </select>
                {(userFilterName || userFilterEmail || userFilterAddress || userFilterRole) && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setUserFilterName('');
                      setUserFilterEmail('');
                      setUserFilterAddress('');
                      setUserFilterRole('');
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Users Table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => toggleUserSort('name')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Name</span>
                        {userSortBy === 'name' && (userSortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </div>
                    </th>
                    <th className="sortable" onClick={() => toggleUserSort('email')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Email</span>
                        {userSortBy === 'email' && (userSortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </div>
                    </th>
                    <th className="sortable" onClick={() => toggleUserSort('address')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Address</span>
                        {userSortBy === 'address' && (userSortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </div>
                    </th>
                    <th className="sortable" onClick={() => toggleUserSort('role')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Role</span>
                        {userSortBy === 'role' && (userSortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </div>
                    </th>
                    <th>Store Rating</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        No users found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    usersList.map((usr) => (
                      <tr key={usr.id}>
                        <td style={{ fontWeight: 600 }}>{usr.name}</td>
                        <td style={{ color: '#475569' }}>{usr.email}</td>
                        <td style={{ color: '#475569', maxWidth: 260 }}>{usr.address}</td>
                        <td>{getRoleBadge(usr.role)}</td>
                        <td>
                          {usr.role === 'STORE_OWNER' ? (
                            usr.owner_store_rating ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#b45309', fontWeight: 700 }}>
                                <Star size={15} fill="#f59e0b" color="#f59e0b" />
                                <span>{parseFloat(usr.owner_store_rating).toFixed(1)}</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                (No ratings yet)
                              </span>
                            )
                          ) : (
                            <span style={{ color: '#cbd5e1' }}>—</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedUserDetails(usr)}
                            title="View Full Details"
                          >
                            <Eye size={15} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== MODAL: ADD NEW USER ===================== */}
        {isAddUserModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Add New User</h3>
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {modalMessage.text && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: '0.88rem',
                  background: modalMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  color: modalMessage.type === 'success' ? '#065f46' : '#b91c1c',
                  border: `1px solid ${modalMessage.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                }}>
                  {modalMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span>{modalMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleAddUser}>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="form-label">Name</label>
                    <span style={{ fontSize: '0.75rem', color: userForm.name.length >= 20 && userForm.name.length <= 60 ? '#10b981' : '#64748b' }}>
                      {userForm.name.length}/60 (min 20)
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="Min 20, max 60 characters"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="8-16 chars, 1 uppercase, 1 special char"
                    required
                  />
                  <span className="form-hint">8-16 chars, 1 uppercase, 1 special character</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-input"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <option value="NORMAL_USER">Normal User</option>
                    <option value="ADMIN">System Administrator</option>
                    <option value="STORE_OWNER">Store Owner</option>
                  </select>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="form-label">Address</label>
                    <span style={{ fontSize: '0.75rem', color: userForm.address.length > 400 ? '#ef4444' : '#64748b' }}>
                      {userForm.address.length}/400 max
                    </span>
                  </div>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={userForm.address}
                    onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                    placeholder="Complete address (max 400 characters)"
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsAddUserModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                    {modalLoading ? 'Adding...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================== MODAL: ADD NEW STORE ===================== */}
        {isAddStoreModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Add New Store</h3>
                <button
                  onClick={() => setIsAddStoreModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {modalMessage.text && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: '0.88rem',
                  background: modalMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  color: modalMessage.type === 'success' ? '#065f46' : '#b91c1c',
                  border: `1px solid ${modalMessage.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                }}>
                  {modalMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span>{modalMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleAddStore}>
                <div className="form-group">
                  <label className="form-label">Store Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={storeForm.name}
                    onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                    placeholder="e.g. Apex Hypermarket"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Store Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={storeForm.email}
                    onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                    placeholder="e.g. store@business.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Store Address</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={storeForm.address}
                    onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                    placeholder="Full physical address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Store Owner (Optional)</label>
                  <select
                    className="form-input"
                    value={storeForm.ownerId}
                    onChange={(e) => setStoreForm({ ...storeForm, ownerId: e.target.value })}
                  >
                    <option value="">No owner assigned</option>
                    {usersList
                      .filter((u) => u.role === 'STORE_OWNER')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsAddStoreModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                    {modalLoading ? 'Adding...' : 'Add Store'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================== MODAL: VIEW USER DETAILS ===================== */}
        {selectedUserDetails && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>User Details</h3>
                <button
                  onClick={() => setSelectedUserDetails(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Name</label>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>{selectedUserDetails.name}</p>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Email</label>
                  <p style={{ fontSize: '0.95rem', color: '#334155' }}>{selectedUserDetails.email}</p>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Address</label>
                  <p style={{ fontSize: '0.95rem', color: '#334155' }}>{selectedUserDetails.address}</p>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Role</label>
                  <div style={{ marginTop: 4 }}>{getRoleBadge(selectedUserDetails.role)}</div>
                </div>

                {selectedUserDetails.role === 'STORE_OWNER' && (
                  <div style={{ padding: 14, background: '#fef3c7', borderRadius: 10, border: '1px solid #fde68a' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>
                      Store Owner's Rating
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <Star size={20} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#92400e' }}>
                        {selectedUserDetails.owner_store_rating ? parseFloat(selectedUserDetails.owner_store_rating).toFixed(1) : 'No Ratings Yet'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button className="btn btn-secondary" onClick={() => setSelectedUserDetails(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
