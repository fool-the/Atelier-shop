
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLIENTS_STORAGE_KEY = '@tailor_clients';
const ORDERS_STORAGE_KEY = '@tailor_orders';

export async function saveClients(clients) {
  await AsyncStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
}

export async function loadClients() {
  const data = await AsyncStorage.getItem(CLIENTS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveOrders(orders) {
  await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

export async function loadOrders() {
  const data = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}
