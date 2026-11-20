import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import { Search, ArrowUpDown, Store, Star, Edit3, Plus, CheckCircle, AlertCircle, X } from 'lucide-react';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);

  // Rating Modal state
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stores', {
        params: { search, sortBy, sortOrder }
      });
      setStores(res.data.stores);
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStores();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const openRatingModal = (store) => {
    setSelectedStore(store);
    setRatingValue(store.user_rating || 5);
    setMessage({ text: '', type: '' });
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStore) return;

    try {
      setIsSubmitting(true);
      await api.post('/ratings', {
        storeId: selectedStore.id,
        rating: ratingValue
      });
      setMessage({ text: 'Rating submitted successfully!', type: 'success' });
      fetchStores();
      setTimeout(() => {
        setSelectedStore(null);
      }, 1200);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to submit rating.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />

      <main className="container">
        {/* Header section */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            Registered Stores
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: 4 }}>
            Explore stores, view customer ratings, and share your own rating (1 to 5 stars).
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="card" style={{ marginBottom: 24, padding: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="Search by store name or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Sort by:</span>
              <button
                className={`btn btn-sm ${sortBy === 'name' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => toggleSort('name')}
              >
                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                className={`btn btn-sm ${sortBy === 'overallRating' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => toggleSort('overallRating')}
              >
                Rating {sortBy === 'overallRating' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                className={`btn btn-sm ${sortBy === 'address' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => toggleSort('address')}
              >
                Address {sortBy === 'address' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>
        </div>

        {/* Store Grid / Listing */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            Loading stores...
          </div>
        ) : stores.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <Store size={48} style={{ color: '#cbd5e1', marginBottom: 12 }} />
            <h3 style={{ fontSize: '1.2rem', color: '#334155', fontWeight: 700 }}>No Stores Found</h3>
            <p style={{ fontSize: '0.9rem', marginTop: 6 }}>
              {search ? 'Try adjusting your search query.' : 'No stores registered yet.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {stores.map((store) => (
              <div key={store.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                      {store.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fef3c7', padding: '4px 8px', borderRadius: 8 }}>
                      <Star size={16} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#92400e' }}>
                        {parseFloat(store.overall_rating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: 16, minHeight: 40 }}>
                    {store.address}
                  </p>

                  <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, marginBottom: 16, border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Overall Rating:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <StarRating rating={Math.round(store.overall_rating || 0)} readOnly size={16} />
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({store.total_ratings} reviews)</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Your Rating:</span>
                      {store.user_rating ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#4f46e5', fontWeight: 700, fontSize: '0.85rem' }}>
                          <Star size={16} fill="#4f46e5" color="#4f46e5" />
                          <span>{store.user_rating} / 5</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          Not rated yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating Button */}
                <div>
                  {store.user_rating ? (
                    <button
                      className="btn btn-secondary"
                      style={{ width: '100%' }}
                      onClick={() => openRatingModal(store)}
                    >
                      <Edit3 size={16} />
                      <span>Modify Submitted Rating</span>
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => openRatingModal(store)}
                    >
                      <Plus size={16} />
                      <span>Submit a Rating</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rating Submission / Edit Modal */}
        {selectedStore && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    {selectedStore.user_rating ? 'Modify Rating' : 'Rate Store'}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: 2 }}>
                    {selectedStore.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStore(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {message.text && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: '0.88rem',
                  background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  color: message.type === 'success' ? '#065f46' : '#b91c1c',
                  border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                }}>
                  {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handleRatingSubmit}>
                <div style={{ textAlign: 'center', padding: '24px 0', background: '#f8fafc', borderRadius: 12, marginBottom: 20 }}>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b' }}>
                      {ratingValue}
                    </span>
                    <span style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: 600 }}> / 5</span>
                  </div>

                  <StarRating
                    rating={ratingValue}
                    onRate={(val) => setRatingValue(val)}
                    size={36}
                  />

                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 12 }}>
                    Click on the stars above to select your rating (1 to 5)
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedStore(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : selectedStore.user_rating ? 'Update Rating' : 'Submit Rating'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
