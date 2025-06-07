import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Modal, Form } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaCamera, FaBoxOpen } from 'react-icons/fa';
import axios from 'axios';
import { auth } from '../firebase.config';
import '../styles/ProfileordersPage.css';

const ProfileordersPage = () => {
  const navigate = useNavigate();
  const { uid } = useParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const fileInputRef = useRef(null);

  // Order filter state
  const [orderFilter, setOrderFilter] = useState('Semua');

  // Autocomplete & dropdown states
  const [provinceInput, setProvinceInput] = useState('');
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');

  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');

  const [districtOptions, setDistrictOptions] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [subdistrictOptions, setSubdistrictOptions] = useState([]);
  const [selectedSubdistrict, setSelectedSubdistrict] = useState('');

  const [zipcodeOptions, setZipcodeOptions] = useState([]);
  const [selectedZipcode, setSelectedZipcode] = useState('');

  // All data for filtering
  const [allDistricts, setAllDistricts] = useState([]);
  const [allSubdistricts, setAllSubdistricts] = useState([]);
  const [allZipcodes, setAllZipcodes] = useState([]);

  const [provinceDropdownActive, setProvinceDropdownActive] = useState(false);

  const [newAddress, setNewAddress] = useState({
    street: '',
    province: '',
    province_id: '',
    city: '',
    city_id: '',
    district: '',
    district_id: '',
    subdistrict: '',
    subdistrict_id: '',
    zipCode: ''
  });

  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user
        const userRes = await axios.get(`http://localhost:4000/api/user/${uid}`);
        if (userRes.data.success) {
          setUser(userRes.data.user);
          setNewAddress({
            street: userRes.data.user.address?.street || '',
            province: userRes.data.user.address?.province || '',
            province_id: userRes.data.user.address?.province_id || '',
            city: userRes.data.user.address?.city || '',
            city_id: userRes.data.user.address?.city_id || '',
            district: userRes.data.user.address?.district || '',
            district_id: userRes.data.user.address?.district_id || '',
            subdistrict: userRes.data.user.address?.subdistrict || '',
            subdistrict_id: userRes.data.user.address?.subdistrict_id || '',
            zipCode: userRes.data.user.address?.zipCode || ''
          });
        }
        // Fetch orders from backend API
        const ordersRes = await axios.get(`http://localhost:4000/api/payment/user-orders/${uid}`);
        if (ordersRes.data.success) {
          console.log('Fetched orders:', ordersRes.data.orders);
          setOrders(ordersRes.data.orders);
        } else {
          setOrders([]);
        }
        setLoading(false);
      } catch {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };
    fetchData();
  }, [uid]);

  useEffect(() => {
    if (provinceInput.length > 1) {
      axios.get(`http://localhost:4000/api/ship/search-destination?type=province&search=${provinceInput}`)
        .then(res => {
          const filtered = res.data.filter(opt =>
            opt.name.toLowerCase().includes(provinceInput.toLowerCase())
          );
          setProvinceOptions(filtered);
        })
        .catch(() => setProvinceOptions([]));
    } else {
      setProvinceOptions([]);
    }
  }, [provinceInput]);

  useEffect(() => {
    if (selectedProvince) {
      axios.get(`http://localhost:4000/api/ship/cities-by-province?province=${selectedProvince}`)
        .then(res => {
          setCityOptions(res.data.cities);
          setAllDistricts(res.data.districts);
          setAllSubdistricts(res.data.subdistricts);
          setAllZipcodes(res.data.zipcodes);
          setSelectedCity('');
          setSelectedDistrict('');
          setSelectedSubdistrict('');
          setSelectedZipcode('');
          setDistrictOptions([]);
          setSubdistrictOptions([]);
          setZipcodeOptions([]);
        })
        .catch(() => {
          setCityOptions([]);
          setAllDistricts([]);
          setAllSubdistricts([]);
          setAllZipcodes([]);
        });
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedCity) {
      const cityObj = cityOptions.find(c => c.id === selectedCity);
      const filteredDistricts = allDistricts.filter(d => d.city_name === cityObj?.name);
      setDistrictOptions(filteredDistricts);
    } else {
      setDistrictOptions([]);
      setSelectedDistrict('');
    }
  }, [selectedCity, cityOptions, allDistricts]);

  useEffect(() => {
    if (selectedDistrict) {
      const districtObj = districtOptions.find(d => d.id === selectedDistrict);
      const filteredSubdistricts = allSubdistricts.filter(s => s.district_name === districtObj?.name);
      setSubdistrictOptions(filteredSubdistricts);
    } else {
      setSubdistrictOptions([]);
      setSelectedSubdistrict('');
    }
  }, [selectedDistrict, districtOptions, allSubdistricts]);

  useEffect(() => {
    if (selectedSubdistrict) {
      const subdistrictObj = subdistrictOptions.find(s => s.id === selectedSubdistrict);
      const filteredZipcodes = allZipcodes.filter(z => z.subdistrict_name === subdistrictObj?.name);
      setZipcodeOptions(filteredZipcodes);
      setSelectedZipcode('');
    }
  }, [selectedSubdistrict, subdistrictOptions, allZipcodes]);

  const handleChangePassword = () => {
    navigate(`/${uid}/forgot-password`);
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('role');
    navigate('/');
  };

  const handleAddressUpdate = async () => {
    try {
      const cityName = cityOptions.find(c => c.id === selectedCity)?.name || '';
      const districtName = districtOptions.find(d => d.id === selectedDistrict)?.name || '';
      const subdistrictName = subdistrictOptions.find(s => s.id === selectedSubdistrict)?.name || '';
      const zipCodeName = zipcodeOptions.find(z => z.id === selectedZipcode)?.name || '';

      const updatedAddress = {
        ...newAddress,
        province: selectedProvince,
        city: cityName,
        district: districtName,
        subdistrict: subdistrictName,
        zipCode: zipCodeName
      };

      const response = await axios.put(`http://localhost:4000/api/user/${uid}/update-address`, {
        address: updatedAddress
      });

      if (response.data.success) {
        setUser(prev => ({
          ...prev,
          address: updatedAddress
        }));
        setShowAddressModal(false);
      }
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Failed to update address');
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImageLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.put(
        `http://localhost:4000/api/user/${uid}/profile-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setUser(prev => ({
          ...prev,
          profileImage: response.data.profileImage
        }));
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      alert(`Failed to update profile image: ${error.response?.data?.message || error.message}`);
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest('.dropdown-autocomplete')) {
        setProvinceOptions([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="profile-page d-flex justify-content-center align-items-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page d-flex justify-content-center align-items-center">
        <div className="text-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Container className="profile-container text-center py-5">
        {/* Profile Image */}
        <div className="profile-image-section mb-4">
          <div className="profile-image-wrapper mx-auto position-relative">
            <div className="profile-image rounded-circle d-flex align-items-center justify-content-center overflow-hidden">
              {imageLoading ? (
                <div className="spinner-border text-warning" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt="Profile" 
                  className="w-100 h-100 object-fit-cover"
                />
              ) : (
                <FaUser className="profile-icon" />
              )}
            </div>
            <button 
              className="edit-profile-btn"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <FaCamera size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="d-none"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="profile-nav mb-4">
          <Link to={`/${uid}/profile`}>
            <Button variant="outline-primary" className="nav-btn mx-2">
              Personal Info
            </Button>
          </Link>
          <Button variant="outline-primary" className="nav-btn active mx-2">
            Orders
          </Button>
        </div>

        {/* Order Filter Buttons */}
        <div className="order-filter-buttons mb-3 d-flex justify-content-center gap-3">
          {['Semua', 'Belum Bayar', 'Sedang Dikemas', 'Dikirim', 'Selesai'].map((status) => {
            const isActive = orderFilter === status;
            const dikirimCount = orders.filter(o => o.status.toLowerCase() === 'dikirim').length;
            return (
              <Button
                key={status}
                variant={isActive ? 'primary' : 'outline-primary'}
                className="filter-btn"
                onClick={() => setOrderFilter(status)}
              >
                {status}
                {status === 'Dikirim' && dikirimCount > 0 && (
                  <span className="badge bg-danger ms-1">{dikirimCount}</span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Orders Information */}
        <div className="profile-info">
          <div className="info-item">
            <div className="info-header">
              <FaBoxOpen className="info-icon" />
              <label>Order Status</label>
            </div>
            {orders.length === 0 ? (
              <span>No orders yet.</span>
            ) : (
              <div className="orders-scroll-list">
                {orders
                  .filter(order => {
                    const status = order.status.trim().toLowerCase();
                    console.log('Filtering order status:', status, 'with filter:', orderFilter);
                    if (orderFilter === 'Semua') return true;
                    if (orderFilter === 'Dikirim') return status === 'dikirim';
                    if (orderFilter === 'Belum Bayar') {
                      // Explicitly check for 'belum bayar' or 'unpaid' or any other variants
                      return ['belum bayar', 'unpaid', 'pending payment'].includes(status);
                    }
                    if (orderFilter === 'Sedang Dikemas') return status === 'sedang dikemas' || status === 'pending';
                    if (orderFilter === 'Selesai') return status === 'selesai';
                    return true;
                  }).map((order, idx) => (
                    <div key={idx} 
                      className="mb-3 p-2" 
                      style={{ 
                        background: '#222a4d', 
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                        ':hover': {
                          transform: 'scale(1.01)'
                        }
                      }}                      onClick={() => navigate(`/${uid}/order-receipt`, { 
                        state: {
                          items: order.items,
                          Address: order.address,
                          courier: order.courier,
                          totalAmount: order.totalAmount,
                          status: order.status,
                          orderId: order._id,
                          userId: uid
                        }
                      })}
                    >
                      <div><strong>Order ID:</strong> {order._id}</div>
                      {order.items.map((item, i) => (
                        <div key={i}>
                          <div><strong>Product:</strong> {item.product?.name || item.product}</div>
                          <div><strong>Quantity:</strong> {item.quantity}</div>
                        </div>
                      ))}                      <div>
                        <strong>Status:</strong>{' '}
                        <span className="badge bg-warning text-dark">
                          {order.status === 'pending' || order.status === 'sedang dikemas'
                            ? 'Sedang Dikemas'
                            : order.status}
                        </span>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions mt-4">
          <Button variant="outline-primary" className="change-password-btn mb-2 w-100" onClick={handleChangePassword}>
            CHANGE PASSWORD
          </Button>
          <Button variant="outline-danger" className="sign-out-btn w-100" onClick={handleSignOut}>
            SIGN OUT
          </Button>
        </div>
      </Container>

      {/* Address Edit Modal */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered>
        <Modal.Header closeButton className="modal-dark">
          <Modal.Title>Update Address</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-dark">
          <Form.Group className='mb-2'>
            <Form.Label>Street</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your street address"
              value={newAddress.street}
              onChange={e => setNewAddress(addr => ({ ...addr, street: e.target.value }))}
              className="modal-input"
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Province</Form.Label>
            <Form.Control
              type="text"
              value={provinceInput}
              onChange={e => {
                setProvinceInput(e.target.value);
                setSelectedProvince('');
                setCityOptions([]);
                setDistrictOptions([]);
                setSubdistrictOptions([]);
                setZipcodeOptions([]);
                setProvinceOptions([]);
                setProvinceDropdownActive(true);
              }}
              onFocus={() => setProvinceDropdownActive(true)}
              onBlur={() => setTimeout(() => setProvinceDropdownActive(false), 150)}
              autoComplete="off"
            />
            {provinceDropdownActive && provinceOptions.length > 0 && (
              <div className="dropdown-autocomplete">
                {provinceOptions.map(opt => (
                  <div
                    key={opt.id}
                    onMouseDown={() => {
                      setProvinceInput(opt.name);
                      setSelectedProvince(opt.name);
                      setProvinceOptions([]);
                    }}
                    className="dropdown-item"
                  >
                    {opt.name}
                  </div>
                ))}
              </div>
            )}
          </Form.Group>

          <Form.Group>
            <Form.Label>City</Form.Label>
            <Form.Select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              disabled={!selectedProvince}
            >
              <option value="">Select City</option>
              {cityOptions.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>District</Form.Label>
            <Form.Select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              disabled={!selectedCity}
            >
              <option value="">Select District</option>
              {districtOptions.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>Subdistrict</Form.Label>
            <Form.Select
              value={selectedSubdistrict}
              onChange={e => setSelectedSubdistrict(e.target.value)}
              disabled={!selectedDistrict}
            >
              <option value="">Select Subdistrict</option>
              {subdistrictOptions.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>Zip Code</Form.Label>
            <Form.Select
              value={selectedZipcode}
              onChange={e => setSelectedZipcode(e.target.value)}
              disabled={!selectedSubdistrict}
            >
              <option value="">Select Zip Code</option>
              {zipcodeOptions.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

        </Modal.Body>
        <Modal.Footer className="modal-dark">
          <Button variant="secondary" onClick={() => setShowAddressModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleAddressUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProfileordersPage;
