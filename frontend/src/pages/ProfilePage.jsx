import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Modal, Form } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaCamera } from 'react-icons/fa';
import { auth } from '../firebase.config';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import '../styles/ProfilePage.css';
import Select from 'react-select';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { uid } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const { resetCartCount } = useCart();
  const fileInputRef = useRef(null);

  // Autocomplete & dropdown states
  const [provinceInput, setProvinceInput] = useState('');
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [provinceDropdownActive, setProvinceDropdownActive] = useState(false);

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

  const COLOR_ENABLED_BG = '#222d52';      // warna aktif (sama dengan Province)
  const COLOR_DISABLED_BG = '#181e33';     // warna gelap untuk disabled
  const COLOR_ENABLED_BORDER = '#c1a139';  // border keemasan
  const COLOR_DISABLED_BORDER = '#444654'; // border gelap
  const COLOR_ENABLED_TEXT = '#e6d4b7';    // teks keemasan
  const COLOR_DISABLED_TEXT = '#888';      // teks abu-abu
  const COLOR_FOCUS_SHADOW = '#484538';     

  const getSelectCustomStyles = (enabled) => ({
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      backgroundColor: enabled ? COLOR_ENABLED_BG : COLOR_DISABLED_BG,
      color: enabled ? COLOR_ENABLED_TEXT : COLOR_DISABLED_TEXT,
      border: `1px solid ${enabled ? COLOR_ENABLED_BORDER : COLOR_DISABLED_BORDER}`,
      borderRadius: 12,
      marginTop: 0,
    }),
    control: (provided, state) => ({
      ...provided,
      backgroundColor: enabled ? COLOR_ENABLED_BG : COLOR_DISABLED_BG,
      color: enabled ? COLOR_ENABLED_TEXT : COLOR_DISABLED_TEXT,
      borderColor: enabled ? COLOR_ENABLED_BORDER : COLOR_DISABLED_BORDER,
      borderWidth: 1, // tipis
      borderRadius: 12,
      boxShadow: state.isFocused && enabled ? `0 0 0 4px ${COLOR_FOCUS_SHADOW}` : 'none',
      fontSize: '1rem',
      fontWeight: 400,
      minHeight: '48px',
      paddingLeft: 0,
      paddingRight: 0,
      opacity: enabled ? 1 : 0.7,
      transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
      '&:hover': {
        borderColor: enabled ? COLOR_ENABLED_BORDER : COLOR_DISABLED_BORDER,
      },
      cursor: enabled ? 'pointer' : 'not-allowed',
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '8px 12px',
    }),
    input: (provided) => ({
      ...provided,
      color: enabled ? COLOR_ENABLED_TEXT : COLOR_DISABLED_TEXT,
      margin: 0,
      padding: 0,
      fontSize: '1rem',
      fontWeight: 400,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: enabled ? COLOR_ENABLED_TEXT : COLOR_DISABLED_TEXT,
      fontSize: '1rem',
      fontWeight: 400,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: enabled ? 'rgb(197, 194, 194)' : '#666',
      fontSize: '1rem',
      fontWeight: 400,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? (enabled ? '#1a2238' : COLOR_DISABLED_BG)
        : (enabled ? COLOR_ENABLED_BG : COLOR_DISABLED_BG),
      color: enabled ? COLOR_ENABLED_TEXT : COLOR_DISABLED_TEXT,
      cursor: enabled ? 'pointer' : 'not-allowed',
      padding: '8px 12px',
      fontSize: '1rem',
      fontWeight: 400,
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: enabled ? COLOR_ENABLED_BORDER : COLOR_DISABLED_BORDER,
      '&:hover': {
        color: enabled ? COLOR_ENABLED_BORDER : COLOR_DISABLED_BORDER,
      },
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: enabled ? COLOR_ENABLED_BORDER : COLOR_DISABLED_BORDER,
    }),
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`https://uassoftwaredevelopment-production.up.railway.app/api/user/${uid}`);
        if (response.data.success) {
          setUser(response.data.user);
          setNewAddress({
            street: response.data.user.address?.street || '',
            province: response.data.user.address?.province || '',
            province_id: response.data.user.address?.province_id || '',
            city: response.data.user.address?.city || '',
            city_id: response.data.user.address?.city_id || '',
            district: response.data.user.address?.district || '',
            district_id: response.data.user.address?.district_id || '',
            subdistrict: response.data.user.address?.subdistrict || '',
            subdistrict_id: response.data.user.address?.subdistrict_id || '',
            zipCode: response.data.user.address?.zipCode || ''
          });
        } else {
          setError('Failed to fetch user data');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user data');
        setLoading(false);
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, [uid]);

  useEffect(() => {
    if (provinceInput.length > 1) {
      axios.get(`https://uassoftwaredevelopment-production.up.railway.app/api/ship/search-destination?type=province&search=${provinceInput}`)
        .then(res => {
          // Filter hasil agar hanya yang mengandung kata kunci secara case-insensitive
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

  // Fetch all city/district/subdistrict/zipcode when province selected
  useEffect(() => {
    if (selectedProvince) {
      axios.get(`https://uassoftwaredevelopment-production.up.railway.app/api/ship/cities-by-province?province=${selectedProvince}`)
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

  // Filter districts when city selected
  useEffect(() => {
    if (selectedCity) {
      const cityObj = cityOptions.find(c => c.id === selectedCity);
      const filteredDistricts = allDistricts.filter(d => d.city_name === cityObj?.name);
      setDistrictOptions(filteredDistricts);
      // Jangan reset selectedDistrict di sini!
    } else {
      setDistrictOptions([]);
      setSelectedDistrict('');
    }
  }, [selectedCity, cityOptions, allDistricts]);

  // Filter subdistricts when district selected
  useEffect(() => {
    if (selectedDistrict) {
      const districtObj = districtOptions.find(d => d.id === selectedDistrict);
      const filteredSubdistricts = allSubdistricts.filter(s => s.district_name === districtObj?.name);
      setSubdistrictOptions(filteredSubdistricts);
      // Jangan reset selectedSubdistrict di sini!
    } else {
      setSubdistrictOptions([]);
      setSelectedSubdistrict('');
    }
  }, [selectedDistrict, districtOptions, allSubdistricts]);

  // Filter zipcodes when subdistrict selected
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
    resetCartCount();
    navigate('/');
  };

  const handleAddressUpdate = async () => {
    try {
      // Ambil nama dari dropdown terpilih
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

      const response = await axios.put(`https://uassoftwaredevelopment-production.up.railway.app/api/user/${uid}/update-address`, {
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

      // Fix: Change endpoint from 'user' to 'users'
      const response = await axios.put(
        `https://uassoftwaredevelopment-production.up.railway.app/api/user/${uid}/profile-image`,
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
      // Add more detailed error message
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

  useEffect(() => {
    if (showAddressModal && user && user.address) {
      setNewAddress({
        street: user.address.street || '',
        province: user.address.province || '',
        province_id: user.address.province_id || '',
        city: user.address.city || '',
        city_id: user.address.city_id || '',
        district: user.address.district || '',
        district_id: user.address.district_id || '',
        subdistrict: user.address.subdistrict || '',
        subdistrict_id: user.address.subdistrict_id || '',
        zipCode: user.address.zipCode || ''
      });
      setProvinceInput(user.address.province || '');
      setSelectedProvince(user.address.province || '');
  
      // Fetch city/district/subdistrict/zipcode options dari backend
      axios.get(`https://uassoftwaredevelopment-production.up.railway.app/api/ship/cities-by-province?province=${user.address.province}`)
        .then(res => {
          setCityOptions(res.data.cities);
          setAllDistricts(res.data.districts);
          setAllSubdistricts(res.data.subdistricts);
          setAllZipcodes(res.data.zipcodes);
  
          // Set selected city
          const cityObj = res.data.cities.find(c => c.name === user.address.city);
          setSelectedCity(cityObj ? cityObj.id : '');
  
          // Set selected district
          const districtObj = res.data.districts.find(d => d.name === user.address.district && d.city_name === user.address.city);
          setDistrictOptions(res.data.districts.filter(d => d.city_name === user.address.city));
          setSelectedDistrict(districtObj ? districtObj.id : '');
  
          // Set selected subdistrict
          const subdistrictObj = res.data.subdistricts.find(s => s.name === user.address.subdistrict && s.district_name === user.address.district);
          setSubdistrictOptions(res.data.subdistricts.filter(s => s.district_name === user.address.district));
          setSelectedSubdistrict(subdistrictObj ? subdistrictObj.id : '');
  
          // Set selected zipcode
          const zipcodeObj = res.data.zipcodes.find(z => z.name === user.address.zipCode && z.subdistrict_name === user.address.subdistrict);
          setZipcodeOptions(res.data.zipcodes.filter(z => z.subdistrict_name === user.address.subdistrict));
          setSelectedZipcode(zipcodeObj ? zipcodeObj.id : '');
        })
        .catch(() => {
          setCityOptions([]);
          setDistrictOptions([]);
          setSubdistrictOptions([]);
          setZipcodeOptions([]);
        });
    }
    // eslint-disable-next-line
  }, [showAddressModal]);

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
              <FaCamera size={18} /> {/* Menggunakan FaCamera dengan size yang lebih besar */}
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
          <Button variant="outline-primary" className="nav-btn active mx-2">
            Personal Info
          </Button>
          <Link to={`/${uid}/orders`}>
            <Button variant="outline-primary" className="nav-btn mx-2">
              Orders
            </Button>
          </Link>
        </div>

        {/* Profile Information */}
        <div className="profile-info">
          <div className="info-item">
            <div className="info-header">
              <FaUser className="info-icon" />
              <label>Name</label>
            </div>
            <span className='isi'>{user?.fname} {user?.lname}</span>
          </div>

          <div className="info-item">
            <div className="info-header">
              <FaEnvelope className="info-icon" />
              <label>Email</label>
            </div>
            <span className='isi'>{user?.email}</span>
          </div>

          <div className="info-item">
            <div className="info-header">
              <FaMapMarkerAlt className="info-icon" />
              <label>Address</label>
              <Button 
                size="sm"
                className="change-address-btn ms-2"
                onClick={() => setShowAddressModal(true)}
              >
                Change Address
              </Button>
            </div>
            <span className="mt-2 isi">
              {user?.address
                ? <>
                    {user.address.street}<br/>
                    {user.address.subdistrict && `${user.address.subdistrict}, `}
                    {user.address.district && `${user.address.district}, `}
                    {user.address.city && `${user.address.city}, `}
                    {user.address.province}<br/>
                    {user.address.zipCode}
                  </>
                : 'No address set'}
            </span>
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
              value={newAddress.street}
              onChange={e => setNewAddress(addr => ({ ...addr, street: e.target.value }))}
              className="modal-input"
            />
          </Form.Group>

          <Form.Group style={{ position: 'relative' }}>
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
            <Select
              options={cityOptions.map(city => ({
                value: city.id,
                label: city.name
              }))}
              value={cityOptions.find(city => city.id === selectedCity) ? {
                value: selectedCity,
                label: cityOptions.find(city => city.id === selectedCity)?.name
              } : null}
              onChange={option => {
                setSelectedCity(option ? option.value : '');
                setSelectedDistrict('');
                setSelectedSubdistrict('');
                setSelectedZipcode('');
              }}
              isDisabled={!selectedProvince}
              placeholder=""
              styles={getSelectCustomStyles(!!selectedProvince)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>District</Form.Label>
            <Select
              options={districtOptions.map(d => ({
                value: d.id,
                label: d.name
              }))}
              value={districtOptions.find(d => d.id === selectedDistrict) ? {
                value: selectedDistrict,
                label: districtOptions.find(d => d.id === selectedDistrict)?.name
              } : null}
              onChange={option => {
                setSelectedDistrict(option ? option.value : '');
                setSelectedSubdistrict('');
                setSelectedZipcode('');
              }}
              isDisabled={!selectedCity}
              placeholder=""
              styles={getSelectCustomStyles(!!selectedCity)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Subdistrict</Form.Label>
            <Select
              options={subdistrictOptions.map(s => ({
                value: s.id,
                label: s.name
              }))}
              value={subdistrictOptions.find(s => s.id === selectedSubdistrict) ? {
                value: selectedSubdistrict,
                label: subdistrictOptions.find(s => s.id === selectedSubdistrict)?.name
              } : null}
              onChange={option => {
                setSelectedSubdistrict(option ? option.value : '');
                setSelectedZipcode('');
              }}
              isDisabled={!selectedDistrict}
              placeholder=""
              styles={getSelectCustomStyles(!!selectedDistrict)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Zip Code</Form.Label>
            <Select
              options={zipcodeOptions.map(z => ({
                value: z.id,
                label: z.name
              }))}
              value={zipcodeOptions.find(z => z.id === selectedZipcode) ? {
                value: selectedZipcode,
                label: zipcodeOptions.find(z => z.id === selectedZipcode)?.name
              } : null}
              onChange={option => {
                setSelectedZipcode(option ? option.value : '');
              }}
              isDisabled={!selectedSubdistrict}
              placeholder=""
              styles={getSelectCustomStyles(!!selectedSubdistrict)}
            />
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

export default ProfilePage;