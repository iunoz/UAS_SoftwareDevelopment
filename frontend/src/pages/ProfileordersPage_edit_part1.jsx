// This is a temporary file to hold the first part of the edit for ProfileordersPage.jsx
// Add after line with "const [imageLoading, setImageLoading] = useState(false);"

const [paymentInProgress, setPaymentInProgress] = useState(false);

const handleCompletePayment = async (order) => {
  if (paymentInProgress) {
    return; // Prevent multiple payment popups
  }
  setPaymentInProgress(true);
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('Please login first.');
      setPaymentInProgress(false);
      return;
    }
    // Call backend to get Midtrans snap token for existing order
    const response = await axios.post('uassoftwaredevelopment-production-b783.up.railway.app/api/payment/create-payment', {
      orderId: order._id,
      amount: order.totalAmount,
      name: currentUser.displayName || 'Customer',
      email: currentUser.email || ''
    });
    if (!response.data.token) {
      throw new Error('Failed to get payment token');
    }
    const token = response.data.token;
    // Load Midtrans script dynamically
    await new Promise((resolve, reject) => {
      if (document.getElementById('midtrans-script')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.id = 'midtrans-script';
      script.setAttribute('data-client-key', 'SB-Mid-client-huB53_HU9pUQhE3N');
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Midtrans script'));
      document.body.appendChild(script);
    });
    // Open Midtrans payment popup
    window.snap.pay(token, {
      onSuccess: async function(result) {
        alert('Payment success!');
        try {
          // Update order status to 'Sedang Dikemas' after successful payment
          await axios.put(`uassoftwaredevelopment-production-b783.up.railway.app/api/payment/update-status/${order._id}`, {
            status: 'Sedang Dikemas'
          });
          // Refresh orders list
          const ordersRes = await axios.get(`uassoftwaredevelopment-production-b783.up.railway.app/api/payment/user-orders/${order.user}`);
          if (ordersRes.data.success) {
            setOrders(ordersRes.data.orders);
          }
          setPaymentInProgress(false);
        } catch (error) {
          console.error('Error updating order status:', error);
          alert('Failed to update order status');
          setPaymentInProgress(false);
        }
      },
      onPending: async function(result) {
        alert('Payment pending!');
        setPaymentInProgress(false);
        // Refresh orders list
        const ordersRes = await axios.get(`uassoftwaredevelopment-production-b783.up.railway.app/api/payment/user-orders/${order.user}`);
        if (ordersRes.data.success) {
          setOrders(ordersRes.data.orders);
        }
      },
      onError: function(result) {
        alert('Payment failed!');
        setPaymentInProgress(false);
      },
      onClose: function() {
        alert('You closed the payment popup without finishing the payment');
        setPaymentInProgress(false);
      }
    });
  } catch (error) {
    console.error('Error during payment:', error);
    alert('Failed to process payment. Please try again.');
    setPaymentInProgress(false);
  }
};
