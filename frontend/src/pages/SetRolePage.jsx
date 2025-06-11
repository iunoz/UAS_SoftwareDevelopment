import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNavbar from '../components/AdminNavbar';
import '../styles/SetRolePage.css';

const SetRolePage = () => {
  const [users, setUsers] = useState([]);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const filteredUsers = users.filter((u) => u.role !== 'superadmin');
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  useEffect(() => { setCurrentPage(1); }, [users]);

// Helper untuk ambil idToken dari localStorage/sessionStorage
  const getToken = () => {
    const userObj = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user'))
      : sessionStorage.getItem('user')
        ? JSON.parse(sessionStorage.getItem('user'))
        : null;
    return userObj?.idToken;
  };

  useEffect(() => {
    
    // Fetch all users (hanya superadmin yang boleh akses endpoint ini)
    const fetchUsers = async () => {
      try {
        const token = getToken();
        const res = await axios.get('http://localhost:4000/api/user/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users);
      } catch (err) {
        setError('Failed to fetch users');
        console.log(err);
      }
    };
    fetchUsers();
  }, []);

  const handleSetRole = async (targetUid, newRole) => {
    setError('');
    setInfo('');
    try {
      const token = getToken();
      await axios.put(
        `http://localhost:4000/api/user/${targetUid}/set-role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInfo('Role updated!');
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === targetUid ? { ...u, role: newRole } : u
        )
      );
    } catch (err) {
      setError('Failed to update role');
      console.log(err);
    }
  };

  return (
    <div className="set-role-page">
      <AdminNavbar />
      <h1 className='admin-page-title'>SET ADMIN ROLE</h1>
      <div className="set-role-content">
        {error && <div className="error-text">{error}</div>}
        {info && <div className="info-text">{info}</div>}
        <table className="set-role-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers
              .map((user) => (
                <tr key={user.uid}>
                  <td>{user.fname} {user.lname}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    {user.role === 'admin' ? (
                        <button className="set-role-btn remove" onClick={() => handleSetRole(user.uid, 'user')}>
                          Remove Admin
                        </button>
                      ) : (
                        <button className="set-role-btn make" onClick={() => handleSetRole(user.uid, 'admin')}>
                          Make Admin
                        </button>
                      )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="pagination-container">
          <button
            className="set-role-btn"
            style={{ 
              background: '#e0c69a', 
              color: '#222d52', 
              fontWeight: 1000, 
              width: 36,
              height: 36,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              className="set-role-btn"
              style={{
                background: currentPage === idx + 1 ? '#222d52' : '#e0c69a',
                color: currentPage === idx + 1 ? '#e0c69a' : '#222d52',
                fontWeight: currentPage === idx + 1 ? 700 : 500,
                width: 36,
                height: 36,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button
            className="set-role-btn"
            style={{ 
              background: '#e0c69a', 
              color: '#222d52', 
              fontWeight: 1000, 
              width: 36,
              height: 36,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetRolePage;