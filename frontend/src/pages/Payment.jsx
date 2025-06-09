import React, { useState, useEffect } from 'react';
import '../styles/Payment.css';
import { auth } from '../firebase.config';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import Select from 'react-select';

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
  // Tambahkan selectedProducts dari state
  const selectedProducts = location.state?.selectedProducts || null;

  const [buyNowTotal, setBuyNowTotal] = useState(0);
  const cartWeight = location.state?.cartWeight;
  const [totalWeight, setTotalWeight] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  
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

  // Separate useEffect for address fetching
  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate('/login');
          return;
        }
        const userRes = await axios.get(`http://localhost:4000/api/user/${currentUser.uid}`);
        if (userRes.data.success) {
          setAddress(userRes.data.user.address || null);
        }
      } catch (err) {
        console.error('Error fetching address:', err);
      }
    };
    fetchUserAddress();
  }, [navigate]);

  // Helper function for weight calculation
  const calculateWeight = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      const weight = Number(item.weight) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + (weight * quantity);
    }, 0);
  };

  // Modified useEffect for cart and weight calculation
  useEffect(() => {
    const fetchCartAndCalculateWeight = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate('/login');
          return;
        }

        if (buyNowState && buyNowProduct) {
          const weight = Number(buyNowProduct.weight) || 0;
          const quantity = Number(buyNowProduct.quantity) || 0;
          setTotalWeight(weight * quantity);
          setBuyNowTotal(buyNowProduct.price * buyNowProduct.quantity);
        } else if (selectedProducts && selectedProducts.length > 0) {
          const weightSum = calculateWeight(selectedProducts);
          setTotalWeight(weightSum);
          const total = selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          setCartTotal(total);
        } else if (cartWeight) {
          setTotalWeight(Number(cartWeight) || 0);
        } else {
          const token = await currentUser.getIdToken();
          // Fetch cart
          const res = await axios.get('http://localhost:4000/api/cart', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.data.success) {
            const cartItems = res.data.cart.map(item => ({
              id: item.product._id,
              name: item.product.name,
              image: item.product.image,
              price: item.product.price,
              quantity: item.quantity,
              weight: item.product.weight
            }));

            setCartItems(cartItems);
            
            // Calculate total price
            const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            setCartTotal(total);
            
            // Calculate total weight
            const weightSum = calculateWeight(cartItems);
            setTotalWeight(weightSum);
          }
        }
      } catch (err) {
        console.error('Error fetching cart or calculating weight:', err);
        setCartTotal(0);
        setTotalWeight(0);
        setCartItems([]);
      }
    };

    fetchCartAndCalculateWeight();
  }, [buyNowState, buyNowProduct, selectedProducts, cartWeight, navigate]);

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
    } else if (selectedProducts && selectedProducts.length > 0) {
      // Hitung total harga dari selectedProducts
      const total = selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setCartTotal(total);
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
  }, [buyNowState, buyNowProduct, selectedProducts, navigate]);

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

      // Prepare order data
      const orderData = {
        userId: currentUser.uid,
        items: buyNowState && buyNowProduct ? [{
          product: buyNowProduct.id || buyNowProduct._id,
          quantity: buyNowProduct.quantity,
          priceAtPurchase: buyNowProduct.price
        }] : (selectedProducts && selectedProducts.length > 0
          ? selectedProducts.map(item => ({
              product: item.id,
              quantity: item.quantity,
              priceAtPurchase: item.price
            }))
          : cartItems.map(item => ({
              product: item.id,
              quantity: item.quantity,
              priceAtPurchase: item.price
            }))
        ),
        address: address ? `${address.street}, ${address.subdistrict}, ${address.district}, ${address.city}, ${address.province}, ${address.zipCode}` : '',
        courier: selectedCourier,
        totalAmount: (buyNowState ? buyNowTotal : cartTotal) + shippingCost,
        status: 'Belum Bayar' // Set initial status as Unpaid
      };

      // Save order to backend immediately with status 'Belum Bayar'
      const saveRes = await axios.post('http://localhost:4000/api/payment/save-order', orderData);

      // Proceed with Midtrans payment
      await loadMidtransScript();

      // Call backend to get Snap token
      const response = await axios.post('http://localhost:4000/api/payment/create-payment', {
        orderId: saveRes.data.order._id,
        amount: orderData.totalAmount,
        name: currentUser.displayName || 'Customer',
        email: currentUser.email || ''
      });

      const token = response.data.token;

      // Open Midtrans payment popup
      window.snap.pay(token, {
        onSuccess: async function(result) {
          alert('Payment success!');
          try {
            // Update order status to 'Sedang Dikemas' after successful payment
            await axios.put(`http://localhost:4000/api/payment/update-status/${saveRes.data.order._id}`, {
              status: 'Sedang Dikemas'
            });
            setPaymentInProgress(false);
            // Remove Midtrans overlay
            const overlay = document.querySelector('.midtrans-overlay');
            if (overlay) {
              overlay.style.display = 'none';
            }
            // Redirect to orders page with newOrderId
            navigate(`/${currentUser.uid}/orders`, { state: { newOrderId: saveRes.data.order._id } });
          } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status');
            setPaymentInProgress(false);
          }
        },
        onPending: async function(result) {
          alert('Payment pending!');
          setPaymentInProgress(false);
          // Remove Midtrans overlay
          const overlay = document.querySelector('.midtrans-overlay');
          if (overlay) {
            overlay.style.display = 'none';
          }
          // Redirect to orders page with newOrderId
          navigate(`/${currentUser.uid}/orders`, { state: { newOrderId: saveRes.data.order._id } });
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
      
      {/* Product List */}
      <div className="payment-products-list">
        {buyNowState && buyNowProduct ? (
          <div className="payment-product-item">
            <img 
              src={buyNowProduct.image} 
              alt={buyNowProduct.name} 
              className="payment-product-img"
            />
            <div className="payment-product-info">
              <div className="payment-product-left">
                <span className="payment-product-name">{buyNowProduct.name}</span>
                <span className="payment-product-qty">Qty: {buyNowProduct.quantity}</span>
              </div>
              <div className="payment-product-right">
                <span className="payment-product-price">
                  RP. {(buyNowProduct.price * buyNowProduct.quantity).toLocaleString('id-ID')}
                </span>
                <span className="payment-product-unit-price">
                  @ RP. {buyNowProduct.price.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        ) : (
          (selectedProducts && selectedProducts.length > 0
            ? selectedProducts.map(item => (
                <div className="payment-product-item" key={item.id}>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="payment-product-img"
                  />
                  <div className="payment-product-info">
                    <div className="payment-product-left">
                      <span className="payment-product-name">{item.name}</span>
                      <span className="payment-product-qty">Qty: {item.quantity}</span>
                    </div>
                    <div className="payment-product-right">
                      <span className="payment-product-price">
                        RP. {(item.price * item.quantity).toLocaleString('id-ID')}
                      </span>
                      <span className="payment-product-unit-price">
                        @ RP. {item.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            : cartItems.length > 0
              ? cartItems.map(item => (
                  <div className="payment-product-item" key={item.id}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="payment-product-img"
                    />
                    <div className="payment-product-info">
                      <div className="payment-product-left">
                        <span className="payment-product-name">{item.name}</span>
                        <span className="payment-product-qty">Qty: {item.quantity}</span>
                      </div>
                      <div className="payment-product-right">
                        <span className="payment-product-price">
                          RP. {(item.price * item.quantity).toLocaleString('id-ID')}
                        </span>
                        <span className="payment-product-unit-price">
                          @ RP. {item.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              : <div className="text-light">No products found.</div>
          )
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
          <span className="weight-display">{isNaN(totalWeight) ? '0.00' : (totalWeight / 1000).toFixed(2)} kg</span>
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