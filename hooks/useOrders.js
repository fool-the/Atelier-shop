import { useState, useEffect, useCallback } from 'react';
import { loadOrders, saveOrders } from '../services/storage';

export function useOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders().then(setOrders);
  }, []);

  const addOrder = useCallback(async (order) => {
    const updated = [...orders, { id: Date.now().toString(), ...order }];
    setOrders(updated);
    await saveOrders(updated);
  }, [orders]);

  const editOrder = useCallback(async (id, updatedOrder) => {
    const updated = orders.map(o => o.id === id ? { ...o, ...updatedOrder } : o);
    setOrders(updated);
    await saveOrders(updated);
  }, [orders]);

  const deleteOrder = useCallback(async (id) => {
    const updated = orders.filter(o => o.id !== id);
    setOrders(updated);
    await saveOrders(updated);
  }, [orders]);

  return { orders, addOrder, editOrder, deleteOrder };
}
