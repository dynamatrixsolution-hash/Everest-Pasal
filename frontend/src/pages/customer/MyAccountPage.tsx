// ==============================================================================
// EVEREST PASAL - CUSTOMER ACCOUNT PORTAL (MY ACCOUNT)
// Full Interactive Implementation Matching All Design Mockups (Images 1 - 10)
// Themes: Himalayan Blue (#0B4EA2), Nepali Crimson (#E63946), Warm Stone (#FAF8F5)
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useRouter, Link } from '../../router/index.js';

type AccountTab =
  | 'overview'
  | 'profile'
  | 'addresses'
  | 'orders'
  | 'wishlist'
  | 'reviews'
  | 'payments'
  | 'notifications'
  | 'supports';

type OrderSubTab = 'pending' | 'completed' | 'cancelled' | 'history';

interface OrderItem {
  id: string;
  sku: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
  category?: string;
}

interface MockOrder {
  id: string;
  orderNumber: string;
  placedDate: string;
  deliveredDate?: string;
  deliveryDuration?: string;
  cancelledDate?: string;
  cancellationReason?: string;
  refundStatus?: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  title: string;
  items: OrderItem[];
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  shippingAddress: string;
  deliveryCity: string;
  statusBadgeText: string;
  statusBadgeType: 'delivered' | 'cancelled' | 'pending' | 'shipped';
  amountSubtext: 'Total paid' | 'Refunded' | 'Not charged' | 'Total' | 'Pending';
}

interface AddressItem {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  area: string;
  isDefault?: boolean;
}

interface WishlistItem {
  id: string;
  brand: string;
  name: string;
  rating: number;
  reviewsCount: number;
  price: number;
  originalPrice: number;
  discountPct: number;
  image: string;
  category: string;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  type: 'order_shipped' | 'flash_sale' | 'order_delivered' | 'security' | 'wishlist_price_drop';
  read: boolean;
}

interface PaymentTransaction {
  id: string;
  orderNumber: string;
  productName: string;
  date: string;
  method: string;
  methodType: 'visa' | 'esewa' | 'khalti' | 'connectips';
  amount: number;
  isRefund?: boolean;
  status: 'Completed' | 'Pending' | 'Refunded';
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  orderNumber?: string;
  title: string;
  preview: string;
  category: 'Order Issue' | 'Payment' | 'Product Inquiry' | 'Other' | 'Delivery & Tracking' | 'Return & Refund' | 'Order Issues';
  status: 'Awaiting Reply' | 'In Progress' | 'Open' | 'Resolved';
  updatedAt: string;
  hasNotificationDot?: boolean;
  messages: Array<{
    id: string;
    sender: 'user' | 'agent' | 'system';
    senderName: string;
    timestamp: string;
    content: string;
  }>;
  assignedAgent?: string;
  attachmentName?: string;
}

interface ReviewItem {
  id: string;
  productName: string;
  orderDate: string;
  orderNumber: string;
  rating: number;
  reviewText: string;
  reviewedDate: string;
  isModerationPending?: boolean;
  image: string;
}

export const MyAccountPage: React.FC = () => {
  const { user } = useAuth();
  const { query, navigate, path } = useRouter();

  // DEFAULT TAB IS OVERVIEW WHEN OPENING ACCOUNT
  const getInitialTab = (): AccountTab => {
    if (path === '/orders') return 'orders';
    if (path === '/profile') return 'profile';
    if (path === '/wishlist') return 'wishlist';
    if (path === '/addresses') return 'addresses';
    if (path === '/payments') return 'payments';
    if (path === '/reviews') return 'reviews';
    if (path === '/supports' || path === '/support') return 'supports';
    const tabParam = query.get('tab') as AccountTab;
    if (tabParam) return tabParam;
    return 'overview'; // Default to Overview
  };

  const [activeTab, setActiveTab] = useState<AccountTab>(getInitialTab());
  const [orderSubTab, setOrderSubTab] = useState<OrderSubTab>(
    (query.get('subtab') as OrderSubTab) || 'history'
  );
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Support Ticket Conversation View
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState<string>('');

  // Support Ticket Modal State (Matching Image 1 Exact Mockup)
  const [isRaiseTicketModalOpen, setIsRaiseTicketModalOpen] = useState<boolean>(false);
  const [ticketCategory, setTicketCategory] = useState<'Order Issue' | 'Payment' | 'Product Inquiry' | 'Other'>('Order Issue');
  const [ticketSubject, setTicketSubject] = useState<string>('');
  const [ticketDescription, setTicketDescription] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);

  // Payment filter states
  const [paymentSearch, setPaymentSearch] = useState<string>('');
  const [showPendingOnly, setShowPendingOnly] = useState<boolean>(false);
  const [showRefundsOnly, setShowRefundsOnly] = useState<boolean>(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || 'John Cena',
    occupation: 'WWE',
    dateOfBirth: 'March 15, 1985',
    age: '28 years old',
    gender: 'Male',
    nationality: 'USA',
    email: user?.email || 'manishstha1234@gmail.com',
    address: 'New York, United States',
    avatarUrl: '/images/auth_login_lifestyle.jpg',
    memberSince: '2021',
  });

  // Addresses State (Matching Image 2 Mockup)
  const [addresses, setAddresses] = useState<AddressItem[]>([
    {
      id: 'addr-1',
      title: 'Home',
      fullName: 'Manish Shrestha',
      phone: '+977 9845569978',
      street: 'Rambazar 10, Gandaki',
      city: 'Pokhara',
      province: 'Gandaki',
      postalCode: '33700',
      area: 'Province, Pokhara, Amarsigh Chowk Area',
      isDefault: true,
    },
    {
      id: 'addr-2',
      title: 'Office',
      fullName: 'Manish Shrestha',
      phone: '+977 9845569978',
      street: 'Rambazar 10, Gandaki',
      city: 'Pokhara',
      province: 'Gandaki',
      postalCode: '33700',
      area: 'Province, Pokhara, Amarsigh Chowk Area',
      isDefault: false,
    },
  ]);

  // Address Modal State (Matching Image 2 Exact Mockup)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: 'Pokhara',
    province: 'Gandaki',
    postalCode: '33700',
    isDefault: false,
  });

  // Wishlist Items State
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: 'w-1',
      brand: 'AEROTECH NEPAL',
      name: 'Wireless Earbuds Pro',
      rating: 4.8,
      reviewsCount: 48,
      price: 4500,
      originalPrice: 6000,
      discountPct: 25,
      image: '/images/cat_earbuds.jpg',
      category: 'Electronics',
    },
    {
      id: 'w-2',
      brand: 'AEROTECH NEPAL',
      name: 'Wireless Earbuds Pro',
      rating: 4.8,
      reviewsCount: 48,
      price: 4500,
      originalPrice: 6000,
      discountPct: 20,
      image: '/images/product_dhaka_topi.jpg',
      category: 'Apparel',
    },
    {
      id: 'w-3',
      brand: 'AEROTECH NEPAL',
      name: 'Wireless Earbuds Pro',
      rating: 4.8,
      reviewsCount: 48,
      price: 4500,
      originalPrice: 6000,
      discountPct: 25,
      image: '/images/hero_smartwatch.jpg',
      category: 'Electronics',
    },
    {
      id: 'w-4',
      brand: 'AEROTECH NEPAL',
      name: 'Wireless Earbuds Pro',
      rating: 4.8,
      reviewsCount: 48,
      price: 4500,
      originalPrice: 6000,
      discountPct: 25,
      image: '/images/cat_earbuds.jpg',
      category: 'Electronics',
    },
    {
      id: 'w-5',
      brand: 'AEROTECH NEPAL',
      name: 'Wireless Earbuds Pro',
      rating: 4.8,
      reviewsCount: 48,
      price: 4500,
      originalPrice: 6000,
      discountPct: 20,
      image: '/images/product_dhaka_topi.jpg',
      category: 'Apparel',
    },
    {
      id: 'w-6',
      brand: 'AEROTECH NEPAL',
      name: 'Wireless Earbuds Pro',
      rating: 4.8,
      reviewsCount: 48,
      price: 4500,
      originalPrice: 6000,
      discountPct: 25,
      image: '/images/hero_smartwatch.jpg',
      category: 'Electronics',
    },
    {
      id: 'w-7',
      brand: 'AEROTECH NEPAL',
      name: 'Wireless Earbuds Pro',
      rating: 4.8,
      reviewsCount: 48,
      price: 4500,
      originalPrice: 6000,
      discountPct: 25,
      image: '/images/cat_earbuds.jpg',
      category: 'Electronics',
    },
    {
      id: 'w-8',
      brand: 'AEROTECH NEPAL',
      name: 'Wireless Earbuds Pro',
      rating: 4.8,
      reviewsCount: 48,
      price: 4500,
      originalPrice: 6000,
      discountPct: 20,
      image: '/images/product_dhaka_topi.jpg',
      category: 'Apparel',
    },
    {
      id: 'w-9',
      brand: 'AEROTECH NEPAL',
      name: 'Wireless Earbuds Pro',
      rating: 4.8,
      reviewsCount: 48,
      price: 4500,
      originalPrice: 6000,
      discountPct: 25,
      image: '/images/hero_smartwatch.jpg',
      category: 'Electronics',
    },
  ]);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Your order has been shipped!',
      description: 'Order #EP-204891 · Wireless Earbuds Pro is on its way. Expected delivery: Dec 28',
      timeAgo: '2 hours ago',
      type: 'order_shipped',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Flash Sale: Up to 40% off today only',
      description: "Don't miss exclusive deals on Electronics, Apparel, and Accessories. Ends at midnight.",
      timeAgo: '5 hours ago',
      type: 'flash_sale',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Order delivered successfully',
      description: 'Order #EP-204755 · Himalayan Coffee Blend was delivered. Rate your experience!',
      timeAgo: 'Yesterday, 3:42 PM',
      type: 'order_delivered',
      read: true,
    },
    {
      id: 'notif-4',
      title: 'Password changed successfully',
      description: "Your account password was updated. If this wasn't you, contact support immediately.",
      timeAgo: 'Dec 23, 10:15 AM',
      type: 'security',
      read: true,
    },
    {
      id: 'notif-5',
      title: 'Price drop on your wishlist item',
      description: 'Silk Dhaka Topi is now Rs. 2,240 — down from Rs. 2,800. Grab it before stock runs out!',
      timeAgo: 'Dec 22, 6:00 PM',
      type: 'wishlist_price_drop',
      read: true,
    },
  ]);

  // Payment Transactions State
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>([
    {
      id: 'pay-1',
      orderNumber: '#EVP-1024',
      productName: 'Sony WH-1000XM5',
      date: '12 Mar 2026',
      method: 'Visa ••••4242',
      methodType: 'visa',
      amount: 24990,
      status: 'Completed',
    },
    {
      id: 'pay-2',
      orderNumber: '#EVP-1018',
      productName: 'Nike Air Max 270',
      date: '08 Mar 2026',
      method: 'Esewa Wallet',
      methodType: 'esewa',
      amount: 12450,
      status: 'Completed',
    },
    {
      id: 'pay-3',
      orderNumber: '#EVP-1002',
      productName: 'MacBook Air M2',
      date: '28 Feb 2026',
      method: 'Khalti Wallet',
      methodType: 'khalti',
      amount: 1200,
      status: 'Pending',
    },
    {
      id: 'pay-4',
      orderNumber: '#EVP-0987',
      productName: 'Refund - cancelled order',
      date: '20 Feb 2026',
      method: 'Visa ••••4242',
      methodType: 'visa',
      amount: 450,
      isRefund: true,
      status: 'Refunded',
    },
    {
      id: 'pay-5',
      orderNumber: '#EVP-0954',
      productName: 'Dell XPS 13',
      date: '15 Feb 2026',
      method: 'Visa ••••4242',
      methodType: 'visa',
      amount: 89990,
      status: 'Completed',
    },
  ]);

  // Reviews State
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([
    {
      id: 'rev-1',
      productName: 'Ilam Orthodox Tea - 250g',
      orderDate: '12 Jan 2025',
      orderNumber: '#EP-88421',
      rating: 5.0,
      reviewText: 'Absolutely love this tea! The aroma is incredible and the taste is authentic. Will definitely order again from Everest Pasal.',
      reviewedDate: '20 Jan 2025',
      image: '/images/cat_coffee.jpg',
    },
    {
      id: 'rev-2',
      productName: 'Handwoven Dhaka Fabric - 2m',
      orderDate: '5 Feb 2025',
      orderNumber: '#EP-91205',
      rating: 4.0,
      reviewText: 'Beautiful fabric with rich colors. The quality is exactly as described. Shipping was fast and packaging was excellent.',
      reviewedDate: '14 Feb 2025',
      image: '/images/product_dhaka_topi.jpg',
    },
    {
      id: 'rev-3',
      productName: 'Pure Pashmina Shawl - Grey',
      orderDate: '1 Mar 2025',
      orderNumber: '#EP-94870',
      rating: 3.0,
      reviewText: 'Good quality shawl, but the color was slightly different from the photos online. Overall a decent product at this price point.',
      reviewedDate: '10 Mar 2025',
      isModerationPending: true,
      image: '/images/promo_sweater.jpg',
    },
  ]);

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    {
      id: 'tkt-1',
      ticketNumber: '#TKT-2024001',
      orderNumber: '#EP-204891',
      title: 'Delayed Delivery — Order #EP-204891',
      preview: 'Your query is being investigated by our delivery partner. We expect a resolution in...',
      category: 'Order Issue',
      status: 'Awaiting Reply',
      updatedAt: 'Updated 2 hrs ago',
      hasNotificationDot: true,
      assignedAgent: 'Priya S. (Logistics Lead)',
      attachmentName: 'delivery_screenshot.png',
      messages: [
        {
          id: 'm-1',
          sender: 'user',
          senderName: 'You',
          timestamp: 'Dec 15, 10:15 AM',
          content: 'Hello support team, my order #EP-204891 was supposed to arrive 2 days ago according to the expected delivery timeline. There has been no update on the tracking page since it left Kathmandu hub. Can you please check?',
        },
        {
          id: 'm-2',
          sender: 'agent',
          senderName: 'Support Agent — Priya',
          timestamp: 'Dec 15, 11:30 AM',
          content: 'Namaste John, thank you for reaching out to Everest Pasal support. I sincerely apologize for the delay. Let me check with our courier partner right away. Could you confirm if your delivery address is Lalitpur Sector 4?',
        },
        {
          id: 'm-3',
          sender: 'user',
          senderName: 'You',
          timestamp: 'Dec 15, 11:45 AM',
          content: "Yes, that is correct. Lalitpur Sector 4, near the main post office. I've uploaded the screenshot of the delivery window showing Dec 13 expected arrival date.",
        },
        {
          id: 'm-4',
          sender: 'system',
          senderName: 'System',
          timestamp: 'Dec 15, 12:00 PM',
          content: 'Ticket status changed to In Progress',
        },
        {
          id: 'm-5',
          sender: 'agent',
          senderName: 'Support Agent — Priya',
          timestamp: 'Dec 15, 1:20 PM',
          content: 'Thank you for confirming, John. I have raised an urgent investigation with our Lalitpur logistics lead. They had some brief clearance delays because of local construction, but your package is now dispatched with courier team. It will reach you today by 5 PM.',
        },
      ],
    },
    {
      id: 'tkt-2',
      ticketNumber: '#TKT-2024002',
      orderNumber: '#EP-339591',
      title: 'Double Charged on Checkout',
      preview: 'The duplicate authorization hold of Rs. 4,500 has been successfully reversed by...',
      category: 'Payment',
      status: 'In Progress',
      updatedAt: 'Updated 5 hrs ago',
      assignedAgent: 'Karan B. (Finance Support)',
      messages: [],
    },
    {
      id: 'tkt-3',
      ticketNumber: '#TKT-2024003',
      orderNumber: '#EP-102431',
      title: 'Damaged Product Received',
      preview: 'Please share unboxing video of the package so our returns team can approve...',
      category: 'Order Issue',
      status: 'Open',
      updatedAt: 'Updated Yesterday',
      hasNotificationDot: true,
      assignedAgent: 'Aayush R.',
      messages: [],
    },
    {
      id: 'tkt-4',
      ticketNumber: '#TKT-2024004',
      orderNumber: 'N/A',
      title: 'Product inquiry about Cashmere shawl sizing',
      preview: 'Size chart and materials breakdown has been emailed to you. Thank you...',
      category: 'Product Inquiry',
      status: 'Resolved',
      updatedAt: 'Updated 3 days ago',
      messages: [],
    },
    {
      id: 'tkt-5',
      ticketNumber: '#TKT-2024005',
      orderNumber: '#EP-998371',
      title: 'Address modification request',
      preview: 'Address successfully updated to Lalitpur Sector 4. Delivery dispatched...',
      category: 'Other',
      status: 'Resolved',
      updatedAt: 'Updated 1 week ago',
      messages: [],
    },
  ]);

  // Mock Orders List
  const mockOrders: MockOrder[] = [
    {
      id: 'ord-1',
      orderNumber: '#EBC2024001',
      placedDate: 'Dec 15, 2025',
      deliveryDuration: '3-4 Days',
      status: 'PENDING',
      title: 'Smart Watch Series X',
      paymentMethod: 'eSewa',
      paymentStatus: 'Paid',
      totalAmount: 18500,
      shippingAddress: 'Lakeside, Pokhara, Nepal',
      deliveryCity: 'Pokhara',
      statusBadgeText: '● In Transit - Expected Dec 18, 2025',
      statusBadgeType: 'pending',
      amountSubtext: 'Total',
      items: [
        {
          id: 'item-1',
          sku: 'EP-WATCH-SRX',
          productName: 'Smart Watch Series X',
          quantity: 4,
          unitPrice: 4625,
          totalPrice: 18500,
          category: 'Electronics',
        },
      ],
    },
    {
      id: 'ord-2',
      orderNumber: '#EBC2024001',
      placedDate: 'Dec 15, 2025',
      deliveredDate: 'Dec 18, 2025',
      status: 'COMPLETED',
      title: 'Smart Watch Series X',
      paymentMethod: 'eSewa',
      paymentStatus: 'Paid',
      totalAmount: 18500,
      shippingAddress: 'Lakeside, Pokhara, Nepal',
      deliveryCity: 'Pokhara',
      statusBadgeText: '✓ Delivered on Dec 18, 2025',
      statusBadgeType: 'delivered',
      amountSubtext: 'Total paid',
      items: [
        {
          id: 'item-2',
          sku: 'EP-WATCH-SRX',
          productName: 'Smart Watch Series X',
          quantity: 4,
          unitPrice: 4625,
          totalPrice: 18500,
          category: 'Electronics',
        },
      ],
    },
    {
      id: 'ord-3',
      orderNumber: '#EBC2024002',
      placedDate: 'Nov 20, 2025',
      deliveredDate: 'Nov 22, 2025',
      status: 'COMPLETED',
      title: 'Ilam Orthodox Tea',
      paymentMethod: 'eSewa',
      paymentStatus: 'Paid',
      totalAmount: 4900,
      shippingAddress: 'Thamel, Kathmandu, Nepal',
      deliveryCity: 'Kathmandu',
      statusBadgeText: '✓ Delivered on Nov 22, 2025',
      statusBadgeType: 'delivered',
      amountSubtext: 'Total paid',
      items: [
        {
          id: 'item-3',
          sku: 'EP-TEA-ILAM-250',
          productName: 'Ilam Orthodox Tea - 250g',
          quantity: 2,
          unitPrice: 2450,
          totalPrice: 4900,
          category: 'Food & Beverage',
        },
      ],
    },
    {
      id: 'ord-4',
      orderNumber: '#EBC2024003',
      placedDate: 'Oct 5, 2025',
      cancelledDate: 'Oct 5, 2025',
      cancellationReason: 'Payment failed',
      refundStatus: 'Not applicable',
      status: 'CANCELLED',
      title: 'Genuine Leather Wallet',
      paymentMethod: 'ConnectIPS',
      paymentStatus: 'Failed',
      totalAmount: 2200,
      shippingAddress: 'Baluwatar, Kathmandu, Nepal',
      deliveryCity: 'Kathmandu',
      statusBadgeText: '✕ Cancelled on Oct 5, 2025 - Payment failed',
      statusBadgeType: 'cancelled',
      amountSubtext: 'Not charged',
      items: [
        {
          id: 'item-4',
          sku: 'EP-WLT-LTR-01',
          productName: 'Genuine Leather Wallet',
          quantity: 1,
          unitPrice: 2200,
          totalPrice: 2200,
          category: 'Accessories',
        },
      ],
    },
    {
      id: 'ord-5',
      orderNumber: '#EBC2024001',
      placedDate: 'Dec 10, 2025',
      cancelledDate: 'Dec 10, 2025',
      cancellationReason: 'Changed mind',
      refundStatus: '✓ Refunded - Rs 18,500',
      status: 'CANCELLED',
      title: 'Smart Watch Series X',
      paymentMethod: 'eSewa',
      paymentStatus: 'Refunded',
      totalAmount: 18500,
      shippingAddress: 'Pokhara, Nepal',
      deliveryCity: 'Pokhara',
      statusBadgeText: '✕ Cancelled on Dec 10, 2025 - Refund processed',
      statusBadgeType: 'cancelled',
      amountSubtext: 'Refunded',
      items: [
        {
          id: 'item-5',
          sku: 'EP-WATCH-SRX-CAN',
          productName: 'Smart Watch Series X',
          quantity: 1,
          unitPrice: 18500,
          totalPrice: 18500,
          category: 'Electronics',
        },
      ],
    },
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const tabParam = query.get('tab') as AccountTab;
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [query]);

  const filteredOrders = mockOrders.filter((order) => {
    if (orderSubTab === 'pending' && order.status !== 'PENDING') return false;
    if (orderSubTab === 'completed' && order.status !== 'COMPLETED') return false;
    if (orderSubTab === 'cancelled' && order.status !== 'CANCELLED') return false;
    if (orderSubTab === 'history' && order.status === 'PENDING') return false;

    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      const matchTitle = order.title.toLowerCase().includes(q);
      const matchItem = order.items.some((i) => i.productName.toLowerCase().includes(q));
      return matchNumber || matchTitle || matchItem;
    }

    return true;
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingProfile(false);
    showToast('Profile information successfully updated!');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicketId) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      sender: 'user' as const,
      senderName: 'You',
      timestamp: 'Just now',
      content: replyMessage.trim(),
    };

    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicketId
          ? {
              ...t,
              messages: [...t.messages, newMsg],
              status: 'In Progress',
              updatedAt: 'Updated just now',
            }
          : t
      )
    );

    setReplyMessage('');
    showToast('Your reply has been posted to the support thread.');
  };

  // Submit Support Ticket from New Modal Design (Image 1)
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;

    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `#TKT-${Math.floor(1000000 + Math.random() * 900000)}`,
      orderNumber: '#EP-204891',
      title: ticketSubject.trim(),
      preview: ticketDescription.slice(0, 80) + '...',
      category: ticketCategory,
      status: 'Open',
      updatedAt: 'Updated just now',
      hasNotificationDot: true,
      assignedAgent: 'Support Team',
      attachmentName: attachedFiles.length > 0 ? attachedFiles[0] : undefined,
      messages: [
        {
          id: `m-${Date.now()}`,
          sender: 'user',
          senderName: 'You',
          timestamp: 'Just now',
          content: ticketDescription.trim(),
        },
      ],
    };

    setSupportTickets((prev) => [newTicket, ...prev]);
    setIsRaiseTicketModalOpen(false);
    setTicketSubject('');
    setTicketDescription('');
    setAttachedFiles([]);
    showToast('Support ticket created! Our team will assist you shortly.');
  };

  // Save Location from New Modal Design (Image 2)
  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullName.trim() || !addressForm.addressLine.trim()) return;

    const newAddr: AddressItem = {
      id: `addr-${Date.now()}`,
      title: addressForm.isDefault ? 'Home (Default)' : 'Location',
      fullName: addressForm.fullName.trim(),
      phone: addressForm.phone.trim() || '+977 9845569978',
      street: addressForm.addressLine.trim(),
      city: addressForm.city.trim() || 'Pokhara',
      province: addressForm.province.trim() || 'Gandaki',
      postalCode: addressForm.postalCode.trim() || '33700',
      area: `${addressForm.province}, ${addressForm.city}`,
      isDefault: addressForm.isDefault,
    };

    if (addressForm.isDefault) {
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: false })));
    }

    setAddresses((prev) => [...prev, newAddr]);
    setIsAddressModalOpen(false);
    setAddressForm({
      fullName: '',
      phone: '',
      addressLine: '',
      city: 'Pokhara',
      province: 'Gandaki',
      postalCode: '33700',
      isDefault: false,
    });
    showToast('New location saved successfully!');
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast('Address removed.');
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Profile changes saved successfully!');
  };

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: 'calc(100vh - 200px)', padding: '28px 20px 60px 20px' }}>
      {/* Toast notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '12px 22px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 9999,
            fontSize: '13.5px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div style={{ maxWidth: '1220px', margin: '0 auto' }}>
        {/* Breadcrumb Navigation */}
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px', display: 'flex', gap: '6px' }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <span style={{ color: '#111827', fontWeight: 600 }}>
            {activeTab === 'reviews' ? 'My Reviews' : 'Profile'}
          </span>
        </div>

        {/* Page Title Section */}
        <div style={{ marginBottom: '24px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#111827',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {activeTab === 'reviews' ? 'My Reviews' : 'My Account'}
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
            Manage your profile, orders, and preferences
          </p>
        </div>

        {/* Main 2-Column Grid */}
        <div
          className="account-page-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '270px 1fr',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* ================================================================ */}
          {/* LEFT SIDEBAR NAVIGATION CARD                                     */}
          {/* ================================================================ */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #EDE8E1',
              padding: '32px 16px 24px 16px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
            }}
          >
            {/* User Profile Thumbnail Summary */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  margin: '0 auto 12px auto',
                  overflow: 'hidden',
                  border: '2px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  backgroundColor: '#1E293B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={profileData.avatarUrl}
                  alt={profileData.fullName}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'grayscale(100%)',
                  }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', margin: '0 0 3px 0' }}>
                {profileData.fullName}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                {profileData.email}
              </p>
            </div>

            {/* Sidebar Navigation Items */}
            <nav className="account-sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { id: 'overview' as AccountTab, label: 'Overview', icon: 'grid' },
                { id: 'profile' as AccountTab, label: 'Profile', icon: 'user' },
                { id: 'addresses' as AccountTab, label: 'Addresses', icon: 'map-pin' },
                { id: 'orders' as AccountTab, label: 'Orders', icon: 'package' },
                { id: 'wishlist' as AccountTab, label: 'My Wishlist', icon: 'heart' },
                { id: 'reviews' as AccountTab, label: 'Reviews', icon: 'star' },
                { id: 'payments' as AccountTab, label: 'Payments', icon: 'credit-card' },
                { id: 'notifications' as AccountTab, label: 'Notifications', icon: 'bell' },
                { id: 'supports' as AccountTab, label: 'Supports', icon: 'headset' },
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSelectedTicketId(null);
                      setIsEditingProfile(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '11px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isActive ? '#EDF4FC' : 'transparent',
                      color: isActive ? '#0B4EA2' : '#334155',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '13.5px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget.style.backgroundColor = '#F8FAFC');
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget.style.backgroundColor = 'transparent');
                    }}
                  >
                    {isActive && (
                      <span
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '6px',
                          bottom: '6px',
                          width: '3.5px',
                          backgroundColor: '#0B4EA2',
                          borderRadius: '0 4px 4px 0',
                        }}
                      />
                    )}

                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                      {item.icon === 'grid' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                      )}
                      {item.icon === 'user' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      )}
                      {item.icon === 'map-pin' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      )}
                      {item.icon === 'package' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m7.5 4.27 9 5.15"></path>
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                          <path d="m3.3 7 8.7 5 8.7-5"></path>
                          <path d="M12 22V12"></path>
                        </svg>
                      )}
                      {item.icon === 'heart' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      )}
                      {item.icon === 'star' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      )}
                      {item.icon === 'credit-card' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                          <line x1="1" y1="10" x2="23" y2="10"></line>
                        </svg>
                      )}
                      {item.icon === 'bell' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                      )}
                      {item.icon === 'headset' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                        </svg>
                      )}
                    </span>

                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ================================================================ */}
          {/* RIGHT MAIN CONTENT CONTAINER                                     */}
          {/* ================================================================ */}
          <div
            className="account-card-container"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #EDE8E1',
              padding: '28px 32px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
              minHeight: '560px',
            }}
          >
            {/* ============================================================== */}
            {/* TAB: OVERVIEW                                                  */}
            {/* ============================================================== */}
            {activeTab === 'overview' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>
                    Overview
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E1', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>Total Orders</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '4px 0 2px 0' }}>24</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>3 orders this month</div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E1', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>Wishlist Items</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '4px 0 2px 0' }}>12</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>2 items on sale now</div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E1', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>Reviews Given</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '4px 0 2px 0' }}>8</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Avg. rating: 4.6 ★</div>
                  </div>
                </div>

                {/* Section 1: RECENT ACTIVITY */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#E63946', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    RECENT ACTIVITY
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: '0 0 14px 0' }}>
                    Recent Orders
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      {
                        name: 'Wireless Earbuds Pro',
                        orderInfo: 'Order #EP-20481 · 2 Jan 2026',
                        price: 'Rs. 4,500',
                        image: '/images/cat_earbuds.jpg',
                      },
                      {
                        name: 'Himalayan Coffee Blend',
                        orderInfo: 'Order #EP-20395 · 28 Dec 2025',
                        price: 'Rs. 1,200',
                        image: '/images/cat_coffee.jpg',
                      },
                      {
                        name: 'Silk Dhaka Topi',
                        orderInfo: 'Order #EP-20300 · 15 Dec 2025',
                        price: 'Rs. 2,800',
                        image: '/images/product_dhaka_topi.jpg',
                      },
                    ].map((item) => (
                      <div
                        key={item.orderInfo}
                        style={{
                          backgroundColor: '#FAF8F5',
                          border: '1px solid #EFEAE2',
                          borderRadius: '10px',
                          padding: '12px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: '#EFEBE4', overflow: 'hidden' }}>
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>{item.name}</div>
                            <div style={{ fontSize: '11.5px', color: '#64748B' }}>{item.orderInfo}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#111827' }}>{item.price}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '10px' }}>
                    Showing 3 of 24 orders
                  </div>
                </div>

                {/* Section 2: PICKS FOR YOU */}
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#E63946', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    PICKS FOR YOU
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: '0 0 14px 0' }}>
                    Recommended Products
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                    {[1, 2, 3, 4].map((idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #EDE8E1',
                          borderRadius: '10px',
                          padding: '10px',
                          position: 'relative',
                        }}
                      >
                        <div style={{ position: 'relative', height: '110px', backgroundColor: '#FAF8F5', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                          <span style={{ position: 'absolute', right: '6px', top: '6px', backgroundColor: '#FFFFFF', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#64748b' }}>🤍</span>
                          <img src="/images/hero_smartwatch.jpg" alt="Smart Fitness Band" style={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ fontSize: '9px', fontWeight: 800, color: '#E63946', letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: '2px' }}>FITLIFE STORE</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827', marginBottom: '3px' }}>Smart Fitness Band</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: '#94A3B8', marginBottom: '6px' }}>
                          <span>☆☆☆☆☆</span>
                          <span>(4.5)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#111827' }}>Rs. 3,999</div>
                          <button
                            onClick={() => showToast('Added Smart Fitness Band to cart!')}
                            style={{ backgroundColor: '#0B4EA2', color: '#FFFFFF', border: 'none', borderRadius: '4px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '11px' }}
                          >
                            🛒
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: ADDRESSES (With exact Image 2 Address Card list)          */}
            {/* ============================================================== */}
            {activeTab === 'addresses' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>
                      My Addresses
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                      Manage your delivery addresses
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingAddress(null);
                      setAddressForm({
                        fullName: 'John Cena',
                        phone: '+977 9845XXXXXX',
                        addressLine: '',
                        city: 'Pokhara',
                        province: 'Gandaki',
                        postalCode: '33700',
                        isDefault: false,
                      });
                      setIsAddressModalOpen(true);
                    }}
                    style={{
                      backgroundColor: '#0B4EA2',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '9px 20px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>+</span>
                    <span>Add Address</span>
                  </button>
                </div>

                {/* Address Cards List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #EDE8E1',
                        borderRadius: '12px',
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '16px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            color: '#0B4EA2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                        >
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                        </div>

                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>
                            {addr.title}
                          </h3>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827', marginBottom: '3px' }}>
                            {addr.fullName}
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '2px' }}>
                            {addr.phone}
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '2px' }}>
                            {addr.street}
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                            {addr.area}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setEditingAddress(addr);
                            setAddressForm({
                              fullName: addr.fullName,
                              phone: addr.phone,
                              addressLine: addr.street,
                              city: addr.city || 'Pokhara',
                              province: addr.province || 'Gandaki',
                              postalCode: addr.postalCode || '33700',
                              isDefault: !!addr.isDefault,
                            });
                            setIsAddressModalOpen(true);
                          }}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            backgroundColor: '#EDF4FC',
                            border: '1px solid #BFDBFE',
                            color: '#0B4EA2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                          title="Edit Address"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            backgroundColor: '#FEE2E2',
                            border: '1px solid #FECACA',
                            color: '#DC2626',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                          title="Delete Address"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: SUPPORTS (Support Center)                                 */}
            {/* ============================================================== */}
            {activeTab === 'supports' && !selectedTicketId && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>
                      Support Center
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                      Get help with your orders, payments, delivery, and more.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setTicketCategory('Order Issue');
                      setTicketSubject('');
                      setTicketDescription('');
                      setIsRaiseTicketModalOpen(true);
                    }}
                    style={{
                      backgroundColor: '#E63946',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '9px 18px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(230, 57, 70, 0.25)',
                    }}
                  >
                    + Raise New Ticket
                  </button>
                </div>

                {/* 6 Category Quick Topic Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '22px' }}>
                  {[
                    { label: 'Order Issues', desc: 'Delayed, missing, or...', icon: '📦' },
                    { label: 'Delivery & Tracking', desc: 'Real-time courier up...', icon: '🚚' },
                    { label: 'Payment Issues', desc: 'Refunds, secure che...', icon: '💳' },
                    { label: 'Return & Refund', desc: 'Returns process and...', icon: '🔄' },
                    { label: 'Product Inquiry', desc: 'Authenticity & produ...', icon: '⏱' },
                    { label: 'Other Support', desc: 'Account issues or sp...', icon: '💬' },
                  ].map((cat) => (
                    <div
                      key={cat.label}
                      onClick={() => {
                        setTicketCategory(cat.label.includes('Payment') ? 'Payment' : cat.label.includes('Inquiry') ? 'Product Inquiry' : 'Order Issue');
                        setIsRaiseTicketModalOpen(true);
                      }}
                      style={{
                        backgroundColor: '#FAF8F5',
                        border: '1px solid #EDE8E1',
                        borderRadius: '8px',
                        padding: '12px 10px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ fontSize: '16px', marginBottom: '6px' }}>{cat.icon}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>{cat.label}</div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>{cat.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Metric Summary Bar */}
                <div style={{ display: 'flex', gap: '24px', padding: '12px 18px', backgroundColor: '#FAF8F5', borderRadius: '8px', border: '1px solid #EDE8E1', marginBottom: '18px', fontSize: '13px' }}>
                  <div>Total Tickets: <strong>{supportTickets.length}</strong></div>
                  <div>Open: <strong style={{ color: '#16A34A' }}>2</strong></div>
                  <div>Awaiting Reply: <strong style={{ color: '#D97706' }}>3</strong></div>
                  <div>Resolved: <strong style={{ color: '#64748B' }}>3</strong></div>
                </div>

                {/* Search & Filter Bar */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                  <select style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', color: '#0B4EA2', fontWeight: 600 }}>
                    <option>All Categories ▾</option>
                  </select>
                  <select style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', color: '#0B4EA2', fontWeight: 600 }}>
                    <option>Status: All ▾</option>
                  </select>
                  <select style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', color: '#0B4EA2', fontWeight: 600 }}>
                    <option>Sort By: Newest ▾</option>
                  </select>
                </div>

                {/* Tickets List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {supportTickets.map((tkt) => (
                    <div
                      key={tkt.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #EDE8E1',
                        borderRadius: '10px',
                        padding: '16px 20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {tkt.hasNotificationDot && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#E63946' }} />}
                          <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0B4EA2' }}>{tkt.ticketNumber}</span>
                          <span style={{ fontSize: '12px', color: '#64748B' }}>· Order: {tkt.orderNumber}</span>
                        </div>

                        <span
                          style={{
                            backgroundColor: tkt.status === 'Awaiting Reply' ? '#FEF3C7' : tkt.status === 'In Progress' ? '#EDF4FC' : tkt.status === 'Open' ? '#DCFCE7' : '#F1F5F9',
                            color: tkt.status === 'Awaiting Reply' ? '#D97706' : tkt.status === 'In Progress' ? '#0B4EA2' : tkt.status === 'Open' ? '#16A34A' : '#64748B',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '12px',
                          }}
                        >
                          {tkt.status}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>
                        {tkt.title}
                      </h4>
                      <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 12px 0' }}>
                        {tkt.preview}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{ backgroundColor: '#FAF8F5', border: '1px solid #E2E8F0', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                            {tkt.category}
                          </span>
                          <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>{tkt.updatedAt}</span>
                        </div>

                        <button
                          onClick={() => setSelectedTicketId(tkt.id)}
                          style={{
                            backgroundColor: '#FFFFFF',
                            color: '#0B4EA2',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '6px 14px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          View Conversation
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TICKET CONVERSATION VIEW */}
            {activeTab === 'supports' && selectedTicketId && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <button
                    onClick={() => setSelectedTicketId(null)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#0B4EA2',
                      cursor: 'pointer',
                    }}
                  >
                    ← Back to Supports
                  </button>

                  <div style={{ backgroundColor: '#FAF8F5', border: '1px solid #EDE8E1', borderRadius: '6px', padding: '6px 14px', fontSize: '12.5px', color: '#64748B', flex: 1 }}>
                    Supports / {supportTickets.find((t) => t.id === selectedTicketId)?.ticketNumber}
                  </div>
                </div>

                {(() => {
                  const currentTicket = supportTickets.find((t) => t.id === selectedTicketId);
                  if (!currentTicket) return null;

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '20px', alignItems: 'start' }}>
                      <div>
                        <div style={{ border: '1.5px solid #0B4EA2', borderRadius: '10px', padding: '16px 20px', marginBottom: '18px', backgroundColor: '#FFFFFF' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0B4EA2' }}>Ticket {currentTicket.ticketNumber}</span>
                            <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                              {currentTicket.status}
                            </span>
                          </div>
                          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>
                            {currentTicket.title}
                          </h3>
                          <div style={{ display: 'flex', gap: '10px', fontSize: '11.5px', color: '#64748B' }}>
                            <span style={{ backgroundColor: '#FAF8F5', border: '1px solid #E2E8F0', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                              {currentTicket.category}
                            </span>
                            <span>Opened Dec 15 2025 · Last action 1 hour ago</span>
                          </div>
                        </div>

                        <div style={{ border: '1px solid #EDE8E1', borderRadius: '12px', padding: '20px', backgroundColor: '#FFFFFF', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '420px', overflowY: 'auto' }}>
                          {currentTicket.messages.map((msg) => {
                            if (msg.sender === 'system') {
                              return (
                                <div key={msg.id} style={{ textAlign: 'center', margin: '6px 0' }}>
                                  <span style={{ backgroundColor: '#EDF4FC', color: '#0B4EA2', fontSize: '11.5px', fontWeight: 600, padding: '4px 14px', borderRadius: '20px' }}>
                                    {msg.content}
                                  </span>
                                </div>
                              );
                            }

                            const isUser = msg.sender === 'user';

                            return (
                              <div
                                key={msg.id}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: isUser ? 'flex-end' : 'flex-start',
                                }}
                              >
                                <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>
                                  <strong>{msg.senderName}</strong> · {msg.timestamp}
                                </div>

                                <div style={{ display: 'flex', gap: '8px', maxWidth: '85%' }}>
                                  {!isUser && (
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#111827', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                                      EP
                                    </div>
                                  )}

                                  <div
                                    style={{
                                      backgroundColor: isUser ? '#FFFFFF' : '#FAF8F5',
                                      border: isUser ? '1px solid #CBD5E1' : '1px solid #EDE8E1',
                                      borderRadius: '10px',
                                      padding: '12px 16px',
                                      fontSize: '13px',
                                      color: '#1E293B',
                                      lineHeight: 1.5,
                                    }}
                                  >
                                    {msg.content}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <form onSubmit={handleSendReply} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #CBD5E1', borderRadius: '25px', padding: '6px 14px', backgroundColor: '#FFFFFF' }}>
                          <input
                            type="text"
                            placeholder="Write your reply message..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', padding: '4px' }}
                          />
                          <button type="button" onClick={() => showToast('File attachment opened')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748B' }}>📎</button>
                          <button type="button" onClick={() => showToast('Emoji picker opened')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748B' }}>😊</button>
                          <button type="submit" style={{ backgroundColor: '#0B4EA2', color: '#FFFFFF', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px' }}>✈</button>
                        </form>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E1', borderRadius: '10px', padding: '16px' }}>
                          <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#111827', margin: '0 0 12px 0' }}>Ticket Details</h4>
                          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>RELATED ORDER</div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B4EA2', marginBottom: '10px' }}>{currentTicket.orderNumber}</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>CREATED ON</div>
                          <div style={{ fontSize: '12.5px', color: '#1E293B', marginBottom: '10px' }}>Dec 15 2025, 10:15 AM</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>ASSIGNED AGENT</div>
                          <div style={{ fontSize: '12.5px', color: '#1E293B' }}>{currentTicket.assignedAgent || 'Priya S.'}</div>
                        </div>

                        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E1', borderRadius: '10px', padding: '16px' }}>
                          <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#111827', margin: '0 0 10px 0' }}>Attachments (1)</h4>
                          <div style={{ backgroundColor: '#FAF8F5', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px', fontSize: '12px', color: '#0B4EA2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <span>📄</span>
                            <span style={{ textDecoration: 'underline' }}>{currentTicket.attachmentName || 'delivery_screenshot.png'}</span>
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E1', borderRadius: '10px', padding: '16px' }}>
                          <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>Need immediate help?</h4>
                          <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.45, margin: 0 }}>
                            Our live support is online Sunday – Friday, 9:00 AM to 6:00 PM NPT. Email us at support@everestpasal.com
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === 'orders' && (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>
                    My Orders
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                    Track and manage your purchases
                  </p>
                </div>

                <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: '20px', gap: '32px' }}>
                  {[
                    { id: 'pending' as OrderSubTab, label: 'Pending' },
                    { id: 'completed' as OrderSubTab, label: 'Completed' },
                    { id: 'cancelled' as OrderSubTab, label: 'Cancelled' },
                    { id: 'history' as OrderSubTab, label: 'Order History' },
                  ].map((subTab) => {
                    const isSubActive = orderSubTab === subTab.id;
                    return (
                      <button
                        key={subTab.id}
                        onClick={() => setOrderSubTab(subTab.id)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderBottom: isSubActive ? '2.5px solid #0B4EA2' : '2.5px solid transparent',
                          padding: '10px 4px 12px 4px',
                          fontSize: '13.5px',
                          fontWeight: isSubActive ? 700 : 500,
                          color: isSubActive ? '#0B4EA2' : '#64748b',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          marginBottom: '-1px',
                        }}
                      >
                        {subTab.label}
                      </button>
                    );
                  })}
                </div>

                <div style={{ position: 'relative', maxWidth: '380px', marginBottom: '24px' }}>
                  <input
                    type="text"
                    placeholder="Search orders or order IDs..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '9px 14px 9px 34px', borderRadius: '8px', border: '1px solid #D5CDC0', fontSize: '13px' }}
                  />
                  <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>🔍</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {filteredOrders.map((order) => {
                    const firstItem = order.items[0];
                    const isDelivered = order.statusBadgeType === 'delivered';
                    const isCancelled = order.statusBadgeType === 'cancelled';
                    const isPending = order.status === 'PENDING';

                    return (
                      <div key={order.id} style={{ backgroundColor: '#FAF8F5', borderRadius: '12px', border: '1px solid #EFEAE2', padding: '20px 22px' }}>
                        <div style={{ marginBottom: '16px' }}>
                          <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#111827', margin: '0 0 2px 0' }}>Order {order.orderNumber}</h3>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Placed: {order.placedDate} · {order.title}</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #EFEAE2', marginBottom: '16px', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '8px', backgroundColor: '#EFEBE4', border: '1px solid #DFD9CF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                              {order.title.toLowerCase().includes('watch') ? '⌚' : '🍵'}
                            </div>
                            <div>
                              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 3px 0' }}>{firstItem?.productName || order.title}</h4>
                              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                                Qty: {firstItem?.quantity || 1} · {isPending ? `Delivering to ${order.deliveryCity}` : `Delivered to ${order.deliveryCity}`}
                              </div>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: isDelivered ? '#16A34A' : isCancelled ? '#DC2626' : '#047857' }}>
                                {order.statusBadgeText}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '17px', fontWeight: 800, color: '#111827' }}>Rs {order.totalAmount.toLocaleString()}</div>
                            <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>{order.amountSubtext}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {isPending ? (
                            <>
                              <button onClick={() => navigate('/orders/EP-1048/track')} style={{ backgroundColor: '#0B4EA2', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '8px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                                Track Order
                              </button>
                              <button onClick={() => showToast('Viewing details')} style={{ backgroundColor: '#FFFFFF', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '7px 18px', fontSize: '13px', cursor: 'pointer' }}>View Details</button>
                              <button onClick={() => showToast('Downloading invoice')} style={{ backgroundColor: '#FFFFFF', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '7px 18px', fontSize: '13px', cursor: 'pointer' }}>Download Invoice</button>
                              <button onClick={() => showToast('Order cancelled')} style={{ backgroundColor: '#FFFFFF', color: '#EF4444', border: '1.5px solid #EF4444', borderRadius: '6px', padding: '7px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel Order</button>
                            </>
                          ) : (
                            <button onClick={() => { showToast(`Added to cart!`); navigate('/cart'); }} style={{ backgroundColor: '#0B4EA2', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '8px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                              Order Again
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: PAYMENTS */}
            {activeTab === 'payments' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>Payment History</h2>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Track, filter, and manage your recent transactions</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => showToast('Exported CSV')} style={{ backgroundColor: '#FFFFFF', color: '#334155', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '7px 16px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>Export CSV</button>
                    <button onClick={() => showToast('Add Card modal')} style={{ backgroundColor: '#FFFFFF', color: '#0B4EA2', border: 'none', padding: '7px 14px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Add Card</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E1', borderRadius: '12px', padding: '18px 20px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>TOTAL SPENT</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '2px 0 3px 0' }}>₹ 12,450</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>Last 30 days</div>
                  </div>
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E1', borderTop: '3px solid #F59E0B', borderRadius: '12px', padding: '18px 20px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>PENDING</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '2px 0 3px 0' }}>₹ 1,200</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>2 transactions</div>
                  </div>
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E1', borderTop: '3px solid #16A34A', borderRadius: '12px', padding: '18px 20px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>REFUNDED</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '2px 0 3px 0' }}>₹ 450</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>1 successful refund</div>
                  </div>
                </div>

                <div style={{ border: '1px solid #EDE8E1', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#FAF8F5', borderBottom: '1px solid #EDE8E1', color: '#64748B', fontSize: '11px', fontWeight: 700, textAlign: 'left' }}>
                        <th style={{ padding: '12px 16px' }}>TRANSACTION</th>
                        <th style={{ padding: '12px 16px' }}>DATE</th>
                        <th style={{ padding: '12px 16px' }}>METHOD</th>
                        <th style={{ padding: '12px 16px' }}>AMOUNT</th>
                        <th style={{ padding: '12px 16px' }}>STATUS</th>
                        <th style={{ padding: '12px 16px' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentTransactions.map((tx) => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 700 }}>Order {tx.orderNumber}</td>
                          <td style={{ padding: '14px 16px', color: '#64748B' }}>{tx.date}</td>
                          <td style={{ padding: '14px 16px' }}>{tx.method}</td>
                          <td style={{ padding: '14px 16px', fontWeight: 700 }}>Rs {tx.amount.toLocaleString()}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>{tx.status}</span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <button onClick={() => showToast('Viewing receipt')} style={{ background: 'none', border: 'none', color: '#0B4EA2', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>View receipt</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: REVIEWS */}
            {activeTab === 'reviews' && (
              <div>
                <div style={{ marginBottom: '22px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>My Reviews</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{reviewsList.length} reviews submitted</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reviewsList.map((rev) => (
                    <div key={rev.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E1', borderRadius: '12px', padding: '18px 20px', display: 'flex', gap: '18px' }}>
                      <div style={{ width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={rev.image} alt={rev.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: '0 0 3px 0' }}>{rev.productName}</h4>
                        <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '6px' }}>Ordered on: {rev.orderDate} · Order {rev.orderNumber}</div>
                        <div style={{ color: '#E63946', fontSize: '13px', marginBottom: '6px' }}>★★★★★ {rev.rating.toFixed(1)}</div>
                        <p style={{ fontSize: '13px', color: '#334155', margin: 0 }}>"{rev.reviewText}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>Notifications</h2>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Stay updated on your orders, offers, and account activity</p>
                  </div>
                  <button onClick={() => showToast('All notifications marked read')} style={{ backgroundColor: '#FFFFFF', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '7px 16px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
                    Mark all as read
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {notifications.map((item) => (
                    <div key={item.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: item.type === 'order_shipped' ? '1.5px solid #0B4EA2' : item.type === 'flash_sale' ? '1.5px solid #E63946' : '1px solid #EDE8E1', padding: '16px 20px', display: 'flex', gap: '16px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: item.type === 'order_shipped' ? '#EDF4FC' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.type === 'order_shipped' ? '📦' : item.type === 'flash_sale' ? '🏷️' : '✓'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: '0 0 3px 0' }}>{item.title}</h4>
                        <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 4px 0' }}>{item.description}</p>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>{item.timeAgo}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: EDIT PROFILE (EXACT MOCKUP FROM SCREENSHOT)               */}
            {/* ============================================================== */}
            {activeTab === 'profile' && (
              <div>
                {/* Header with Title and Editing Badge */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '28px',
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: '22px',
                        fontWeight: 800,
                        color: '#111827',
                        margin: '0 0 4px 0',
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      Edit Profile
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                      Update your personal details and contact information
                    </p>
                  </div>

                  {/* Editing Badge */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#EFF6FF',
                      color: '#0B4EA2',
                      padding: '5px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ fontSize: '9px', color: '#0B4EA2' }}>●</span>
                    <span>Editing</span>
                  </div>
                </div>

                <form onSubmit={handleProfileSave}>
                  {/* Avatar Upload Center Section */}
                  <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{ position: 'relative', display: 'inline-block', width: '96px', height: '96px' }}>
                      <div
                        style={{
                          width: '96px',
                          height: '96px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          backgroundColor: '#0F172A',
                          border: '2px solid #E2E8F0',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={profileData.avatarUrl}
                          alt={profileData.fullName}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: 'grayscale(100%)',
                          }}
                        />
                      </div>

                      {/* Change Camera Overlay at bottom of Avatar */}
                      <label
                        style={{
                          position: 'absolute',
                          bottom: '0',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: 'rgba(15, 23, 42, 0.85)',
                          color: '#FFFFFF',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '10.5px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        <span>Change</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const url = URL.createObjectURL(file);
                              setProfileData((prev) => ({ ...prev, avatarUrl: url }));
                              showToast('Avatar photo updated!');
                            }
                          }}
                        />
                      </label>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '10px 0 2px 0' }}>
                      {profileData.fullName}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                      Member since {profileData.memberSince}
                    </p>
                  </div>

                  {/* Section Divider */}
                  <div style={{ borderTop: '1px solid #EDE8E1', margin: '24px 0' }} />

                  {/* 1. PERSONAL INFORMATION */}
                  <div style={{ marginBottom: '24px' }}>
                    <div
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 800,
                        color: '#0B4EA2',
                        letterSpacing: '0.6px',
                        textTransform: 'uppercase',
                        marginBottom: '16px',
                      }}
                    >
                      PERSONAL INFORMATION
                    </div>

                    <div className="account-form-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      {/* Full Name */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '8px',
                            border: '1px solid #E5DFD7',
                            backgroundColor: '#FAF7F2',
                            fontSize: '13.5px',
                            color: '#111827',
                            outline: 'none',
                          }}
                          onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                          onBlur={(e) => (e.target.style.borderColor = '#E5DFD7')}
                        />
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                          Date of Birth
                        </label>
                        <input
                          type="text"
                          value={profileData.dateOfBirth}
                          onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '8px',
                            border: '1px solid #E5DFD7',
                            backgroundColor: '#FAF7F2',
                            fontSize: '13.5px',
                            color: '#111827',
                            outline: 'none',
                          }}
                          onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                          onBlur={(e) => (e.target.style.borderColor = '#E5DFD7')}
                        />
                      </div>

                      {/* Occupation */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                          Occupation
                        </label>
                        <input
                          type="text"
                          value={profileData.occupation}
                          onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '8px',
                            border: '1px solid #E5DFD7',
                            backgroundColor: '#FAF7F2',
                            fontSize: '13.5px',
                            color: '#111827',
                            outline: 'none',
                          }}
                          onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                          onBlur={(e) => (e.target.style.borderColor = '#E5DFD7')}
                        />
                      </div>

                      {/* Age */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                          Age
                        </label>
                        <input
                          type="text"
                          value={profileData.age}
                          onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '8px',
                            border: '1px solid #E5DFD7',
                            backgroundColor: '#FAF7F2',
                            fontSize: '13.5px',
                            color: '#111827',
                            outline: 'none',
                          }}
                          onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                          onBlur={(e) => (e.target.style.borderColor = '#E5DFD7')}
                        />
                      </div>
                    </div>

                    {/* Gender Radio Pill Selectors */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                        Gender
                      </label>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {['Male', 'Female'].map((gen) => {
                          const isSelected = profileData.gender === gen;
                          return (
                            <div
                              key={gen}
                              onClick={() => setProfileData({ ...profileData, gender: gen })}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '9px 24px',
                                borderRadius: '8px',
                                border: isSelected ? '1.5px solid #0B4EA2' : '1px solid #E5DFD7',
                                backgroundColor: '#FAF7F2',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  border: isSelected ? '5px solid #0B4EA2' : '1.5px solid #94A3B8',
                                  backgroundColor: '#FFFFFF',
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  fontSize: '13px',
                                  fontWeight: isSelected ? 700 : 500,
                                  color: '#111827',
                                }}
                              >
                                {gen}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Section Divider */}
                  <div style={{ borderTop: '1px solid #EDE8E1', margin: '24px 0' }} />

                  {/* 2. CONTACT & LOCATION */}
                  <div style={{ marginBottom: '28px' }}>
                    <div
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 800,
                        color: '#0B4EA2',
                        letterSpacing: '0.6px',
                        textTransform: 'uppercase',
                        marginBottom: '16px',
                      }}
                    >
                      CONTACT & LOCATION
                    </div>

                    <div className="account-form-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      {/* Email Address */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '8px',
                            border: '1px solid #E5DFD7',
                            backgroundColor: '#FAF7F2',
                            fontSize: '13.5px',
                            color: '#111827',
                            outline: 'none',
                          }}
                          onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                          onBlur={(e) => (e.target.style.borderColor = '#E5DFD7')}
                        />
                      </div>

                      {/* Nationality */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                          Nationality
                        </label>
                        <input
                          type="text"
                          value={profileData.nationality}
                          onChange={(e) => setProfileData({ ...profileData, nationality: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '8px',
                            border: '1px solid #E5DFD7',
                            backgroundColor: '#FAF7F2',
                            fontSize: '13.5px',
                            color: '#111827',
                            outline: 'none',
                          }}
                          onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                          onBlur={(e) => (e.target.style.borderColor = '#E5DFD7')}
                        />
                      </div>
                    </div>

                    {/* Address (Full Width) */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Address
                      </label>
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '8px',
                          border: '1px solid #E5DFD7',
                          backgroundColor: '#FAF7F2',
                          fontSize: '13.5px',
                          color: '#111827',
                          outline: 'none',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                        onBlur={(e) => (e.target.style.borderColor = '#E5DFD7')}
                      />
                    </div>
                  </div>

                  {/* Form Footer Actions (Matching Mockup) */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '32px',
                      paddingTop: '8px',
                    }}
                  >
                    <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                      All fields marked are required to save your profile.
                    </p>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('overview');
                          showToast('Profile editing cancelled.');
                        }}
                        style={{
                          backgroundColor: '#FFFFFF',
                          color: '#334155',
                          border: '1px solid #D5CDC0',
                          borderRadius: '8px',
                          padding: '10px 24px',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          minWidth: '100px',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: '#0B4EA2',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 26px',
                          fontSize: '13.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          minWidth: '140px',
                          boxShadow: '0 2px 6px rgba(11, 78, 162, 0.25)',
                        }}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}


            {activeTab === 'wishlist' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>My Wishlist</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{wishlistItems.length} items saved to your wishlist</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
                  {wishlistItems.map((item) => (
                    <div key={item.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E1', borderRadius: '12px', padding: '12px', position: 'relative' }}>
                      <div style={{ position: 'relative', height: '160px', backgroundColor: '#FBF9F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                        <span style={{ position: 'absolute', left: '8px', top: '8px', backgroundColor: '#E63946', color: '#FFFFFF', fontSize: '9.5px', fontWeight: 800, padding: '2px 6px', borderRadius: '3px' }}>{item.discountPct}% OFF</span>
                        <img src={item.image} alt={item.name} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: 800, color: '#E63946', textTransform: 'uppercase' }}>{item.brand}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: '2px 0 6px 0' }}>{item.name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#111827' }}>Rs. {item.price.toLocaleString()}</div>
                        <button onClick={() => showToast(`Added ${item.name} to cart!`)} style={{ backgroundColor: '#0B4EA2', color: '#FFFFFF', border: 'none', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer' }}>🛒</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 1. CREATE SUPPORT TICKET MODAL (EXACT MOCKUP IMAGE 1)              */}
      {/* ================================================================== */}
      {isRaiseTicketModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            className="responsive-modal-box"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              padding: '32px',
              width: '90%',
              maxWidth: '560px',
              boxShadow: '0 20px 35px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '0 0 6px 0', fontFamily: "'Poppins', sans-serif" }}>
                  Create Support Ticket
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Please provide details about your issue so we can assist you better.
                </p>
              </div>

              {/* Close Button Circle (Exact Image 1) */}
              <button
                onClick={() => setIsRaiseTicketModalOpen(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#F1F5F9',
                  border: 'none',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                title="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTicket}>
              {/* Category Field with 4 Radio Cards */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '10px' }}>
                  Category
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'Order Issue' as const, label: 'Order Issue' },
                    { id: 'Payment' as const, label: 'Payment' },
                    { id: 'Product Inquiry' as const, label: 'Product Inquiry' },
                    { id: 'Other' as const, label: 'Other' },
                  ].map((cat) => {
                    const isSelected = ticketCategory === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setTicketCategory(cat.id)}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: isSelected ? '1.5px solid #0B4EA2' : '1px solid #D5CDC0',
                          borderRadius: '8px',
                          padding: '10px 8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {/* Radio Circle */}
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: isSelected ? '5px solid #0B4EA2' : '1.5px solid #CBD5E1',
                            backgroundColor: '#FFFFFF',
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: isSelected ? 700 : 500, color: '#111827', whiteSpace: 'nowrap' }}>
                          {cat.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subject Field */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Missing item in my recent order"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E5DFD7',
                    backgroundColor: '#FAF7F2',
                    fontSize: '13.5px',
                    color: '#111827',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                  onBlur={(e) => (e.target.style.borderColor = '#E5DFD7')}
                />
              </div>

              {/* Description Field */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide detailed information about your issue..."
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E5DFD7',
                    backgroundColor: '#FAF7F2',
                    fontSize: '13.5px',
                    color: '#111827',
                    outline: 'none',
                    resize: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                  onBlur={(e) => (e.target.style.borderColor = '#E5DFD7')}
                />
              </div>

              {/* Attachments (Optional) Dropzone */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
                  Attachments (Optional)
                </label>
                <div
                  onClick={() => {
                    setAttachedFiles(['screenshot_issue_doc.png']);
                    showToast('Attachment uploaded: screenshot_issue_doc.png');
                  }}
                  style={{
                    backgroundColor: '#FAF7F2',
                    border: '1.5px dashed #D5CDC0',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    color: '#64748B',
                    fontSize: '13px',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>⭱</span>
                  <span>
                    {attachedFiles.length > 0
                      ? `Attached: ${attachedFiles.join(', ')}`
                      : 'Drag and drop files here or click to browse'}
                  </span>
                </div>
              </div>

              {/* Modal Footer Actions (Exact Image 1) */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
                <button
                  type="button"
                  onClick={() => setIsRaiseTicketModalOpen(false)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#0B4EA2',
                    border: '1px solid #D5CDC0',
                    borderRadius: '8px',
                    padding: '10px 32px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    minWidth: '130px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#0B4EA2',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 32px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    minWidth: '150px',
                  }}
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* 2. ADD NEW LOCATION MODAL (EXACT MOCKUP IMAGE 2)                   */}
      {/* ================================================================== */}
      {isAddressModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            className="responsive-modal-box"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              padding: '32px',
              width: '90%',
              maxWidth: '560px',
              boxShadow: '0 20px 35px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '0 0 6px 0', fontFamily: "'Poppins', sans-serif" }}>
                  Add New Location
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Enter your delivery details so we can save this address for future orders.
                </p>
              </div>

              {/* Close Button Circle */}
              <button
                onClick={() => setIsAddressModalOpen(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#F1F5F9',
                  border: 'none',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                title="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLocation}>
              {/* Full Name */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Cena"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E5DFD7',
                    backgroundColor: '#FAF7F2',
                    fontSize: '13.5px',
                    color: '#111827',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                  onBlur={(e) => (e.target.style.borderColor = '#E5DFD7')}
                />
              </div>

              {/* Phone Number */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+977 9845XXXXXX"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E5DFD7',
                    backgroundColor: '#FAF7F2',
                    fontSize: '13.5px',
                    color: '#111827',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                  onBlur={(e) => (e.target.style.borderColor = '#E5DFD7')}
                />
              </div>

              {/* Address Line */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
                  Address Line
                </label>
                <input
                  type="text"
                  placeholder="Enter your full address"
                  value={addressForm.addressLine}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E5DFD7',
                    backgroundColor: '#FAF7F2',
                    fontSize: '13.5px',
                    color: '#111827',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                  onBlur={(e) => (e.target.style.borderColor = '#E5DFD7')}
                />
              </div>

              {/* City & State/Province Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Pokhara"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #E5DFD7',
                      backgroundColor: '#FAF7F2',
                      fontSize: '13.5px',
                      color: '#111827',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                    onBlur={(e) => (e.target.style.borderColor = '#E5DFD7')}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
                    State/Province
                  </label>
                  <input
                    type="text"
                    placeholder="Gandaki"
                    value={addressForm.province}
                    onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #E5DFD7',
                      backgroundColor: '#FAF7F2',
                      fontSize: '13.5px',
                      color: '#111827',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                    onBlur={(e) => (e.target.style.borderColor = '#E5DFD7')}
                  />
                </div>
              </div>

              {/* Postal Code */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
                  Postal Code
                </label>
                <input
                  type="text"
                  placeholder="33700"
                  value={addressForm.postalCode}
                  onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E5DFD7',
                    backgroundColor: '#FAF7F2',
                    fontSize: '13.5px',
                    color: '#111827',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#0B4EA2')}
                  onBlur={(e) => (e.target.style.borderColor = '#E5DFD7')}
                />
              </div>

              {/* Default Address Checkbox */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
                  Default Address
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1E293B', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      accentColor: '#0B4EA2',
                      cursor: 'pointer',
                    }}
                  />
                  <span>Set as default address</span>
                </label>
              </div>

              {/* Divider Line Above Buttons (Exact Image 2) */}
              <div style={{ borderTop: '1px solid #F1EDE6', paddingTop: '20px', display: 'flex', justifyContent: 'center', gap: '14px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#0B4EA2',
                    border: '1px solid #D5CDC0',
                    borderRadius: '8px',
                    padding: '10px 32px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    minWidth: '130px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#0B4EA2',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 32px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    minWidth: '150px',
                  }}
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
