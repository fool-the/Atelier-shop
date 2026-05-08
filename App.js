import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Modal,
  StyleSheet, Alert, Linking, Platform, StatusBar, SafeAreaView,
  KeyboardAvoidingView, FlatList, Pressable, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ═══════════════════════════════════════════════════════════════
// TRANSLATIONS
// ═══════════════════════════════════════════════════════════════
const T = {
  ar: {
    dir: 'rtl',
    appName: 'أتيليه',
    appSub: 'إدارة الخياطة',
    nav: { home: 'الرئيسية', clients: 'العملاء', orders: 'الطلبات', inventory: 'المخزون', finance: 'المالية' },
    dashboard: {
      welcome: 'مرحباً', clients: 'العملاء', orders: 'الطلبات', pending: 'قيد الانتظار',
      done: 'منجزة', unpaid: 'غير مدفوعة', forgotten: 'مهملة',
      recentOrders: 'آخر الطلبات', noOrders: 'لا توجد طلبات بعد',
      daysAgo: 'منذ', day: 'يوم', days: 'أيام',
      forgottenAlert: 'طلب/طلبات غير مسلّمة منذ أكثر من 90 يوماً',
      revenue: 'الإيرادات', expenses: 'المصاريف', profit: 'الربح',
    },
    customers: {
      title: 'العملاء', search: 'بحث بالاسم أو الهاتف...',
      add: '+ عميل جديد', noCustomers: 'لا يوجد عملاء',
      orders: 'الطلبات', edit: 'تعديل', delete: 'حذف',
      confirmDelete: 'حذف هذا العميل وجميع طلباته؟',
      measurements: 'المقاسات', noMeasurements: 'لا توجد مقاسات',
      name: 'الاسم الكامل', phone: 'الهاتف',
      height: 'الطول', chest: 'الصدر', waist: 'الخصر',
      hips: 'الأرداف', shoulder: 'الكتف', sleeve: 'الكم',
      notes: 'ملاحظات', save: 'حفظ', cancel: 'إلغاء',
      nameRequired: 'الاسم مطلوب', addTitle: 'عميل جديد', editTitle: 'تعديل العميل',
    },
    orders: {
      title: 'الطلبات', search: 'بحث...',
      add: '+ طلب جديد', noOrders: 'لا توجد طلبات',
      allStatus: 'كل الحالات', client: 'العميل',
      description: 'وصف الطلب', deadline: 'تاريخ التسليم (YYYY-MM-DD)',
      price: 'السعر (درهم)', paid: 'تم الدفع',
      notes: 'ملاحظات داخلية', save: 'حفظ', cancel: 'إلغاء',
      noClient: 'لا يوجد عميل. أضف عميلاً أولاً.',
      addTitle: 'طلب جديد', editTitle: 'تعديل الطلب',
      whatsapp: 'إرسال واتساب', deleteConfirm: 'حذف هذا الطلب؟',
      source: 'المصدر', sourceShop: 'المحل', sourceOnline: 'أونلاين', sourcePhone: 'هاتف',
      daysOld: 'يوم بدون تسليم ⚠️', analyzing: 'جاري التحليل...',
    },
    status: {
      pending: 'قيد الانتظار', inprogress: 'جاري العمل',
      done: 'منجز', delivered: 'مُسلَّم', forgotten: 'مهمل ⚠️',
    },
    inventory: {
      title: 'المخزون', search: 'بحث...',
      add: '+ منتج جديد', noItems: 'لا توجد منتجات',
      addTitle: 'منتج جديد', editTitle: 'تعديل المنتج',
      name: 'اسم المنتج', category: 'الفئة',
      buyPrice: 'سعر الشراء (درهم)', sellPrice: 'سعر البيع (درهم)',
      stock: 'الكمية', unit: 'الوحدة',
      notes: 'ملاحظات', save: 'حفظ', cancel: 'إلغاء',
      margin: 'هامش الربح', lowStock: 'مخزون منخفض',
      categories: { fabric: 'أقمشة', thread: 'خيوط', needle: 'إبر وأدوات', ready: 'ملابس جاهزة', accessory: 'إكسسوار', other: 'أخرى' },
      allCats: 'كل الفئات', deleteConfirm: 'حذف هذا المنتج؟',
      sell: 'تسجيل بيع', sellQty: 'الكمية المباعة',
    },
    finance: {
      title: 'المالية', thisMonth: 'هذا الشهر', allTime: 'الكل',
      revenue: 'إيرادات', expenses: 'مصاريف', profit: 'صافي الربح',
      addExpense: '+ مصروف', addIncome: '+ دخل',
      noTransactions: 'لا توجد معاملات',
      expenseTitle: 'مصروف جديد', incomeTitle: 'دخل يدوي',
      description: 'الوصف', amount: 'المبلغ (درهم)',
      category: 'الفئة', date: 'التاريخ (YYYY-MM-DD)',
      save: 'حفظ', cancel: 'إلغاء',
      categories: { order: 'طلب', sale: 'بيع منتج', purchase: 'شراء بضاعة', rent: 'إيجار', utility: 'فواتير', salary: 'أجور', other: 'أخرى' },
      type: { income: 'دخل', expense: 'مصروف' },
      deleteConfirm: 'حذف هذه المعاملة؟',
    },
    settings: {
      title: 'الإعدادات', language: 'اللغة',
      shopName: 'اسم المحل', ownerPhone: 'هاتف المالك',
      save: 'حفظ الإعدادات', saved: 'تم الحفظ ✓',
    },
    common: { loading: 'جاري التحميل...', error: 'خطأ', close: 'إغلاق', cm: 'سم', mad: 'درهم' },
  },
  fr: {
    dir: 'ltr',
    appName: 'Atelier',
    appSub: 'Gestion de couture',
    nav: { home: 'Accueil', clients: 'Clients', orders: 'Commandes', inventory: 'Stock', finance: 'Finance' },
    dashboard: {
      welcome: 'Bonjour', clients: 'Clients', orders: 'Commandes', pending: 'En attente',
      done: 'Terminées', unpaid: 'Impayées', forgotten: 'Oubliées',
      recentOrders: 'Dernières commandes', noOrders: 'Aucune commande',
      daysAgo: 'il y a', day: 'jour', days: 'jours',
      forgottenAlert: 'commande(s) non livrée(s) depuis +90 jours',
      revenue: 'Revenus', expenses: 'Dépenses', profit: 'Bénéfice',
    },
    customers: {
      title: 'Clients', search: 'Rechercher...', add: '+ Nouveau client', noCustomers: 'Aucun client',
      orders: 'Commandes', edit: 'Modifier', delete: 'Supprimer',
      confirmDelete: 'Supprimer ce client et toutes ses commandes ?',
      measurements: 'Mensurations', noMeasurements: 'Pas de mensurations',
      name: 'Nom complet', phone: 'Téléphone',
      height: 'Hauteur', chest: 'Poitrine', waist: 'Taille',
      hips: 'Hanches', shoulder: 'Épaules', sleeve: 'Manche',
      notes: 'Notes', save: 'Enregistrer', cancel: 'Annuler',
      nameRequired: 'Le nom est requis', addTitle: 'Nouveau client', editTitle: 'Modifier le client',
    },
    orders: {
      title: 'Commandes', search: 'Rechercher...', add: '+ Nouvelle commande', noOrders: 'Aucune commande',
      allStatus: 'Tous les statuts', client: 'Client',
      description: 'Description', deadline: 'Date limite (YYYY-MM-DD)',
      price: 'Prix (MAD)', paid: 'Payé',
      notes: 'Notes internes', save: 'Enregistrer', cancel: 'Annuler',
      noClient: 'Pas de client. Créez un client d\'abord.',
      addTitle: 'Nouvelle commande', editTitle: 'Modifier la commande',
      whatsapp: 'Envoyer WhatsApp', deleteConfirm: 'Supprimer cette commande ?',
      source: 'Source', sourceShop: 'Boutique', sourceOnline: 'En ligne', sourcePhone: 'Téléphone',
      daysOld: 'jours sans livraison ⚠️', analyzing: 'Analyse...',
    },
    status: { pending: 'En attente', inprogress: 'En cours', done: 'Terminé', delivered: 'Livré', forgotten: 'Oublié ⚠️' },
    inventory: {
      title: 'Stock', search: 'Rechercher...', add: '+ Nouveau produit', noItems: 'Aucun produit',
      addTitle: 'Nouveau produit', editTitle: 'Modifier le produit',
      name: 'Nom du produit', category: 'Catégorie',
      buyPrice: 'Prix d\'achat (MAD)', sellPrice: 'Prix de vente (MAD)',
      stock: 'Quantité', unit: 'Unité',
      notes: 'Notes', save: 'Enregistrer', cancel: 'Annuler',
      margin: 'Marge', lowStock: 'Stock faible',
      categories: { fabric: 'Tissus', thread: 'Fils', needle: 'Aiguilles', ready: 'Vêtements', accessory: 'Accessoires', other: 'Autre' },
      allCats: 'Toutes catégories', deleteConfirm: 'Supprimer ce produit ?',
      sell: 'Enregistrer vente', sellQty: 'Quantité vendue',
    },
    finance: {
      title: 'Finance', thisMonth: 'Ce mois', allTime: 'Tout',
      revenue: 'Revenus', expenses: 'Dépenses', profit: 'Bénéfice net',
      addExpense: '+ Dépense', addIncome: '+ Revenu',
      noTransactions: 'Aucune transaction',
      expenseTitle: 'Nouvelle dépense', incomeTitle: 'Revenu manuel',
      description: 'Description', amount: 'Montant (MAD)',
      category: 'Catégorie', date: 'Date (YYYY-MM-DD)',
      save: 'Enregistrer', cancel: 'Annuler',
      categories: { order: 'Commande', sale: 'Vente', purchase: 'Achat', rent: 'Loyer', utility: 'Factures', salary: 'Salaires', other: 'Autre' },
      type: { income: 'Revenu', expense: 'Dépense' },
      deleteConfirm: 'Supprimer cette transaction ?',
    },
    settings: {
      title: 'Paramètres', language: 'Langue',
      shopName: 'Nom de l\'atelier', ownerPhone: 'Téléphone',
      save: 'Enregistrer', saved: 'Enregistré ✓',
    },
    common: { loading: 'Chargement...', error: 'Erreur', close: 'Fermer', cm: 'cm', mad: 'MAD' },
  },
  en: {
    dir: 'ltr',
    appName: 'Atelier',
    appSub: 'Sewing Shop Manager',
    nav: { home: 'Home', clients: 'Clients', orders: 'Orders', inventory: 'Stock', finance: 'Finance' },
    dashboard: {
      welcome: 'Hello', clients: 'Clients', orders: 'Orders', pending: 'Pending',
      done: 'Done', unpaid: 'Unpaid', forgotten: 'Forgotten',
      recentOrders: 'Recent orders', noOrders: 'No orders yet',
      daysAgo: '', day: 'day', days: 'days ago',
      forgottenAlert: 'order(s) not delivered in 90+ days',
      revenue: 'Revenue', expenses: 'Expenses', profit: 'Profit',
    },
    customers: {
      title: 'Clients', search: 'Search by name or phone...', add: '+ New Client', noCustomers: 'No clients yet',
      orders: 'Orders', edit: 'Edit', delete: 'Delete',
      confirmDelete: 'Delete this client and all their orders?',
      measurements: 'Measurements', noMeasurements: 'No measurements',
      name: 'Full name', phone: 'Phone',
      height: 'Height', chest: 'Chest', waist: 'Waist',
      hips: 'Hips', shoulder: 'Shoulder', sleeve: 'Sleeve',
      notes: 'Notes', save: 'Save', cancel: 'Cancel',
      nameRequired: 'Name is required', addTitle: 'New Client', editTitle: 'Edit Client',
    },
    orders: {
      title: 'Orders', search: 'Search...', add: '+ New Order', noOrders: 'No orders',
      allStatus: 'All statuses', client: 'Client',
      description: 'Order description', deadline: 'Due date (YYYY-MM-DD)',
      price: 'Price (MAD)', paid: 'Payment received',
      notes: 'Internal notes', save: 'Save', cancel: 'Cancel',
      noClient: 'No clients. Create a client first.',
      addTitle: 'New Order', editTitle: 'Edit Order',
      whatsapp: 'Send WhatsApp', deleteConfirm: 'Delete this order?',
      source: 'Source', sourceShop: 'In-shop', sourceOnline: 'Online', sourcePhone: 'Phone',
      daysOld: 'days without delivery ⚠️', analyzing: 'Analyzing...',
    },
    status: { pending: 'Pending', inprogress: 'In progress', done: 'Done', delivered: 'Delivered', forgotten: 'Forgotten ⚠️' },
    inventory: {
      title: 'Inventory', search: 'Search...', add: '+ New Product', noItems: 'No products',
      addTitle: 'New Product', editTitle: 'Edit Product',
      name: 'Product name', category: 'Category',
      buyPrice: 'Buy price (MAD)', sellPrice: 'Sell price (MAD)',
      stock: 'Quantity', unit: 'Unit',
      notes: 'Notes', save: 'Save', cancel: 'Cancel',
      margin: 'Margin', lowStock: 'Low stock',
      categories: { fabric: 'Fabrics', thread: 'Thread', needle: 'Needles', ready: 'Clothing', accessory: 'Accessories', other: 'Other' },
      allCats: 'All categories', deleteConfirm: 'Delete this product?',
      sell: 'Record sale', sellQty: 'Quantity sold',
    },
    finance: {
      title: 'Finance', thisMonth: 'This month', allTime: 'All time',
      revenue: 'Revenue', expenses: 'Expenses', profit: 'Net profit',
      addExpense: '+ Expense', addIncome: '+ Income',
      noTransactions: 'No transactions',
      expenseTitle: 'New Expense', incomeTitle: 'Manual Income',
      description: 'Description', amount: 'Amount (MAD)',
      category: 'Category', date: 'Date (YYYY-MM-DD)',
      save: 'Save', cancel: 'Cancel',
      categories: { order: 'Order', sale: 'Product sale', purchase: 'Stock purchase', rent: 'Rent', utility: 'Utilities', salary: 'Salary', other: 'Other' },
      type: { income: 'Income', expense: 'Expense' },
      deleteConfirm: 'Delete this transaction?',
    },
    settings: {
      title: 'Settings', language: 'Language',
      shopName: 'Shop name', ownerPhone: 'Owner phone',
      save: 'Save settings', saved: 'Saved ✓',
    },
    common: { loading: 'Loading...', error: 'Error', close: 'Close', cm: 'cm', mad: 'MAD' },
  },
};

// ═══════════════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════════════
const C = {
  bg: '#0f0e17', card: '#1a1828', cardBorder: '#2d2a45',
  accent: '#c084fc', accentDark: '#7c3aed', accentGlow: 'rgba(192,132,252,0.15)',
  gold: '#fbbf24', goldBg: 'rgba(251,191,36,0.1)',
  text: '#f8f7ff', textMid: '#a8a4c8', textDim: '#6b6890',
  danger: '#f87171', dangerBg: 'rgba(248,113,113,0.1)',
  success: '#34d399', successBg: 'rgba(52,211,153,0.1)',
  info: '#60a5fa', infoBg: 'rgba(96,165,250,0.1)',
};

const STATUS_COLORS = {
  pending:    { c: '#f59e0b', bg: '#fef3c7', border: '#fbbf24' },
  inprogress: { c: '#3b82f6', bg: '#dbeafe', border: '#60a5fa' },
  done:       { c: '#10b981', bg: '#d1fae5', border: '#34d399' },
  delivered:  { c: '#6b7280', bg: '#f3f4f6', border: '#9ca3af' },
  forgotten:  { c: '#ef4444', bg: '#fee2e2', border: '#f87171' },
};

// ═══════════════════════════════════════════════════════════════
// STORAGE & DATA HOOK
// ═══════════════════════════════════════════════════════════════
const SK = 'atelier_v2';
const SETTINGS_KEY = 'atelier_settings';
const defaultData = { customers: [], orders: [], inventory: [], transactions: [] };
const defaultSettings = { lang: 'ar', shopName: 'أتيليه', ownerPhone: '' };

function daysSince(iso) {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}
function today() { return new Date().toISOString().split('T')[0]; }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function useData() {
  const [data, setData] = useState(defaultData);
  const [settings, setSettings] = useState(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const d = await AsyncStorage.getItem(SK);
        const s = await AsyncStorage.getItem(SETTINGS_KEY);
        if (d) setData(p => ({ ...defaultData, ...JSON.parse(d) }));
        if (s) setSettings(p => ({ ...defaultSettings, ...JSON.parse(s) }));
      } catch {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(SK, JSON.stringify(data));
  }, [data, loaded]);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, loaded]);

  const addTransaction = useCallback((t) => {
    const n = { ...t, id: uid(), createdAt: new Date().toISOString() };
    setData(d => ({ ...d, transactions: [...d.transactions, n] }));
  }, []);

  const addCustomer = useCallback((c) => {
    const n = { ...c, id: uid(), createdAt: new Date().toISOString() };
    setData(d => ({ ...d, customers: [...d.customers, n] }));
    return n.id;
  }, []);
  const updateCustomer = useCallback((id, u) =>
    setData(d => ({ ...d, customers: d.customers.map(c => c.id === id ? { ...c, ...u } : c) })), []);
  const deleteCustomer = useCallback((id) =>
    setData(d => ({ ...d, customers: d.customers.filter(c => c.id !== id), orders: d.orders.filter(o => o.customerId !== id) })), []);

  const addOrder = useCallback((o) => {
    const n = { ...o, id: uid(), createdAt: new Date().toISOString() };
    setData(d => ({ ...d, orders: [...d.orders, n] }));
    if (o.price && o.paid) addTransaction({ type: 'income', category: 'order', description: `طلب - ${o.description?.slice(0, 30)}`, amount: parseFloat(o.price), date: today() });
    return n.id;
  }, [addTransaction]);

  const updateOrder = useCallback((id, u) =>
    setData(d => ({ ...d, orders: d.orders.map(o => o.id === id ? { ...o, ...u } : o) })), []);
  const deleteOrder = useCallback((id) =>
    setData(d => ({ ...d, orders: d.orders.filter(o => o.id !== id) })), []);

  const addInventoryItem = useCallback((item) => {
    const n = { ...item, id: uid(), createdAt: new Date().toISOString() };
    setData(d => ({ ...d, inventory: [...d.inventory, n] }));
  }, []);
  const updateInventoryItem = useCallback((id, u) =>
    setData(d => ({ ...d, inventory: d.inventory.map(i => i.id === id ? { ...i, ...u } : i) })), []);
  const deleteInventoryItem = useCallback((id) =>
    setData(d => ({ ...d, inventory: d.inventory.filter(i => i.id !== id) })), []);
  const sellInventoryItem = useCallback((id, qty, item) => {
    updateInventoryItem(id, { stock: Math.max(0, (parseFloat(item.stock) || 0) - qty) });
    addTransaction({ type: 'income', category: 'sale', description: `بيع: ${item.name}`, amount: (item.sellPrice || 0) * qty, date: today() });
  }, [updateInventoryItem, addTransaction]);

  const deleteTransaction = useCallback((id) =>
    setData(d => ({ ...d, transactions: d.transactions.filter(t => t.id !== id) })), []);
  const saveSettings = useCallback((s) => setSettings(p => ({ ...p, ...s })), []);

  return {
    data, settings, loaded,
    addCustomer, updateCustomer, deleteCustomer,
    addOrder, updateOrder, deleteOrder,
    addInventoryItem, updateInventoryItem, deleteInventoryItem, sellInventoryItem,
    addTransaction, deleteTransaction, saveSettings,
  };
}

// ═══════════════════════════════════════════════════════════════
// WHATSAPP
// ═══════════════════════════════════════════════════════════════
async function generateWhatsAppMsg(order, customer, lang) {
  const langNames = { ar: 'Arabic', fr: 'French', en: 'English' };
  const prompt = `Generate a short WhatsApp message from a sewing shop to notify a customer their order is ready.\nCustomer: ${customer?.name}\nOrder: ${order.description}\nPrice: ${order.price ? order.price + ' MAD' : 'not specified'}\nPaid: ${order.paid ? 'yes' : 'no'}\nWrite ONLY the message in ${langNames[lang] || 'Arabic'}. 2-3 sentences max.`;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 200, messages: [{ role: 'user', content: prompt }] }),
    });
    const d = await res.json();
    return d.content?.[0]?.text || '';
  } catch { return ''; }
}

// ═══════════════════════════════════════════════════════════════
// BASE COMPONENTS
// ═══════════════════════════════════════════════════════════════
function Btn({ children, variant = 'primary', full, small, onPress, disabled, style }) {
  const vs = {
    primary: { backgroundColor: C.accentDark, borderWidth: 0 },
    secondary: { backgroundColor: C.card, borderWidth: 1, borderColor: C.cardBorder },
    danger: { backgroundColor: C.dangerBg, borderWidth: 1, borderColor: C.danger + '66' },
    success: { backgroundColor: C.successBg, borderWidth: 1, borderColor: C.success + '66' },
    ghost: { backgroundColor: 'transparent', borderWidth: 0 },
    gold: { backgroundColor: C.goldBg, borderWidth: 1, borderColor: C.gold + '66' },
  };
  const tc = {
    primary: C.text, secondary: C.text, danger: C.danger,
    success: C.success, ghost: C.textMid, gold: C.gold,
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.btn,
        vs[variant],
        small && styles.btnSmall,
        full && styles.btnFull,
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Text style={[styles.btnText, { color: tc[variant] }, small && { fontSize: 12 }]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

function Inp({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry, multiline, rtl }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        style={[styles.input, focused && { borderColor: C.accent }, multiline && { minHeight: 80, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || ''}
        placeholderTextColor={C.textDim}
        keyboardType={keyboardType || 'default'}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        textAlign={rtl ? 'right' : 'left'}
      />
    </View>
  );
}

function SegmentedPicker({ label, options, value, onChange }) {
  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {options.map(o => (
            <TouchableOpacity
              key={o.value}
              onPress={() => onChange(o.value)}
              style={[
                styles.segBtn,
                value === o.value && { backgroundColor: C.accentDark, borderColor: C.accent },
              ]}
            >
              <Text style={[styles.segText, value === o.value && { color: C.text }]}>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Badge({ status, t }) {
  const m = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <View style={{ backgroundColor: m.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: m.border + '66' }}>
      <Text style={{ color: m.c, fontSize: 11, fontWeight: '700' }}>{t.status[status] || status}</Text>
    </View>
  );
}

function Card({ children, style, danger }) {
  return (
    <View style={[styles.card, danger && { borderColor: C.danger + '60' }, style]}>
      {children}
    </View>
  );
}

function StatCard({ icon, label, value, color, sub }) {
  return (
    <View style={[styles.card, { flex: 1, alignItems: 'center', paddingVertical: 14 }]}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={{ fontSize: 22, fontWeight: '900', color: color || C.accent, marginTop: 2 }}>{value}</Text>
      <Text style={{ fontSize: 10, color: C.textMid, marginTop: 2, fontWeight: '600' }}>{label}</Text>
      {sub ? <Text style={{ fontSize: 10, color: C.textDim }}>{sub}</Text> : null}
    </View>
  );
}

function AppModal({ visible, title, onClose, children }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: C.textMid, fontSize: 24, lineHeight: 28 }}>×</Text>
            </TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// FORMS
// ═══════════════════════════════════════════════════════════════
function CustomerForm({ initial = {}, onSubmit, onCancel, t }) {
  const [f, setF] = useState({ name: '', phone: '', height: '', chest: '', waist: '', hips: '', shoulder: '', sleeve: '', notes: '', ...initial });
  const set = k => v => setF(p => ({ ...p, [k]: v }));
  const tc = t.customers;
  const rtl = t.dir === 'rtl';
  return (
    <View style={{ paddingBottom: 20 }}>
      <Inp label={tc.name + ' *'} value={f.name} onChangeText={set('name')} rtl={rtl} />
      <Inp label={tc.phone} value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
      <Text style={[styles.fieldLabel, { marginBottom: 10, marginTop: 4 }]}>{tc.measurements}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 0 }}>
        {[['height', 'cm'], ['chest', 'cm'], ['waist', 'cm'], ['hips', 'cm'], ['shoulder', 'cm'], ['sleeve', 'cm']].map(([k]) => (
          <View key={k} style={{ width: '50%', paddingRight: k === 'height' || k === 'waist' || k === 'shoulder' ? 6 : 0, paddingLeft: k === 'chest' || k === 'hips' || k === 'sleeve' ? 6 : 0 }}>
            <Inp label={`${tc[k]} (cm)`} value={f[k]} onChangeText={set(k)} keyboardType="numeric" />
          </View>
        ))}
      </View>
      <Inp label={tc.notes} value={f.notes} onChangeText={set('notes')} multiline rtl={rtl} />
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <Btn variant="secondary" onPress={onCancel}>{tc.cancel}</Btn>
        <Btn onPress={() => { if (f.name.trim()) onSubmit(f); else Alert.alert('', tc.nameRequired); }}>{tc.save}</Btn>
      </View>
    </View>
  );
}

function OrderForm({ customers, initial = {}, onSubmit, onCancel, t, lang }) {
  const [f, setF] = useState({ customerId: customers[0]?.id || '', description: '', dueDate: '', price: '', paid: false, status: 'pending', notes: '', source: 'shop', ...initial });
  const set = k => v => setF(p => ({ ...p, [k]: v }));
  const to = t.orders;
  const rtl = t.dir === 'rtl';
  const statusOpts = Object.entries(t.status).map(([v, l]) => ({ value: v, label: l }));
  const sourceOpts = [{ value: 'shop', label: to.sourceShop }, { value: 'online', label: to.sourceOnline }, { value: 'phone', label: to.sourcePhone }];
  return (
    <View style={{ paddingBottom: 20 }}>
      <SegmentedPicker label={to.client} options={customers.map(c => ({ value: c.id, label: c.name }))} value={f.customerId} onChange={set('customerId')} />
      <Inp label={to.description} value={f.description} onChangeText={set('description')} multiline rtl={rtl} />
      <Inp label={to.deadline} value={f.dueDate} onChangeText={set('dueDate')} placeholder="2025-12-31" />
      <Inp label={to.price} value={f.price} onChangeText={set('price')} keyboardType="numeric" />
      <SegmentedPicker label={to.source} options={sourceOpts} value={f.source} onChange={set('source')} />
      <SegmentedPicker label="Status" options={statusOpts} value={f.status} onChange={set('status')} />
      <TouchableOpacity onPress={() => set('paid')(!f.paid)} style={[styles.checkRow, f.paid && { borderColor: C.success + '66', backgroundColor: C.successBg }]}>
        <View style={[styles.checkbox, f.paid && { backgroundColor: C.success, borderColor: C.success }]}>
          {f.paid ? <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text> : null}
        </View>
        <Text style={{ color: C.text, fontSize: 14, fontWeight: '500' }}>{to.paid}</Text>
      </TouchableOpacity>
      <Inp label={to.notes} value={f.notes} onChangeText={set('notes')} multiline rtl={rtl} />
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <Btn variant="secondary" onPress={onCancel}>{to.cancel}</Btn>
        <Btn onPress={() => { if (f.customerId && f.description.trim()) onSubmit(f); }}>{to.save}</Btn>
      </View>
    </View>
  );
}

function InventoryForm({ initial = {}, onSubmit, onCancel, t }) {
  const [f, setF] = useState({ name: '', category: 'fabric', buyPrice: '', sellPrice: '', stock: '', unit: 'قطعة', notes: '', ...initial });
  const set = k => v => setF(p => ({ ...p, [k]: v }));
  const ti = t.inventory;
  const rtl = t.dir === 'rtl';
  const catOpts = Object.entries(ti.categories).map(([v, l]) => ({ value: v, label: l }));
  const margin = f.buyPrice && f.sellPrice ? Math.round(((f.sellPrice - f.buyPrice) / f.buyPrice) * 100) : null;
  return (
    <View style={{ paddingBottom: 20 }}>
      <Inp label={ti.name + ' *'} value={f.name} onChangeText={set('name')} rtl={rtl} />
      <SegmentedPicker label={ti.category} options={catOpts} value={f.category} onChange={set('category')} />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}><Inp label={ti.buyPrice} value={f.buyPrice} onChangeText={set('buyPrice')} keyboardType="numeric" /></View>
        <View style={{ flex: 1 }}><Inp label={ti.sellPrice} value={f.sellPrice} onChangeText={set('sellPrice')} keyboardType="numeric" /></View>
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}><Inp label={ti.stock} value={f.stock} onChangeText={set('stock')} keyboardType="numeric" /></View>
        <View style={{ flex: 1 }}><Inp label={ti.unit} value={f.unit} onChangeText={set('unit')} rtl={rtl} /></View>
      </View>
      {margin !== null && (
        <View style={{ backgroundColor: C.successBg, borderRadius: 8, padding: 10, marginBottom: 12 }}>
          <Text style={{ color: C.success, fontSize: 13 }}>{ti.margin}: {margin}%</Text>
        </View>
      )}
      <Inp label={ti.notes} value={f.notes} onChangeText={set('notes')} multiline rtl={rtl} />
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <Btn variant="secondary" onPress={onCancel}>{ti.cancel}</Btn>
        <Btn onPress={() => { if (f.name.trim()) onSubmit(f); }}>{ti.save}</Btn>
      </View>
    </View>
  );
}

function TransactionForm({ type, onSubmit, onCancel, t }) {
  const [f, setF] = useState({ description: '', amount: '', category: type === 'income' ? 'order' : 'purchase', date: today() });
  const set = k => v => setF(p => ({ ...p, [k]: v }));
  const tf = t.finance;
  const rtl = t.dir === 'rtl';
  const catOpts = Object.entries(tf.categories).map(([v, l]) => ({ value: v, label: l }));
  return (
    <View style={{ paddingBottom: 20 }}>
      <Inp label={tf.description + ' *'} value={f.description} onChangeText={set('description')} rtl={rtl} />
      <Inp label={tf.amount + ' *'} value={f.amount} onChangeText={set('amount')} keyboardType="numeric" />
      <SegmentedPicker label={tf.category} options={catOpts} value={f.category} onChange={set('category')} />
      <Inp label={tf.date} value={f.date} onChangeText={set('date')} placeholder="2025-01-01" />
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <Btn variant="secondary" onPress={onCancel}>{tf.cancel}</Btn>
        <Btn onPress={() => { if (f.description.trim() && f.amount) onSubmit({ ...f, type }); }}>{tf.save}</Btn>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// VIEWS
// ═══════════════════════════════════════════════════════════════
function Dashboard({ data, t }) {
  const td = t.dashboard;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthTx = data.transactions.filter(tx => tx.createdAt?.startsWith(thisMonth));
  const revenue = monthTx.filter(tx => tx.type === 'income').reduce((s, tx) => s + (parseFloat(tx.amount) || 0), 0);
  const expenses = monthTx.filter(tx => tx.type === 'expense').reduce((s, tx) => s + (parseFloat(tx.amount) || 0), 0);
  const profit = revenue - expenses;
  const forgotten = data.orders.filter(o => daysSince(o.createdAt) > 90 && o.status !== 'delivered').length;
  const pending = data.orders.filter(o => ['pending', 'inprogress'].includes(o.status)).length;
  const unpaid = data.orders.filter(o => !o.paid && o.status !== 'delivered').length;
  const done = data.orders.filter(o => ['done', 'delivered'].includes(o.status)).length;
  const recent = [...data.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={{ backgroundColor: C.accentDark, padding: 20, paddingTop: 24 }}>
        <Text style={{ fontSize: 11, color: C.accent, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>{t.appSub}</Text>
        <Text style={{ fontSize: 26, fontWeight: '900', color: C.text, marginTop: 2 }}>{t.appName}</Text>
      </View>
      {forgotten > 0 && (
        <View style={{ margin: 16, marginBottom: 0, backgroundColor: C.dangerBg, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: C.danger + '40' }}>
          <Text style={{ fontSize: 18 }}>⚠️</Text>
          <Text style={{ color: C.danger, fontSize: 13, flex: 1 }}><Text style={{ fontWeight: '700' }}>{forgotten}</Text> {td.forgottenAlert}</Text>
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 8 }}>
        <StatCard icon="👥" label={td.clients} value={data.customers.length} color={C.accent} />
        <StatCard icon="⏳" label={td.pending} value={pending} color={C.gold} />
        <StatCard icon="💸" label={td.unpaid} value={unpaid} color={C.danger} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 8 }}>
        <StatCard icon="✅" label={td.done} value={done} color={C.success} />
        <StatCard icon="📋" label={td.orders} value={data.orders.length} color={C.info} />
        <StatCard icon="⚠️" label={td.forgotten} value={forgotten} color={C.danger} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 16 }}>
        <StatCard icon="💰" label={td.revenue} value={revenue.toFixed(0)} color={C.success} sub="MAD" />
        <StatCard icon="💸" label={td.expenses} value={expenses.toFixed(0)} color={C.danger} sub="MAD" />
        <StatCard icon="📈" label={td.profit} value={profit.toFixed(0)} color={profit >= 0 ? C.success : C.danger} sub="MAD" />
      </View>
      <Text style={[styles.sectionLabel, { marginHorizontal: 16 }]}>{td.recentOrders}</Text>
      {recent.length === 0
        ? <Text style={{ color: C.textDim, textAlign: 'center', padding: 24 }}>{td.noOrders}</Text>
        : recent.map(o => {
            const cust = data.customers.find(c => c.id === o.customerId);
            const days = daysSince(o.createdAt);
            return (
              <Card key={o.id} style={{ marginHorizontal: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }} numberOfLines={1}>{cust?.name || '?'}</Text>
                  <Text style={{ fontSize: 12, color: C.textMid }} numberOfLines={1}>{o.description}</Text>
                  <Text style={{ fontSize: 11, color: C.textDim }}>{days}d</Text>
                </View>
                <Badge status={o.status} t={t} />
              </Card>
            );
          })}
    </ScrollView>
  );
}

function CustomersView({ data, addCustomer, updateCustomer, deleteCustomer, onSelectCustomer, t }) {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const tc = t.customers;
  const rtl = t.dir === 'rtl';
  const MEAS = ['height', 'chest', 'waist', 'hips', 'shoulder', 'sleeve'];
  const filtered = useMemo(() => data.customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone || '').includes(search)
  ), [data.customers, search]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 8 }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder={tc.search}
          placeholderTextColor={C.textDim}
          value={search}
          onChangeText={setSearch}
          textAlign={rtl ? 'right' : 'left'}
        />
        <Btn onPress={() => setModal('add')}>{tc.add}</Btn>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={c => c.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 100 }}
        ListEmptyComponent={<Text style={{ color: C.textDim, textAlign: 'center', padding: 40 }}>{tc.noCustomers}</Text>}
        renderItem={({ item: c }) => {
          const orderCount = data.orders.filter(o => o.customerId === c.id).length;
          return (
            <Card style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: C.text }}>{c.name}</Text>
                  {c.phone ? <Text style={{ fontSize: 13, color: C.accent }}>{c.phone}</Text> : null}
                  <Text style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{orderCount} {tc.orders}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <Btn small variant="gold" onPress={() => onSelectCustomer(c.id)}>📋</Btn>
                  <Btn small variant="secondary" onPress={() => setModal(c.id)}>✏️</Btn>
                  <Btn small variant="danger" onPress={() => Alert.alert('', tc.confirmDelete, [
                    { text: tc.cancel, style: 'cancel' },
                    { text: tc.delete, style: 'destructive', onPress: () => deleteCustomer(c.id) },
                  ])}>🗑️</Btn>
                </View>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {MEAS.filter(k => c[k]).map(k => (
                  <View key={k} style={{ backgroundColor: '#13111f', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: C.cardBorder }}>
                    <Text style={{ fontSize: 12, color: C.textMid }}>{tc[k]}: <Text style={{ color: C.text, fontWeight: '700' }}>{c[k]}cm</Text></Text>
                  </View>
                ))}
                {!MEAS.some(k => c[k]) && <Text style={{ fontSize: 12, color: C.textDim }}>{tc.noMeasurements}</Text>}
              </View>
              {c.notes ? <Text style={{ marginTop: 8, fontSize: 12, color: C.textDim, fontStyle: 'italic' }}>{c.notes}</Text> : null}
            </Card>
          );
        }}
      />
      <AppModal visible={modal === 'add'} title={tc.addTitle} onClose={() => setModal(null)}>
        <CustomerForm onSubmit={f => { addCustomer(f); setModal(null); }} onCancel={() => setModal(null)} t={t} />
      </AppModal>
      <AppModal visible={!!modal && modal !== 'add'} title={tc.editTitle} onClose={() => setModal(null)}>
        <CustomerForm initial={data.customers.find(c => c.id === modal)} onSubmit={f => { updateCustomer(modal, f); setModal(null); }} onCancel={() => setModal(null)} t={t} />
      </AppModal>
    </View>
  );
}

function OrdersView({ data, addOrder, updateOrder, deleteOrder, filterCustomerId, onClearFilter, t, lang }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [waModal, setWaModal] = useState(null);
  const [loadingWa, setLoadingWa] = useState(null);
  const to = t.orders;
  const rtl = t.dir === 'rtl';

  const filtered = useMemo(() => {
    let orders = data.orders;
    if (filterCustomerId) orders = orders.filter(o => o.customerId === filterCustomerId);
    if (statusFilter !== 'all') orders = orders.filter(o => o.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(o => {
        const c = data.customers.find(x => x.id === o.customerId);
        return (c?.name || '').toLowerCase().includes(q) || o.description.toLowerCase().includes(q);
      });
    }
    return [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [data.orders, data.customers, filterCustomerId, statusFilter, search]);

  const filterCust = filterCustomerId ? data.customers.find(c => c.id === filterCustomerId) : null;
  const statusOpts = [{ value: 'all', label: to.allStatus }, ...Object.entries(t.status).map(([v, l]) => ({ value: v, label: l }))];

  const openWhatsapp = async (order) => {
    setLoadingWa(order.id);
    const customer = data.customers.find(c => c.id === order.customerId);
    const msg = await generateWhatsAppMsg(order, customer, lang);
    setLoadingWa(null);
    setWaModal({ order, customer, msg });
  };

  const sendWhatsapp = (phone, msg) => {
    const clean = phone.replace(/\D/g, '');
    const num = clean.startsWith('0') ? '212' + clean.slice(1) : clean;
    Linking.openURL(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`);
  };

  return (
    <View style={{ flex: 1 }}>
      {filterCust && (
        <View style={{ margin: 16, marginBottom: 0, backgroundColor: C.accentGlow, borderRadius: 10, padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: C.accent + '40' }}>
          <Text style={{ fontSize: 13, color: C.accent, fontWeight: '600' }}>{filterCust.name}</Text>
          <Btn small variant="ghost" onPress={onClearFilter}>× Clear</Btn>
        </View>
      )}
      <View style={{ padding: 16, paddingBottom: 8, gap: 8 }}>
        <TextInput
          style={styles.input}
          placeholder={to.search}
          placeholderTextColor={C.textDim}
          value={search}
          onChangeText={setSearch}
          textAlign={rtl ? 'right' : 'left'}
        />
        <SegmentedPicker options={statusOpts} value={statusFilter} onChange={setStatusFilter} />
      </View>
      {data.customers.length === 0 && (
        <View style={{ marginHorizontal: 16, backgroundColor: C.goldBg, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: C.gold + '40', marginBottom: 8 }}>
          <Text style={{ color: C.gold, fontSize: 13 }}>{to.noClient}</Text>
        </View>
      )}
      <Btn full onPress={() => setModal('add')} disabled={data.customers.length === 0} style={{ marginHorizontal: 16, marginBottom: 8 }}>{to.add}</Btn>
      <FlatList
        data={filtered}
        keyExtractor={o => o.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        ListEmptyComponent={<Text style={{ color: C.textDim, textAlign: 'center', padding: 40 }}>{to.noOrders}</Text>}
        renderItem={({ item: o }) => {
          const cust = data.customers.find(c => c.id === o.customerId);
          const days = daysSince(o.createdAt);
          const isOld = days > 90 && o.status !== 'delivered';
          return (
            <Card style={{ marginBottom: 10 }} danger={isOld}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: C.text }}>{cust?.name || '?'}</Text>
                    <Badge status={o.status} t={t} />
                    <View style={{ backgroundColor: o.paid ? C.successBg : C.dangerBg, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ color: o.paid ? C.success : C.danger, fontSize: 11, fontWeight: '700' }}>{o.paid ? '✓' : '✗'}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 13, color: C.text }} numberOfLines={2}>{o.description}</Text>
                  <Text style={{ fontSize: 11, color: isOld ? C.danger : C.textDim, marginTop: 4 }}>
                    {isOld ? `⚠️ ${days} ${to.daysOld}` : `${days}d`}{o.price ? ` · ${o.price} MAD` : ''}
                  </Text>
                </View>
                <View style={{ gap: 5 }}>
                  <Btn small variant="secondary" onPress={() => setModal(o.id)}>✏️</Btn>
                  <Btn small variant="danger" onPress={() => Alert.alert('', to.deleteConfirm, [
                    { text: to.cancel, style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteOrder(o.id) },
                  ])}>🗑️</Btn>
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  {Object.entries(t.status).map(([v, l]) => {
                    const m = STATUS_COLORS[v];
                    return (
                      <TouchableOpacity key={v} onPress={() => updateOrder(o.id, { status: v })}
                        style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: o.status === v ? m.bg : '#13111f', borderWidth: 1, borderColor: o.status === v ? m.border : C.cardBorder }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: o.status === v ? m.c : C.textDim }}>{l}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
              {(o.status === 'done' || o.status === 'delivered') && cust?.phone && (
                <Btn full variant="success" onPress={() => openWhatsapp(o)} disabled={loadingWa === o.id}>
                  {loadingWa === o.id ? t.common.loading : `📱 ${to.whatsapp}`}
                </Btn>
              )}
            </Card>
          );
        }}
      />
      <AppModal visible={modal === 'add'} title={to.addTitle} onClose={() => setModal(null)}>
        <OrderForm customers={data.customers} initial={filterCustomerId ? { customerId: filterCustomerId } : {}} onSubmit={f => { addOrder(f); setModal(null); }} onCancel={() => setModal(null)} t={t} lang={lang} />
      </AppModal>
      <AppModal visible={!!modal && modal !== 'add'} title={to.editTitle} onClose={() => setModal(null)}>
        <OrderForm customers={data.customers} initial={data.orders.find(o => o.id === modal)} onSubmit={f => { updateOrder(modal, f); setModal(null); }} onCancel={() => setModal(null)} t={t} lang={lang} />
      </AppModal>
      <AppModal visible={!!waModal} title={`📱 WhatsApp → ${waModal?.customer?.name}`} onClose={() => setWaModal(null)}>
        {waModal && (
          <View style={{ paddingBottom: 20 }}>
            <Inp label="Message" value={waModal.msg} onChangeText={v => setWaModal(w => ({ ...w, msg: v }))} multiline />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <Btn variant="secondary" onPress={() => setWaModal(null)}>{t.common.close}</Btn>
              <Btn full variant="success" onPress={() => { sendWhatsapp(waModal.customer?.phone, waModal.msg); setWaModal(null); }}>📱 {to.whatsapp}</Btn>
            </View>
          </View>
        )}
      </AppModal>
    </View>
  );
}

function InventoryView({ data, addInventoryItem, updateInventoryItem, deleteInventoryItem, sellInventoryItem, t }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [sellModal, setSellModal] = useState(null);
  const [sellQty, setSellQty] = useState('1');
  const ti = t.inventory;
  const rtl = t.dir === 'rtl';

  const filtered = useMemo(() => {
    let items = data.inventory;
    if (catFilter !== 'all') items = items.filter(i => i.category === catFilter);
    if (search) items = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [data.inventory, catFilter, search]);

  const totalValue = data.inventory.reduce((s, i) => s + (parseFloat(i.sellPrice) || 0) * (parseFloat(i.stock) || 0), 0);
  const catOpts = [{ value: 'all', label: ti.allCats }, ...Object.entries(ti.categories).map(([v, l]) => ({ value: v, label: l }))];

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View>
            <Text style={{ fontSize: 11, color: C.textMid, fontWeight: '600', textTransform: 'uppercase' }}>Total stock</Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: C.gold }}>{totalValue.toFixed(0)} MAD</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: C.textMid, fontWeight: '600', textTransform: 'uppercase' }}>{ti.lowStock}</Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: C.danger }}>{data.inventory.filter(i => parseFloat(i.stock) <= 2).length}</Text>
          </View>
          <Btn onPress={() => setModal('add')}>{ti.add}</Btn>
        </Card>
        <TextInput
          style={[styles.input, { marginBottom: 8 }]}
          placeholder={ti.search}
          placeholderTextColor={C.textDim}
          value={search}
          onChangeText={setSearch}
          textAlign={rtl ? 'right' : 'left'}
        />
        <SegmentedPicker options={catOpts} value={catFilter} onChange={setCatFilter} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        ListEmptyComponent={<Text style={{ color: C.textDim, textAlign: 'center', padding: 40 }}>{ti.noItems}</Text>}
        renderItem={({ item }) => {
          const margin = item.buyPrice && item.sellPrice ? Math.round(((item.sellPrice - item.buyPrice) / item.buyPrice) * 100) : null;
          const lowStock = parseFloat(item.stock) <= 2;
          return (
            <Card style={{ marginBottom: 10 }} danger={lowStock}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: C.text }}>{item.name}</Text>
                    <View style={{ backgroundColor: C.accentGlow, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ color: C.accent, fontSize: 11, fontWeight: '700' }}>{ti.categories[item.category] || item.category}</Text>
                    </View>
                    {lowStock && <View style={{ backgroundColor: C.dangerBg, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ color: C.danger, fontSize: 11, fontWeight: '700' }}>⚠️ {ti.lowStock}</Text>
                    </View>}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                    {item.buyPrice ? <Text style={{ fontSize: 13, color: C.textMid }}>↓ {item.buyPrice} MAD</Text> : null}
                    {item.sellPrice ? <Text style={{ fontSize: 13, color: C.success }}>↑ {item.sellPrice} MAD</Text> : null}
                    {margin !== null ? <Text style={{ fontSize: 13, color: C.gold }}>{margin}%</Text> : null}
                  </View>
                  <Text style={{ fontSize: 13, color: lowStock ? C.danger : C.text, marginTop: 4, fontWeight: '700' }}>{item.stock} {item.unit}</Text>
                </View>
                <View style={{ gap: 5 }}>
                  <Btn small variant="success" onPress={() => { setSellModal(item); setSellQty('1'); }}>💰</Btn>
                  <Btn small variant="secondary" onPress={() => setModal(item.id)}>✏️</Btn>
                  <Btn small variant="danger" onPress={() => Alert.alert('', ti.deleteConfirm, [
                    { text: ti.cancel, style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteInventoryItem(item.id) },
                  ])}>🗑️</Btn>
                </View>
              </View>
              {item.notes ? <Text style={{ marginTop: 6, fontSize: 12, color: C.textDim, fontStyle: 'italic' }}>{item.notes}</Text> : null}
            </Card>
          );
        }}
      />
      <AppModal visible={modal === 'add'} title={ti.addTitle} onClose={() => setModal(null)}>
        <InventoryForm onSubmit={f => { addInventoryItem(f); setModal(null); }} onCancel={() => setModal(null)} t={t} />
      </AppModal>
      <AppModal visible={!!modal && modal !== 'add'} title={ti.editTitle} onClose={() => setModal(null)}>
        <InventoryForm initial={data.inventory.find(i => i.id === modal)} onSubmit={f => { updateInventoryItem(modal, f); setModal(null); }} onCancel={() => setModal(null)} t={t} />
      </AppModal>
      <AppModal visible={!!sellModal} title={`💰 ${ti.sell}: ${sellModal?.name}`} onClose={() => setSellModal(null)}>
        {sellModal && (
          <View style={{ paddingBottom: 20 }}>
            <Inp label={ti.sellQty} value={sellQty} onChangeText={setSellQty} keyboardType="numeric" />
            {sellModal.sellPrice && (
              <View style={{ backgroundColor: C.successBg, borderRadius: 8, padding: 10, marginBottom: 14 }}>
                <Text style={{ color: C.success, fontSize: 14 }}>Total: {(parseFloat(sellModal.sellPrice) * parseFloat(sellQty || 1)).toFixed(0)} MAD</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Btn variant="secondary" onPress={() => setSellModal(null)}>{ti.cancel}</Btn>
              <Btn full variant="success" onPress={() => { sellInventoryItem(sellModal.id, parseFloat(sellQty) || 1, sellModal); setSellModal(null); }}>✓ {ti.sell}</Btn>
            </View>
          </View>
        )}
      </AppModal>
    </View>
  );
}

function FinanceView({ data, addTransaction, deleteTransaction, t }) {
  const [period, setPeriod] = useState('month');
  const [modal, setModal] = useState(null);
  const tf = t.finance;
  const thisMonth = new Date().toISOString().slice(0, 7);

  const txs = useMemo(() => {
    let list = [...data.transactions];
    if (period === 'month') list = list.filter(tx => tx.createdAt?.startsWith(thisMonth) || tx.date?.startsWith(thisMonth));
    return list.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }, [data.transactions, period]);

  const revenue = txs.filter(tx => tx.type === 'income').reduce((s, tx) => s + (parseFloat(tx.amount) || 0), 0);
  const expenses = txs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + (parseFloat(tx.amount) || 0), 0);
  const profit = revenue - expenses;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {[['month', tf.thisMonth], ['all', tf.allTime]].map(([v, l]) => (
            <Btn key={v} variant={period === v ? 'primary' : 'secondary'} small onPress={() => setPeriod(v)}>{l}</Btn>
          ))}
          <View style={{ flex: 1 }} />
          <Btn variant="success" small onPress={() => setModal('income')}>{tf.addIncome}</Btn>
          <Btn variant="danger" small onPress={() => setModal('expense')}>{tf.addExpense}</Btn>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <StatCard icon="💰" label={tf.revenue} value={revenue.toFixed(0)} color={C.success} sub="MAD" />
          <StatCard icon="💸" label={tf.expenses} value={expenses.toFixed(0)} color={C.danger} sub="MAD" />
          <StatCard icon="📈" label={tf.profit} value={profit.toFixed(0)} color={profit >= 0 ? C.success : C.danger} sub="MAD" />
        </View>
      </View>
      <FlatList
        data={txs}
        keyExtractor={tx => tx.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        ListEmptyComponent={<Text style={{ color: C.textDim, textAlign: 'center', padding: 40 }}>{tf.noTransactions}</Text>}
        renderItem={({ item: tx }) => (
          <Card style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }} numberOfLines={1}>{tx.description}</Text>
              <Text style={{ fontSize: 11, color: C.textDim }}>{tf.categories[tx.category] || tx.category} · {tx.date || tx.createdAt?.split('T')[0]}</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: '900', color: tx.type === 'income' ? C.success : C.danger }}>
              {tx.type === 'income' ? '+' : '-'}{parseFloat(tx.amount).toFixed(0)} MAD
            </Text>
            <Btn small variant="danger" onPress={() => Alert.alert('', tf.deleteConfirm, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(tx.id) },
            ])}>🗑️</Btn>
          </Card>
        )}
      />
      <AppModal visible={modal === 'income'} title={tf.incomeTitle} onClose={() => setModal(null)}>
        <TransactionForm type="income" onSubmit={f => { addTransaction(f); setModal(null); }} onCancel={() => setModal(null)} t={t} />
      </AppModal>
      <AppModal visible={modal === 'expense'} title={tf.expenseTitle} onClose={() => setModal(null)}>
        <TransactionForm type="expense" onSubmit={f => { addTransaction(f); setModal(null); }} onCancel={() => setModal(null)} t={t} />
      </AppModal>
    </View>
  );
}

function SettingsView({ settings, saveSettings, t }) {
  const [f, setF] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const ts = t.settings;
  const set = k => v => setF(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    saveSettings(f);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      <Inp label={ts.shopName} value={f.shopName} onChangeText={set('shopName')} />
      <Inp label={ts.ownerPhone} value={f.ownerPhone} onChangeText={set('ownerPhone')} keyboardType="phone-pad" />
      <Text style={[styles.fieldLabel, { marginBottom: 10, marginTop: 4 }]}>{ts.language}</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
        {[['ar', 'العربية'], ['fr', 'Français'], ['en', 'English']].map(([v, l]) => (
          <Btn key={v} variant={f.lang === v ? 'primary' : 'secondary'} onPress={() => set('lang')(v)}>{l}</Btn>
        ))}
      </View>
      <Btn full onPress={handleSave}>{saved ? ts.saved : ts.save}</Btn>
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const shop = useData();
  const [tab, setTab] = useState('home');
  const [customerFilter, setCustomerFilter] = useState(null);

  const lang = shop.settings.lang || 'ar';
  const t = T[lang] || T.ar;

  const tabs = [
    { id: 'home',      icon: '🏠', label: t.nav.home },
    { id: 'customers', icon: '👥', label: t.nav.clients },
    { id: 'orders',    icon: '📋', label: t.nav.orders },
    { id: 'inventory', icon: '📦', label: t.nav.inventory },
    { id: 'finance',   icon: '💰', label: t.nav.finance },
  ];

  const handleSelectCustomer = (id) => { setCustomerFilter(id); setTab('orders'); };
  const unread = shop.data.orders.filter(o => daysSince(o.createdAt) > 90 && o.status !== 'delivered').length;

  if (!shop.loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.card} />
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={{ fontSize: 18, fontWeight: '900', color: C.text }}>{t.appName}</Text>
          <Text style={{ fontSize: 11, color: C.textMid }}>{tabs.find(tb => tb.id === tab)?.label}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {unread > 0 && (
            <View style={{ backgroundColor: C.danger, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>⚠️ {unread}</Text>
            </View>
          )}
          <Btn small variant="ghost" onPress={() => setTab('settings')}>⚙️</Btn>
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {tab === 'home'      && <Dashboard data={shop.data} t={t} />}
        {tab === 'customers' && <CustomersView data={shop.data} addCustomer={shop.addCustomer} updateCustomer={shop.updateCustomer} deleteCustomer={shop.deleteCustomer} onSelectCustomer={handleSelectCustomer} t={t} />}
        {tab === 'orders'    && <OrdersView data={shop.data} addOrder={shop.addOrder} updateOrder={shop.updateOrder} deleteOrder={shop.deleteOrder} filterCustomerId={customerFilter} onClearFilter={() => setCustomerFilter(null)} t={t} lang={lang} />}
        {tab === 'inventory' && <InventoryView data={shop.data} addInventoryItem={shop.addInventoryItem} updateInventoryItem={shop.updateInventoryItem} deleteInventoryItem={shop.deleteInventoryItem} sellInventoryItem={shop.sellInventoryItem} t={t} />}
        {tab === 'finance'   && <FinanceView data={shop.data} addTransaction={shop.addTransaction} deleteTransaction={shop.deleteTransaction} t={t} />}
        {tab === 'settings'  && <SettingsView settings={shop.settings} saveSettings={shop.saveSettings} t={t} />}
      </View>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {tabs.map(tb => (
          <TouchableOpacity key={tb.id} onPress={() => setTab(tb.id)} style={styles.navItem} activeOpacity={0.7}>
            <Text style={{ fontSize: 22, opacity: tab === tb.id ? 1 : 0.4 }}>{tb.icon}</Text>
            <Text style={[styles.navLabel, { color: tab === tb.id ? C.accent : C.textDim }]}>{tb.label}</Text>
            {tab === tb.id && <View style={styles.navDot} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  header: {
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: C.cardBorder,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 2,
  },
  navLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  navDot: {
    width: 20,
    height: 2,
    backgroundColor: C.accent,
    borderRadius: 1,
  },
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 16,
    padding: 16,
  },
  input: {
    backgroundColor: '#13111f',
    borderWidth: 1.5,
    borderColor: C.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: C.text,
    fontSize: 14,
  },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMid,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  btn: {
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSmall: { paddingHorizontal: 12, paddingVertical: 6 },
  btnFull: { width: '100%' },
  btnText: { fontSize: 14, fontWeight: '700' },
  segBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#13111f',
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  segText: { fontSize: 13, color: C.textMid, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '92%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: C.cardBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: C.text },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    padding: 12,
    backgroundColor: '#13111f',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.cardBorder,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMid,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
});
