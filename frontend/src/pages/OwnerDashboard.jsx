import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import { Star, Users, Store, ArrowUp, ArrowDown, Building2, Mail, MapPin } from 'lucide-react';

const OwnerDashboard = () => {
  const [data, setData] = useState({
    hasStore: false,
    message: '',
    store: null,
    averageRating: 0,
    totalRatings: 0,
    ratingsList: []
  });
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/owner/dashboard', {
        params: { sortBy, sortOrder }
      });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching owner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div>
      <Navbar />

      <main className="container">
        {/* Welcome Section */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            Store Owner Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: 4 }}>
            Monitor customer feedback, see your average rating, and track user submissions.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            Loading dashboard data...
          </div>
        ) : !data.hasStore ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <Building2 size={48} style={{ color: '#cbd5e1', marginBottom: 12 }} />
            <h3 style={{ fontSize: '1.25rem', color: '#334155', fontWeight: 700 }}>
              No Store Assigned Yet
            </h3>
            <p style={{ fontSize: '0.95rem', marginTop: 6, maxWidth: 450, margin: '6px auto 0' }}>
              Your account does not have a registered store assigned to it. Please contact the System Administrator to register and link your store.
            </p>
          </div>
        ) : (
          <div>
            {/* Store Information Banner */}
            <div className="card" style={{ marginBottom: 24, padding: 20 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Store size={22} color="#4f46e5" />
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                      {data.store.name}
                    </h2>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 8, color: '#64748b', fontSize: '0.88rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Mail size={15} /> {data.store.email}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={15} /> {data.store.address}
                    </span>
                  </div>
                </div>

                {/* Rating Highlight Pill */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  padding: '16px 24px',
                  borderRadius: 16,
                  border: '1px solid #fcd34d'
                }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>
                      Store Average Rating
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#78350f', lineHeight: 1 }}>
                        {parseFloat(data.averageRating || 0).toFixed(1)}
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#92400e' }}>/ 5.0</span>
                    </div>
                  </div>
                  <div>
                    <StarRating rating={Math.round(data.averageRating || 0)} readOnly size={22} />
                    <p style={{ fontSize: '0.8rem', color: '#92400e', marginTop: 4, fontWeight: 600 }}>
                      Based on {data.totalRatings} total {data.totalRatings === 1 ? 'rating' : 'ratings'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ratings Table Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Customer Ratings ({data.ratingsList.length})
              </h3>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Click table headers to sort
              </span>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => toggleSort('name')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>User Name</span>
                        {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </div>
                    </th>
                    <th className="sortable" onClick={() => toggleSort('email')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>User Email</span>
                        {sortBy === 'email' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </div>
                    </th>
                    <th className="sortable" onClick={() => toggleSort('address')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Address</span>
                        {sortBy === 'address' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </div>
                    </th>
                    <th className="sortable" onClick={() => toggleSort('rating')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Rating Given</span>
                        {sortBy === 'rating' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </div>
                    </th>
                    <th className="sortable" onClick={() => toggleSort('submittedAt')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Date</span>
                        {sortBy === 'submittedAt' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.ratingsList.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        No customers have submitted ratings for your store yet.
                      </td>
                    </tr>
                  ) : (
                    data.ratingsList.map((item) => (
                      <tr key={item.rating_id}>
                        <td style={{ fontWeight: 600 }}>{item.user_name}</td>
                        <td style={{ color: '#475569' }}>{item.user_email}</td>
                        <td style={{ color: '#475569', maxWidth: 280 }}>{item.user_address}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <StarRating rating={item.rating} readOnly size={16} />
                            <span style={{ fontWeight: 700, color: '#b45309', fontSize: '0.9rem' }}>
                              ({item.rating}/5)
                            </span>
                          </div>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                          {new Date(item.submitted_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;
