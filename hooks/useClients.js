import { useState, useEffect, useCallback } from 'react';
import { loadClients, saveClients } from '../services/storage';

export function useClients() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    loadClients().then(setClients);
  }, []);

  const addClient = useCallback(async (client) => {
    const updated = [...clients, { id: Date.now().toString(), ...client }];
    setClients(updated);
    await saveClients(updated);
  }, [clients]);

  const editClient = useCallback(async (id, updatedClient) => {
    const updated = clients.map(c => c.id === id ? { ...c, ...updatedClient } : c);
    setClients(updated);
    await saveClients(updated);
  }, [clients]);

  const deleteClient = useCallback(async (id) => {
    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    await saveClients(updated);
  }, [clients]);

  return { clients, addClient, editClient, deleteClient };
}
