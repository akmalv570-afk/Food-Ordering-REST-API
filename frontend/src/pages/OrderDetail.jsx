import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await ordersAPI.getOrderDetail(id);
      setOrder(response.data);
    } catch (err) {
      setError('Failed to load order details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Order not found'}
        </div>
        <Link
          to="/orders"
          className="text-primary-green hover:text-green-600"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/orders"
        className="text-primary-green hover:text-green-600 mb-4 inline-block"
      >
        ← Back to Orders
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Order #{order.id}
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Created At
            </h3>
            <p className="text-gray-900">{formatDate(order.created_at)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
            <p className="text-gray-900">{order.address}</p>
          </div>
          {order.promo_code && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Promo Code
              </h3>
              <p className="text-gray-900">{order.promo_code}</p>
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Order Items
          </h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.food_name}</p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="font-bold text-primary-green">
                  ${parseFloat(item.price).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t flex justify-between items-center">
            <span className="text-xl font-semibold text-gray-900">
              Total Price:
            </span>
            <span className="text-2xl font-bold text-primary-green">
              ${parseFloat(order.total_price).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

