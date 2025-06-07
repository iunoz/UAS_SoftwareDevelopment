import React, { useState, useEffect } from 'react';
import '../styles/Payment.css';
import { auth } from '../firebase.config';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';

const ORIGIN_ZIPCODE = '10440'; // Kodepos Jakarta Pusat
const WEIGHT = 10000; // Berat total dalam gram

const courierList = [
  { code: 'jne', name: 'Jalur Nugraha Ekakurir (JNE)' },
  { code: 'jnt', name: 'J&T Express' },
  { code: 'ninja', name: 'Ninja Xpress' },
  { code: 'lion', name: 'Lion Parcel' }
];

const Payment = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [address, setAddress] = useState(null);
  const [cartTotal, setCartTotal] = useState(0);
  const navigate = useNavigate();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);

  // Address states
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

  const [tempStreet, setTempStreet] = useState('');

  // Ongkir states
  const [selectedCourier, setSelectedCourier] = useState('');
  const [shippingServices, setShippingServices] = useState([]);
  const [selectedShippingService, setSelectedShippingService] = useState('');
  const [shippingCost, setShippingCost] = useState(0);

  const location = useLocation();
  const buyNowState = location.state?.buyNow;
  const buyNowProduct = location.state?.product;

  const [buyNowTotal, setBuyNowTotal] = useState(0);

  const cartWeight = location.state?.cartWeight;
  const [totalWeight, setTotalWeight] = useState(0);

  const [cartItems, setCartItems] = useState([]);

  // Fetch cart & user address
  useEffect(() => {
    if (buyNowState && buyNowProduct) {
      setTotalWeight(buyNowProduct.weight * buyNowProduct.quantity);
    } else if (cartWeight) {
      setTotalWeight(cartWeight);
    } else {
      // fallback: fetch cart dan hitung total weight
      const fetchCart = async () => {
        try {
          const currentUser = auth.currentUser;
          if (!currentUser) {
            navigate('/login');
            return;
          }
          const token = await currentUser.getIdToken();
          // Fetch cart
          const res = await axios.get('http://localhost:4000/api/cart', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            setCartItems(res.data.cart.map(item => ({
              id: item.product._id,
              name: item.product.name,
              image: item.product.image,
              price: item.product.price,
              quantity: item.quantity,
              weight: item.product.weight
            })));
            const total = res.data.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            setCartTotal(total);
            // Hitung total weight dari cart
            const weightSum = res.data.cart.reduce((sum, item) => sum + (item.product.weight * item.quantity), 0);
            setTotalWeight(weightSum);
          }
          // Fetch user profile for address
          const userRes = await axios.get(`http://localhost:4000/api/user/${currentUser.uid}`);
          if (userRes.data.success) {
            setAddress(userRes.data.user.address || null);
          }
        } catch (err) {
          console.error('Error fetching cart or address:', err);
          setCartTotal(0);
          setTotalWeight(0);
          setCartItems([]);
        }
      };
      fetchCart();
    }
  }, [buyNowState, buyNowProduct, cartWeight, navigate]);

  // Province autocomplete
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

  // Fetch all city/district/subdistrict/zipcode when province selected
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

  // Filter districts when city selected
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

  // Filter subdistricts when district selected
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

  // Filter zipcodes when subdistrict selected
  useEffect(() => {
    if (selectedSubdistrict) {
      const subdistrictObj = subdistrictOptions.find(s => s.id === selectedSubdistrict);
      const filteredZipcodes = allZipcodes.filter(z => z.subdistrict_name === subdistrictObj?.name);
      setZipcodeOptions(filteredZipcodes);
    } else {
      setZipcodeOptions([]);
      setSelectedZipcode('');
    }
  }, [selectedSubdistrict, subdistrictOptions, allZipcodes]);

  // Buka modal edit address dan isi state dengan address sekarang
  const handleAddressEdit = () => {
    setTempStreet(address?.street || '');
    setProvinceInput(address?.province || '');
    setSelectedProvince(address?.province || '');
    setSelectedCity('');
    setSelectedDistrict('');
    setSelectedSubdistrict('');
    setSelectedZipcode('');
    setShowAddressModal(true);
  };

  // Save hanya untuk pembelian ini
  const handleSaveForThisPurchase = () => {
    setAddress({
      street: tempStreet,
      province: selectedProvince,
      city: cityOptions.find(c => c.id === selectedCity)?.name || '',
      district: districtOptions.find(d => d.id === selectedDistrict)?.name || '',
      subdistrict: subdistrictOptions.find(s => s.id === selectedSubdistrict)?.name || '',
      zipCode: zipcodeOptions.find(z => z.id === selectedZipcode)?.name || ''
    });
    setShowAddressModal(false);
  };

  // Save ke main address (profile)
  const handleSaveToMainAddress = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate('/login');
        return;
      }
      const updatedAddress = {
        street: tempStreet,
        province: selectedProvince,
        city: cityOptions.find(c => c.id === selectedCity)?.name || '',
        district: districtOptions.find(d => d.id === selectedDistrict)?.name || '',
        subdistrict: subdistrictOptions.find(s => s.id === selectedSubdistrict)?.name || '',
        zipCode: zipcodeOptions.find(z => z.id === selectedZipcode)?.name || ''
      };
      const res = await axios.put(`http://localhost:4000/api/user/${currentUser.uid}/update-address`, {
        address: updatedAddress
      });
      if (res.data.success) {
        setAddress(updatedAddress);
        setShowAddressModal(false);
      }
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Failed to update main address');
    }
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  // Fetch shipping cost when courier or zipcode changes
  useEffect(() => {
    // Debug: log state
    console.log('selectedCourier:', selectedCourier, 'selectedZipcode:', selectedZipcode);
    const fetchOngkir = async () => {
      if (!selectedCourier || !selectedZipcode) {
        setShippingServices([]);
        setSelectedShippingService('');
        setShippingCost(0);
        return;
      }
      try {
        const res = await axios.post(
          'http://localhost:4000/api/ship/calculate-ongkir',
          {},
          {
            params: {
              origin: ORIGIN_ZIPCODE,
              destination: selectedZipcode,
              weight: WEIGHT,
              courier: selectedCourier,
              price: 'lowest'
            }
          }
        );
        // Debug: log response
        console.log('Ongkir response:', res.data.data);
        setShippingServices(res.data.data || []);
        setSelectedShippingService('');
        setShippingCost(0);
      } catch (err) {
        console.error('Ongkir error:', err);
        setShippingServices([]);
        setSelectedShippingService('');
        setShippingCost(0);
      }
    };
    fetchOngkir();
  }, [selectedCourier, selectedZipcode]);

  // Handle service selection
  const handleServiceChange = (e) => {
    setSelectedShippingService(e.target.value);
    // Debug: log value yang dipilih
    console.log('Selected service value:', e.target.value);
    const [code, serviceCode] = e.target.value.split('-');
    // Debug: log shippingServices
    console.log('shippingServices:', shippingServices);
    const service = shippingServices.find(
      s => (s.code === code || s.name === code) && s.service === serviceCode
    );
    // Debug: log service yang ditemukan
    console.log('Selected service object:', service);
    setShippingCost(service ? Number(service.cost) : 0);
  };

  useEffect(() => {
    // Jika address sudah ada dan belum pernah diisi ke state dropdown
    if (
      address &&
      address.province &&
      address.city &&
      address.district &&
      address.subdistrict &&
      address.zipCode
    ) {
      setProvinceInput(address.province);
      setSelectedProvince(address.province);

      // Fetch city/district/subdistrict/zipcode options dari backend
      axios.get(`http://localhost:4000/api/ship/cities-by-province?province=${address.province}`)
        .then(res => {
          setCityOptions(res.data.cities);
          setAllDistricts(res.data.districts);
          setAllSubdistricts(res.data.subdistricts);
          setAllZipcodes(res.data.zipcodes);

          // Set selected city
          const cityObj = res.data.cities.find(c => c.name === address.city);
          setSelectedCity(cityObj ? cityObj.id : '');

          // Set selected district
          const districtObj = res.data.districts.find(d => d.name === address.district && d.city_name === address.city);
          setDistrictOptions(res.data.districts.filter(d => d.city_name === address.city));
          setSelectedDistrict(districtObj ? districtObj.id : '');

          // Set selected subdistrict
          const subdistrictObj = res.data.subdistricts.find(s => s.name === address.subdistrict && s.district_name === address.district);
          setSubdistrictOptions(res.data.subdistricts.filter(s => s.district_name === address.district));
          setSelectedSubdistrict(subdistrictObj ? subdistrictObj.id : '');

          // Set selected zipcode
          const zipcodeObj = res.data.zipcodes.find(z => z.name === address.zipCode && z.subdistrict_name === address.subdistrict);
          setZipcodeOptions(res.data.zipcodes.filter(z => z.subdistrict_name === address.subdistrict));
          setSelectedZipcode(zipcodeObj ? zipcodeObj.id : '');
        })
        .catch(() => {
          setCityOptions([]);
          setDistrictOptions([]);
          setSubdistrictOptions([]);
          setZipcodeOptions([]);
        });
    }
  }, [address]);

  useEffect(() => {
    if (buyNowState && buyNowProduct) {
      setBuyNowTotal(buyNowProduct.price * buyNowProduct.quantity);
    } else {
      // fetch cart seperti biasa
      const fetchCart = async () => {
        try {
          const currentUser = auth.currentUser;
          if (!currentUser) {
            navigate('/login');
            return;
          }
          const token = await currentUser.getIdToken();
          const res = await axios.get('http://localhost:4000/api/cart', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            const total = res.data.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            setCartTotal(total);
          }
        } catch (err) {
          console.error('Error fetching cart:', err);
          setCartTotal(0);
        }
      };
      fetchCart();
    }
  }, [buyNowState, buyNowProduct, navigate]);

  // Load Midtrans Snap script dynamically
  const loadMidtransScript = () => {
    return new Promise((resolve, reject) => {
      if (document.getElementById('midtrans-script')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.id = 'midtrans-script';
      script.setAttribute('data-client-key', 'SB-Mid-client-huB53_HU9pUQhE3N');
      script.onload = () => {
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Midtrans script'));
      };
      document.body.appendChild(script);
    });
  };

  // Handle Make Order button click to integrate Midtrans payment
  const handleMakeOrder = async () => {
    if (paymentInProgress) {
      return; // Prevent multiple payment popups
    }
    if (!selectedCourier) {
      alert('Please select a courier before making an order.');
      return;
    }
    setPaymentInProgress(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate('/login');
        setPaymentInProgress(false);
        return;
      }
      await loadMidtransScript();

      // Prepare order data
      const orderId = `order-${Date.now()}`;
      const amount = (buyNowState ? buyNowTotal : cartTotal) + shippingCost;
      const name = currentUser.displayName || 'Customer';
      const email = currentUser.email || '';

      // Call backend to get Snap token
      const response = await axios.post('http://localhost:4000/api/payment/create-payment', {
        orderId,
        amount,
        name,
        email
      });

      const token = response.data.token;

      // Open Midtrans payment popup
      window.snap.pay(token, {
        onSuccess: async function(result) {
          alert('Payment success!');
          try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
              navigate('/login');
              setPaymentInProgress(false);
              return;
            }
            // Prepare order data to save
            const orderData = {
              userId: currentUser.uid,
              items: buyNowState && buyNowProduct ? [{
                product: buyNowProduct.id || buyNowProduct._id,
                quantity: buyNowProduct.quantity,
                priceAtPurchase: buyNowProduct.price
              }] : cartItems.map(item => ({
                product: item.id,
                quantity: item.quantity,
                priceAtPurchase: item.price
              })),
              address: address ? `${address.street}, ${address.subdistrict}, ${address.district}, ${address.city}, ${address.province}, ${address.zipCode}` : '',
              courier: selectedCourier,
              totalAmount: (buyNowState ? buyNowTotal : cartTotal) + shippingCost
            };
            // Save order to backend
            const saveRes = await axios.post('http://localhost:4000/api/payment/save-order', orderData);
            setPaymentInProgress(false);
            // Remove Midtrans overlay
            const overlay = document.querySelector('.midtrans-overlay');
            if (overlay) {
              overlay.style.display = 'none';
            }
            // Redirect to orders page with newOrderId
            navigate(`/${currentUser.uid}/orders`, { state: { newOrderId: saveRes.data.order._id } });
          } catch (error) {
            console.error('Error saving order:', error);
            alert('Failed to save order');
            setPaymentInProgress(false);
          }
        },
        onPending: async function(result) {
          alert('Payment pending!');
          try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
              navigate('/login');
              setPaymentInProgress(false);
              return;
            }
            // Prepare order data to save
            const orderData = {
              userId: currentUser.uid,
              items: buyNowState && buyNowProduct ? [{
                product: buyNowProduct.id || buyNowProduct._id,
                quantity: buyNowProduct.quantity,
                priceAtPurchase: buyNowProduct.price
              }] : cartItems.map(item => ({
                product: item.id,
                quantity: item.quantity,
                priceAtPurchase: item.price
              })),
              address: address ? `${address.street}, ${address.subdistrict}, ${address.district}, ${address.city}, ${address.province}, ${address.zipCode}` : '',
              courier: selectedCourier,
              totalAmount: (buyNowState ? buyNowTotal : cartTotal) + shippingCost
            };
            // Save order to backend
            const saveRes = await axios.post('http://localhost:4000/api/payment/save-order', orderData);
            setPaymentInProgress(false);
            // Remove Midtrans overlay
            const overlay = document.querySelector('.midtrans-overlay');
            if (overlay) {
              overlay.style.display = 'none';
            }
            // Redirect to orders page with newOrderId
            navigate(`/${currentUser.uid}/orders`, { state: { newOrderId: saveRes.data.order._id } });
          } catch (error) {
            console.error('Error saving order:', error);
            alert('Failed to save order');
            setPaymentInProgress(false);
          }
        },
        onError: function(result) {
          alert('Payment failed!');
          console.error(result);
          setPaymentInProgress(false);
          // Remove Midtrans overlay
          const overlay = document.querySelector('.midtrans-overlay');
          if (overlay) {
            overlay.style.display = 'none';
          }
        },
        onClose: function() {
          alert('You closed the payment popup without finishing the payment');
          setPaymentInProgress(false);
          // Remove Midtrans overlay
          const overlay = document.querySelector('.midtrans-overlay');
          if (overlay) {
            overlay.style.display = 'none';
          }
        }
      });
    } catch (error) {
      console.error('Error during payment:', error);
      alert('Failed to process payment. Please try again.');
      setPaymentInProgress(false);
    }
  };

  return (
    <div className="payment-container">
      <h2 className="global-title">Payment</h2>
      <hr />
      {/* Product List (readonly, mirip cart, tidak bisa diedit) */}
      <div className="payment-products-list">
        {buyNowState && buyNowProduct ? (
          <div className="payment-product-item">
            <img src={buyNowProduct.image} alt={buyNowProduct.name} className="payment-product-img" />
            <div className="payment-product-info">
              <div className="payment-product-name">{buyNowProduct.name}</div>
              <div className="payment-product-qty">Qty: {buyNowProduct.quantity}</div>
              <div className="payment-product-price">Rp {buyNowProduct.price.toLocaleString()}</div>
            </div>
          </div>
        ) : (
          cartItems.length > 0
            ? cartItems.map(item => (
                <div className="payment-product-item" key={item.id}>
                  <img src={item.image} alt={item.name} className="payment-product-img" />
                  <div className="payment-product-info">
                    <div className="payment-product-name">{item.name}</div>
                    <div className="payment-product-qty">Qty: {item.quantity}</div>
                    <div className="payment-product-price">Rp {item.price.toLocaleString()}</div>
                  </div>
                </div>
              ))
            : <div className="text-light">No products found.</div>
        )}
      </div>

      <div className="payment-form-grid">

        {/* Baris 1: Address */}
        <div className="form-label-cell">
          Address
        </div>
        <div className="form-input-cell address-input-group">
          <div className="address-display address-input" style={{ whiteSpace: 'pre-line', minHeight: 48 }}>
            {address
              ? <>
                  {address.street && <>{address.street}<br/></>}
                  {address.subdistrict && `${address.subdistrict}, `}
                  {address.district && `${address.district}, `}
                  {address.city && `${address.city}, `}
                  {address.province && <>{address.province}<br/></>}
                  {address.zipCode && <>{address.zipCode}</>}
                </>
              : <span style={{ color: '#888' }}>No address set</span>
            }
          </div>
          <button className="edit-btn" onClick={handleAddressEdit}>Edit</button>
        </div>

        {/* Courier */}
        <div className="form-label-cell">Courier</div>
        <div className="form-input-cell">
        <select value={selectedCourier} onChange={e => setSelectedCourier(e.target.value)}>
          <option value="">Select Courier</option>
          {courierList.map(courier => (
            <option key={courier.code} value={courier.code}>{courier.name}</option>
          ))}
        </select>
        </div>

        {/* Service */}
        <div className="form-label-cell">Service</div>
        <div className="form-input-cell">
        <select
          value={selectedShippingService}
          onChange={handleServiceChange}
          disabled={!shippingServices.length}
        >
          <option value="">Select Service</option>
          {Array.from(
            new Map(
              shippingServices
                .filter(service => service.code === selectedCourier)
                .map(service => [
                  `${service.code}-${service.service}`,
                  service
                ])
            ).values()
          ).map((service, idx) => (
            <option
              key={`${service.code}-${service.service}-${idx}`}
              value={`${service.code}-${service.service}`}
            >
              {service.service} - Rp {Number(service.cost).toLocaleString('id-ID')}
            </option>
          ))}
        </select>
        </div>

        {/* Total Weight */}
        <div className="form-label-cell">Total Weight</div>
        <div className="form-input-cell">
          <span className="weight-display">{(totalWeight / 1000).toFixed(2)} kg</span>
        </div>
      </div>

      {/* Total Price dan Order Button tetap di bawah grid */}
      <div className="total-price">
        <strong>Total Price:</strong> RP {((buyNowState ? buyNowTotal : cartTotal) + shippingCost).toLocaleString('id-ID')}
      </div>
      <button className="order-btn" onClick={handleMakeOrder}>
        Make Order
      </button>

      {/* Modal Edit Address */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className='mb-2'>
            <Form.Label>Street</Form.Label>
            <Form.Control
              type="text"
              value={tempStreet}
              onChange={e => setTempStreet(e.target.value)}
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
              onChange={e => {
                setSelectedZipcode(e.target.value);
                console.log('Zipcode selected:', e.target.value);
              }}
              disabled={!selectedSubdistrict}
            >
              <option value="">Select Zip Code</option>
              {zipcodeOptions.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddressModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveForThisPurchase}>
            Save for this purchase
          </Button>
          <Button variant="warning" onClick={handleSaveToMainAddress}>
            Save to Main Address
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Payment;