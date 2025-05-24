import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SetRolePage = () => {
  const [users, setUsers] = useState([]);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

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
      <h2>Set Admin Role</h2>
      {error && <div className="error-text">{error}</div>}
      {info && <div className="info-text">{info}</div>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Current Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users
            .filter((u) => u.role !== 'superadmin')
            .map((user) => (
              <tr key={user.uid}>
                <td>{user.fname} {user.lname}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  {user.role === 'admin' ? (
                    <button onClick={() => handleSetRole(user.uid, 'user')}>
                      Remove Admin
                    </button>
                  ) : (
                    <button onClick={() => handleSetRole(user.uid, 'admin')}>
                      Make Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default SetRolePage;