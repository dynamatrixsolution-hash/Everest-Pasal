// ==============================================================================
// EVEREST PASAL - VENDOR CUSTOMER INQUIRIES MODULE
// Exact pixel-perfect implementation matching user mockups:
// 1. Customer Inquiries Main List View (media_1794203813520_dcec1392.jpg)
// 2. Customer Inquiry Conversation Detail View (media_1794203813534_a3986dcf.jpg)
// 3. Create New Inquiry View (media_1794203813509_21b95687.jpg)
//
// Typography: Poppins font family
// Color Palette: #1A56DB (Primary Blue), #10B981 (Success), #F59E0B (Amber Warning),
//                #EF4444 (Red Urgent/Alert), #0F172A (Text Slate-900)
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client';

export type InquiryStatus = 'Open' | 'Awaiting Reply' | 'In Progress' | 'Resolved' | 'Closed';
export type InquiryPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type InquiryCategory =
  | 'Shipping & Delivery'
  | 'Returns & Refunds'
  | 'Product Information'
  | 'Payment Issues'
  | 'General Inquiry';

export interface InquiryMessage {
  id: string;
  senderName: string;
  senderRole: 'Customer' | 'Support agent' | 'Store Admin' | 'System';
  senderAvatar: string;
  timestamp: string;
  dateLabel?: string;
  message: string;
  isInternal?: boolean;
  attachment?: {
    name: string;
    caption: string;
    size: string;
    type: string;
  };
}

export interface InquiryItem {
  id: string;
  ticketId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerInitials: string;
  customerAvatar?: string;
  subject: string;
  lastMessageSnippet: string;
  relatedOrderId: string;
  orderProductTitle?: string;
  orderTotal?: number;
  orderDate?: string;
  deliveryArea?: string;
  expectedDelivery?: string;
  category: InquiryCategory;
  priority: InquiryPriority;
  status: InquiryStatus;
  assignedTo: string;
  lastUpdated: string;
  openedDate: string;
  channel: 'Courier Dispute' | 'Customer Care' | 'Return & Damage' | 'Payment / eSewa';
  messages: InquiryMessage[];
}

const INITIAL_INQUIRIES: InquiryItem[] = [
  {
    id: 'inq-1',
    ticketId: '#TKT-2024001',
    customerName: 'Aaradhya Shrestha',
    customerEmail: 'aaradhya@example.com',
    customerPhone: '+977 9841234567',
    customerInitials: 'AS',
    subject: 'Delayed Delivery – Order #EP-02408',
    lastMessageSnippet: "Has there been any update from the courier? I still haven't received...",
    relatedOrderId: '#EP-02408',
    orderProductTitle: 'Sony WH-1000XM5 Wireless Headphones (Silver Edition)',
    orderTotal: 4850,
    orderDate: 'Dec 15, 2025',
    deliveryArea: 'Lalitpur Sector 4, near main post office',
    expectedDelivery: 'Dec 13 (customer evidence)',
    category: 'Shipping & Delivery',
    priority: 'High',
    status: 'Awaiting Reply',
    assignedTo: 'Manish (you)',
    lastUpdated: '10:32 AM Today',
    openedDate: 'Dec 15, 2025 · 9:18 AM',
    channel: 'Courier Dispute',
    messages: [
      {
        id: 'msg-1',
        senderName: 'Aaradhya Shrestha',
        senderRole: 'Customer',
        senderAvatar: 'AS',
        timestamp: '9:18 AM',
        dateLabel: 'Dec 15, 2025',
        message:
          'Hello support team, my order #EP-02408 was supposed to arrive 2 days ago according to the expected delivery timeline. There has been no update on the tracking page since it left Kathmandu hub. Can you please check?',
      },
      {
        id: 'msg-2',
        senderName: 'Priya',
        senderRole: 'Support agent',
        senderAvatar: 'PS',
        timestamp: '9:30 AM',
        message:
          'Namaste Aaradhya, thank you for reaching out to Everest Pasal support. I sincerely apologize for the delay. Let me check with our courier partner right away. Could you confirm if your delivery address is Lalitpur Sector 4?',
      },
      {
        id: 'msg-3',
        senderName: 'Aaradhya Shrestha',
        senderRole: 'Customer',
        senderAvatar: 'AS',
        timestamp: '11:45 AM',
        message:
          "Yes, that is correct: Lalitpur Sector 4, near the main post office. I've uploaded the screenshot of the delivery window showing Dec 13 as the expected arrival date.",
        attachment: {
          name: 'delivery_screenshot.png',
          caption: 'Expected delivery: Dec 13 · PNG image',
          size: '1.2 MB',
          type: 'image/png',
        },
      },
      {
        id: 'msg-sys-1',
        senderName: 'System',
        senderRole: 'System',
        senderAvatar: '⚙',
        timestamp: '11:50 AM',
        message: 'Ticket status changed to In Progress',
      },
      {
        id: 'msg-4',
        senderName: 'Priya',
        senderRole: 'Support agent',
        senderAvatar: 'PS',
        timestamp: '12:10 PM',
        message:
          'Thank you for confirming, Aaradhya. I have raised an urgent investigation with our Lalitpur logistics lead. They had some brief clearance delays because of local construction, but your package is now dispatched with courier Ram. I will reach out today by 5 PM.',
      },
      {
        id: 'msg-5',
        senderName: 'Aaradhya Shrestha',
        senderRole: 'Customer',
        senderAvatar: 'AS',
        timestamp: '10:32 AM',
        dateLabel: 'Today',
        message:
          "Has there been any update from the courier? I still haven't received my order.",
      },
    ],
  },
  {
    id: 'inq-2',
    ticketId: '#TKT-2024002',
    customerName: 'Rohan Shakya',
    customerEmail: 'rohan.shakya@gmail.np',
    customerPhone: '+977 9867890123',
    customerInitials: 'RS',
    subject: 'Return request verification – defective earphone',
    lastMessageSnippet: 'I uploaded the unboxing video, please check eSewa refund status.',
    relatedOrderId: '#EP-02395',
    orderProductTitle: 'Wireless Bluetooth Earbuds Pro (White)',
    orderTotal: 2600,
    orderDate: 'Dec 14, 2025',
    deliveryArea: 'New Baneshwor, Kathmandu',
    expectedDelivery: 'Dec 14',
    category: 'Returns & Refunds',
    priority: 'Medium',
    status: 'In Progress',
    assignedTo: 'Manish (you)',
    lastUpdated: '2 hours ago',
    openedDate: 'Dec 14, 2025 · 14:20 PM',
    channel: 'Return & Damage',
    messages: [
      {
        id: 'msg-201',
        senderName: 'Rohan Shakya',
        senderRole: 'Customer',
        senderAvatar: 'RS',
        timestamp: '2:20 PM',
        dateLabel: 'Dec 14, 2025',
        message: 'The right earbud does not turn on even after charging for 4 hours. Requesting replacement.',
      },
      {
        id: 'msg-202',
        senderName: 'Manish (you)',
        senderRole: 'Store Admin',
        senderAvatar: 'ME',
        timestamp: '3:05 PM',
        message: 'Hello Rohan, please upload a short unboxing or defect clip so our returns team can approve pickup.',
      },
    ],
  },
  {
    id: 'inq-3',
    ticketId: '#TKT-2024003',
    customerName: 'Sunita Maharjan',
    customerEmail: 'sunita.m@gmail.com',
    customerPhone: '+977 9851000111',
    customerInitials: 'SM',
    subject: 'Product Information Request – Smart LED TV warranty',
    lastMessageSnippet: 'Does this model come with 1 year official Nepal authorized brand warranty?',
    relatedOrderId: '#EP-02419',
    orderProductTitle: '43-inch 4K UHD Smart Android TV',
    orderTotal: 42000,
    orderDate: 'Dec 14, 2025',
    deliveryArea: 'Patan Dhoka, Lalitpur',
    expectedDelivery: 'Dec 16',
    category: 'Product Information',
    priority: 'Low',
    status: 'Open',
    assignedTo: 'Unassigned',
    lastUpdated: 'Dec 14, 2025',
    openedDate: 'Dec 14, 2025 · 10:00 AM',
    channel: 'Customer Care',
    messages: [
      {
        id: 'msg-301',
        senderName: 'Sunita Maharjan',
        senderRole: 'Customer',
        senderAvatar: 'SM',
        timestamp: '10:00 AM',
        dateLabel: 'Dec 14, 2025',
        message: 'Does this model come with 1 year official Nepal authorized brand warranty card included in the box?',
      },
    ],
  },
  {
    id: 'inq-4',
    ticketId: '#TKT-2024004',
    customerName: 'Bikram Thapa',
    customerEmail: 'bikram.t@outlook.com',
    customerPhone: '+977 9812445678',
    customerInitials: 'BT',
    subject: 'Fonepay double deduction during flash deal checkout',
    lastMessageSnippet: 'Fonepay debited NPR 3,450 twice from my Nabil Bank account during gateway error.',
    relatedOrderId: '#EP-02402',
    orderProductTitle: 'Mechanical Gaming Keyboard RGB',
    orderTotal: 3450,
    orderDate: 'Dec 14, 2025',
    deliveryArea: 'Chitwan, Narayangarh',
    expectedDelivery: 'Dec 15',
    category: 'Payment Issues',
    priority: 'Urgent',
    status: 'Awaiting Reply',
    assignedTo: 'Manish (you)',
    lastUpdated: 'Dec 14, 2025',
    openedDate: 'Dec 14, 2025 · 08:45 AM',
    channel: 'Payment / eSewa',
    messages: [
      {
        id: 'msg-401',
        senderName: 'Bikram Thapa',
        senderRole: 'Customer',
        senderAvatar: 'BT',
        timestamp: '8:45 AM',
        dateLabel: 'Dec 14, 2025',
        message: 'Fonepay debited NPR 3,450 twice from my Nabil Bank account during gateway error. Only one order was generated.',
      },
    ],
  },
  {
    id: 'inq-5',
    ticketId: '#TKT-2024005',
    customerName: 'Pramod KC',
    customerEmail: 'pramod.kc@yahoo.com',
    customerPhone: '+977 9823556778',
    customerInitials: 'PK',
    subject: 'Damaged Item Complaint – blender glass jar broken in transit',
    lastMessageSnippet: 'Courier package arrived completely cracked, courier representative noted it.',
    relatedOrderId: '#EP-02380',
    orderProductTitle: 'Heavy Duty 750W Kitchen Blender',
    orderTotal: 5800,
    orderDate: 'Dec 13, 2025',
    deliveryArea: 'Pokhara Lakeside, Ward 6',
    expectedDelivery: 'Dec 13',
    category: 'Shipping & Delivery',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Support Desk',
    lastUpdated: 'Dec 13, 2025',
    openedDate: 'Dec 13, 2025 · 16:15 PM',
    channel: 'Courier Dispute',
    messages: [
      {
        id: 'msg-501',
        senderName: 'Pramod KC',
        senderRole: 'Customer',
        senderAvatar: 'PK',
        timestamp: '4:15 PM',
        dateLabel: 'Dec 13, 2025',
        message: 'Courier package arrived completely cracked, courier representative noted it on the delivery manifest.',
      },
    ],
  },
  {
    id: 'inq-6',
    ticketId: '#TKT-2024006',
    customerName: 'Deepa Adhikari',
    customerEmail: 'deepa.adhikari@gmail.com',
    customerPhone: '+977 9876223901',
    customerInitials: 'DA',
    subject: 'Order Cancellation Request – wrong shipping address',
    lastMessageSnippet: 'Thank you, order was cancelled and voucher re-applied for Pokhara address.',
    relatedOrderId: '#EP-02431',
    orderProductTitle: 'Handmade Pashmina Shawl (Red Border)',
    orderTotal: 6900,
    orderDate: 'Dec 12, 2025',
    deliveryArea: 'Mahendranagar, Kanchanpur',
    expectedDelivery: 'Dec 12',
    category: 'General Inquiry',
    priority: 'Medium',
    status: 'Resolved',
    assignedTo: 'Manish (you)',
    lastUpdated: 'Dec 12, 2025',
    openedDate: 'Dec 12, 2025 · 11:30 AM',
    channel: 'Customer Care',
    messages: [
      {
        id: 'msg-601',
        senderName: 'Deepa Adhikari',
        senderRole: 'Customer',
        senderAvatar: 'DA',
        timestamp: '11:30 AM',
        dateLabel: 'Dec 12, 2025',
        message: 'I accidentally selected my old home address. Can I cancel before dispatch?',
      },
      {
        id: 'msg-602',
        senderName: 'Manish (you)',
        senderRole: 'Store Admin',
        senderAvatar: 'ME',
        timestamp: '11:42 AM',
        message: 'Cancelled immediately and refunded to original payment mode so you can re-order with your Pokhara address.',
      },
      {
        id: 'msg-603',
        senderName: 'Deepa Adhikari',
        senderRole: 'Customer',
        senderAvatar: 'DA',
        timestamp: '12:05 PM',
        message: 'Thank you, order was cancelled and voucher re-applied for Pokhara address.',
      },
    ],
  },
];

export const VendorInquiriesPage: React.FC = () => {
  // Navigation View State: 'list' | 'conversation' | 'create'
  const [viewMode, setViewMode] = useState<'list' | 'conversation' | 'create'>('list');
  const [inquiries, setInquiries] = useState<InquiryItem[]>(INITIAL_INQUIRIES);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem>(INITIAL_INQUIRIES[0]);

  // Filters State for Main List
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'awaiting' | 'inprogress' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [agentFilter, setAgentFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('30_days');
  const [sortFilter, setSortFilter] = useState('newest');

  // Selected Checkboxes for Bulk Operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Conversation Detail State
  const [replyTab, setReplyTab] = useState<'customer' | 'internal'>('customer');
  const [replyText, setReplyText] = useState('');
  const [isAttachingFile, setIsAttachingFile] = useState(false);

  // Create Form State
  const [createChannel, setCreateChannel] = useState<'Courier Dispute' | 'Customer Care' | 'Return & Damage' | 'Payment / eSewa'>('Courier Dispute');
  const [createSubject, setCreateSubject] = useState('Delayed Delivery – Order #EP-02408 (Lalitpur Hub Transit)');
  const [createCategory, setCreateCategory] = useState<InquiryCategory>('Shipping & Delivery');
  const [createPriority, setCreatePriority] = useState<InquiryPriority>('High');
  const [orderTrackingInput, setOrderTrackingInput] = useState('EP-02408');
  const [isOrderVerified, setIsOrderVerified] = useState(true);
  const [customerName, setCustomerName] = useState('Aaradhya Shrestha');
  const [customerEmail, setCustomerEmail] = useState('aaradhya@example.com');
  const [customerPhone, setCustomerPhone] = useState('+977 9841234567');
  const [deliveryHub, setDeliveryHub] = useState('Lalitpur Sector 4, near main post office');
  const [autoNotifyCustomer, setAutoNotifyCustomer] = useState(true);
  const [statementText, setStatementText] = useState(
    'Hello Lalitpur Logistics Team,\n\nThe buyer Aaradhya Shrestha reported non-receipt for Order #EP-02408. The package was scheduled for delivery on Dec 13, 2025 at Lalitpur Sector 4. The portal status shows stranded at Lalitpur sorting hub for over 48 hours without rider assignment.'
  );
  const [isInternalNoteOnly, setIsInternalNoteOnly] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: string }>>([
    { name: 'lalitpur_hub_transit_screenshot.png', size: '1.2 MB' },
  ]);
  const [assignedAgent, setAssignedAgent] = useState('Manish Sharma (You - Store Admin)');
  const [departmentEscalation, setDepartmentEscalation] = useState('Logistics & Delivery Liaison');

  // Load inquiries from Backend API with fallback
  useEffect(() => {
    ApiClient.get('/api/v1/vendor/inquiries')
      .then((res: any) => {
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          // Merge with initial detail messages so the full conversation tree stays interactive
          const merged = res.data.map((item: any, idx: number) => {
            const fallback = INITIAL_INQUIRIES[idx] || INITIAL_INQUIRIES[0];
            return {
              ...fallback,
              ...item,
              messages: item.messages || fallback.messages,
            };
          });
          setInquiries(merged);
        }
      })
      .catch((err) => {
        console.warn('[Inquiries] Using initial baseline state:', err.message);
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter Logic
  const filteredInquiries = inquiries.filter((item) => {
    // Tab Filter
    if (activeTab === 'open' && item.status !== 'Open') return false;
    if (activeTab === 'awaiting' && item.status !== 'Awaiting Reply') return false;
    if (activeTab === 'inprogress' && item.status !== 'In Progress') return false;
    if (activeTab === 'resolved' && item.status !== 'Resolved' && item.status !== 'Closed') return false;

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.ticketId.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.relatedOrderId.toLowerCase().includes(q) ||
        item.lastMessageSnippet.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Dropdown Filters
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
    if (priorityFilter !== 'All' && item.priority !== priorityFilter) return false;
    if (agentFilter !== 'All') {
      if (agentFilter === 'You' && !item.assignedTo.includes('you')) return false;
      if (agentFilter === 'Unassigned' && item.assignedTo !== 'Unassigned') return false;
    }

    return true;
  });

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredInquiries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInquiries.map((i) => i.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkStatusChange = (newStatus: InquiryStatus) => {
    if (selectedIds.length === 0) return;
    setInquiries((prev) =>
      prev.map((inq) => (selectedIds.includes(inq.id) ? { ...inq, status: newStatus } : inq))
    );
    selectedIds.forEach((id) => {
      ApiClient.patch(`/api/v1/vendor/inquiries/${id}/status`, { status: newStatus }).catch(() => {});
    });
    showToast(`Updated status to ${newStatus} for ${selectedIds.length} inquiries.`);
    setSelectedIds([]);
  };

  // Open Conversation
  const handleOpenConversation = (inquiry: InquiryItem) => {
    setSelectedInquiry(inquiry);
    setViewMode('conversation');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    ApiClient.get(`/api/v1/vendor/inquiries/${inquiry.id}`)
      .then((res: any) => {
        if (res?.messages && Array.isArray(res.messages)) {
          setSelectedInquiry((prev) => ({
            ...prev,
            messages: res.messages,
          }));
        }
      })
      .catch(() => {});
  };

  // Send Reply
  const handleSendReply = () => {
    if (!replyText.trim()) return;

    const newMsg: InquiryMessage = {
      id: `msg-${Date.now()}`,
      senderName: replyTab === 'customer' ? 'Manish (you)' : 'Internal Staff Note',
      senderRole: replyTab === 'customer' ? 'Store Admin' : 'Store Admin',
      senderAvatar: 'ME',
      timestamp: 'Just now',
      message: replyText.trim(),
      isInternal: replyTab === 'internal',
    };

    const updated = {
      ...selectedInquiry,
      status: replyTab === 'customer' ? ('In Progress' as InquiryStatus) : selectedInquiry.status,
      lastUpdated: 'Just now',
      lastMessageSnippet: replyText.slice(0, 75) + '...',
      messages: [...selectedInquiry.messages, newMsg],
    };

    setSelectedInquiry(updated);
    setInquiries((prev) => prev.map((inq) => (inq.id === updated.id ? updated : inq)));
    setReplyText('');
    showToast(replyTab === 'customer' ? 'Reply sent to customer.' : 'Internal note saved.');

    ApiClient.post(`/api/v1/vendor/inquiries/${selectedInquiry.id}/messages`, {
      body: newMsg.message,
      isInternal: newMsg.isInternal,
    }).catch(() => {});
  };

  // Verify Order Linkage in Create View
  const handleVerifyOrder = () => {
    if (!orderTrackingInput.trim()) return;
    setIsOrderVerified(true);
    setCustomerName('Aaradhya Shrestha');
    setCustomerEmail('aaradhya@example.com');
    setCustomerPhone('+977 9841234567');
    setDeliveryHub('Lalitpur Sector 4, near main post office');
    showToast(`Order ${orderTrackingInput.toUpperCase()} verified and linked.`);

    ApiClient.post('/api/v1/vendor/inquiries/verify-order', { trackingId: orderTrackingInput })
      .then((res: any) => {
        if (res?.customer) {
          setCustomerName(res.customer.name);
          setCustomerEmail(res.customer.email);
          setCustomerPhone(res.customer.phone);
          if (res.customer.deliveryAddress) setDeliveryHub(res.customer.deliveryAddress);
        }
      })
      .catch(() => {});
  };

  // Insert Template
  const handleInsertTemplate = (type: string) => {
    if (type === 'transit_delay') {
      setStatementText(
        'Hello Lalitpur Logistics Team,\n\nThe buyer reported non-receipt for Order #EP-02408. The package was scheduled for delivery on Dec 13, 2025 at Lalitpur Sector 4. The portal status shows stranded at Lalitpur sorting hub for over 48 hours without rider assignment.'
      );
    } else if (type === 'return_defect') {
      setStatementText(
        'Hello Returns Evaluation Team,\n\nThe customer received the item in defective condition. Unboxing footage and packaging serial label have been verified. Requesting reverse pickup courier assignment.'
      );
    } else if (type === 'esewa_discrepancy') {
      setStatementText(
        'Hello Settlements & Finance Team,\n\nBuyer experienced an API timeout during checkout. Fonepay/eSewa deducted NPR 3,450 twice from the buyer’s account. Please review transaction reference logs and process reconciliation.'
      );
    }
    showToast('Template statement applied.');
  };

  // Submit New Inquiry
  const handleSubmitNewInquiry = () => {
    if (!createSubject.trim() || !statementText.trim()) {
      showToast('Please fill out the mandatory fields.');
      return;
    }

    const newTicketId = `#TKT-2025${Math.floor(100 + Math.random() * 900)}`;
    const newInquiry: InquiryItem = {
      id: `inq-${Date.now()}`,
      ticketId: newTicketId,
      customerName: customerName || 'Aaradhya Shrestha',
      customerEmail: customerEmail || 'aaradhya@example.com',
      customerPhone: customerPhone,
      customerInitials: 'AS',
      subject: createSubject,
      lastMessageSnippet: statementText.slice(0, 80) + '...',
      relatedOrderId: orderTrackingInput.startsWith('#') ? orderTrackingInput : `#${orderTrackingInput}`,
      orderProductTitle: 'Sony WH-1000XM5 Wireless Headphones (Silver Edition)',
      orderTotal: 4850,
      orderDate: 'Dec 15, 2025',
      deliveryArea: deliveryHub,
      expectedDelivery: 'Dec 13',
      category: createCategory,
      priority: createPriority,
      status: 'Open',
      assignedTo: 'Manish (you)',
      lastUpdated: 'Just now',
      openedDate: 'Just now',
      channel: createChannel,
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderName: 'Manish (you)',
          senderRole: 'Store Admin',
          senderAvatar: 'ME',
          timestamp: 'Just now',
          dateLabel: 'Today',
          message: statementText,
          isInternal: isInternalNoteOnly,
        },
      ],
    };

    setInquiries([newInquiry, ...inquiries]);
    setSelectedInquiry(newInquiry);
    setViewMode('conversation');
    showToast(`Ticket ${newTicketId} created successfully.`);

    ApiClient.post('/api/v1/vendor/inquiries', {
      channel: createChannel,
      subject: createSubject,
      category: createCategory,
      priority: createPriority,
      orderTrackingId: orderTrackingInput,
      customerName,
      customerEmail,
      customerPhone,
      deliveryHub,
      autoNotifyCustomer,
      statement: statementText,
      isInternalOnly: isInternalNoteOnly,
      assignedAgent,
    }).catch(() => {});
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative',
        fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#0F172A',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            zIndex: 9999,
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CUSTOMER INQUIRIES MAIN LIST VIEW (media_1794203813520_dcec1392.jpg) */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <>
          {/* Top Title & Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.4px' }}>
                Customer Inquiries
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                Manage customer questions, delivery issues, complaints, and support requests.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => showToast('Exporting inquiries CSV...')}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  border: '1px solid #CBD5E1',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>📥</span> Export CSV
              </button>

              <button
                onClick={() => setViewMode('create')}
                style={{
                  backgroundColor: '#1A56DB',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                  boxShadow: '0 2px 6px rgba(26, 86, 219, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>+</span> Create Inquiry
              </button>
            </div>
          </div>

          {/* 5 KPI Stat Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
            {/* Card 1: Total Inquiries */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px 18px', border: '1px solid #ECECEC', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                <span>Total Inquiries</span>
                <span>💬</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                156
              </div>
              <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600, marginTop: '4px' }}>
                +12 this week
              </div>
            </div>

            {/* Card 2: Open */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px 18px', border: '1px solid #ECECEC', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284C7' }}></span>
                <span>Open</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                42
              </div>
              <div style={{ marginTop: '4px' }}>
                <span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                  New Queue
                </span>
              </div>
            </div>

            {/* Card 3: Awaiting Reply */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px 18px', border: '1px solid #ECECEC', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></span>
                <span>Awaiting Reply</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                8
              </div>
              <div style={{ marginTop: '4px' }}>
                <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                  Action required
                </span>
              </div>
            </div>

            {/* Card 4: In Progress */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px 18px', border: '1px solid #ECECEC', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6' }}></span>
                <span>In Progress</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                14
              </div>
              <div style={{ marginTop: '4px' }}>
                <span style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                  Being handled
                </span>
              </div>
            </div>

            {/* Card 5: Resolved */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px 18px', border: '1px solid #ECECEC', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                <span>Resolved</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                92
              </div>
              <div style={{ marginTop: '4px' }}>
                <span style={{ backgroundColor: '#ECFDF5', color: '#047857', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                  94% SLA met
                </span>
              </div>
            </div>
          </div>

          {/* Main Card: Inquiries Tabs, Toolbar & Table */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            {/* Tab Navigation Row */}
            <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #F1F5F9', padding: '0 20px', fontSize: '13px', fontWeight: 600 }}>
              <span
                onClick={() => setActiveTab('all')}
                style={{
                  padding: '14px 0',
                  color: activeTab === 'all' ? '#1A56DB' : '#64748B',
                  borderBottom: activeTab === 'all' ? '2.5px solid #1A56DB' : '2.5px solid transparent',
                  cursor: 'pointer',
                }}
              >
                All Inquiries <span style={{ color: '#94A3B8', fontWeight: 500 }}>156</span>
              </span>

              <span
                onClick={() => setActiveTab('open')}
                style={{
                  padding: '14px 0',
                  color: activeTab === 'open' ? '#1A56DB' : '#64748B',
                  borderBottom: activeTab === 'open' ? '2.5px solid #1A56DB' : '2.5px solid transparent',
                  cursor: 'pointer',
                }}
              >
                Open <span style={{ color: '#94A3B8', fontWeight: 500 }}>42</span>
              </span>

              <span
                onClick={() => setActiveTab('awaiting')}
                style={{
                  padding: '14px 0',
                  color: activeTab === 'awaiting' ? '#1A56DB' : '#64748B',
                  borderBottom: activeTab === 'awaiting' ? '2.5px solid #1A56DB' : '2.5px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></span>
                Awaiting Reply <span style={{ color: '#94A3B8', fontWeight: 500 }}>8</span>
              </span>

              <span
                onClick={() => setActiveTab('inprogress')}
                style={{
                  padding: '14px 0',
                  color: activeTab === 'inprogress' ? '#1A56DB' : '#64748B',
                  borderBottom: activeTab === 'inprogress' ? '2.5px solid #1A56DB' : '2.5px solid transparent',
                  cursor: 'pointer',
                }}
              >
                In Progress <span style={{ color: '#94A3B8', fontWeight: 500 }}>14</span>
              </span>

              <span
                onClick={() => setActiveTab('resolved')}
                style={{
                  padding: '14px 0',
                  color: activeTab === 'resolved' ? '#1A56DB' : '#64748B',
                  borderBottom: activeTab === 'resolved' ? '2.5px solid #1A56DB' : '2.5px solid transparent',
                  cursor: 'pointer',
                }}
              >
                Resolved <span style={{ color: '#94A3B8', fontWeight: 500 }}>92</span>
              </span>
            </div>

            {/* Filter Dropdowns & Search Toolbar */}
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', backgroundColor: '#FFFFFF' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                <span style={{ position: 'absolute', left: '12px', top: '9px', color: '#94A3B8', fontSize: '13px' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search by ticket ID, customer, subject, or order number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12.5px',
                    outline: 'none',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                  color: '#334155',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                <option value="All">Status: All ▾</option>
                <option value="Open">Open</option>
                <option value="Awaiting Reply">Awaiting Reply</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                  color: '#334155',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                <option value="All">Category: All ▾</option>
                <option value="Shipping & Delivery">Shipping & Delivery</option>
                <option value="Returns & Refunds">Returns & Refunds</option>
                <option value="Product Information">Product Information</option>
                <option value="Payment Issues">Payment Issues</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                  color: '#334155',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                <option value="All">Priority ▾</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>

              {/* Agent Filter */}
              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                  color: '#334155',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                <option value="All">Agent ▾</option>
                <option value="You">Manish (you)</option>
                <option value="Unassigned">Unassigned</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                  color: '#334155',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                <option value="30_days">Last 30 Days ▾</option>
                <option value="7_days">Last 7 Days</option>
                <option value="today">Today</option>
              </select>

              {/* Sort Filter */}
              <select
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                  color: '#334155',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                <option value="newest">Newest First ▾</option>
                <option value="oldest">Oldest First</option>
                <option value="urgent">Highest Priority</option>
              </select>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                  setCategoryFilter('All');
                  setPriorityFilter('All');
                  setAgentFilter('All');
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px 8px',
                }}
              >
                Clear
              </button>
            </div>

            {/* Bulk Action Sub-bar */}
            <div
              style={{
                padding: '10px 20px',
                backgroundColor: '#F8FAFC',
                borderTop: '1px solid #F1F5F9',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#475569',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === filteredInquiries.length}
                  onChange={toggleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 600 }}>Select all inquiries</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#94A3B8' }}>{selectedIds.length} selected</span>

                <button
                  onClick={() => showToast(`Marked ${selectedIds.length} as read`)}
                  disabled={selectedIds.length === 0}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: selectedIds.length > 0 ? '#334155' : '#CBD5E1',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed',
                  }}
                >
                  Mark as Read
                </button>

                <button
                  onClick={() => showToast(`Assigning agent for ${selectedIds.length} tickets`)}
                  disabled={selectedIds.length === 0}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: selectedIds.length > 0 ? '#334155' : '#CBD5E1',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed',
                  }}
                >
                  Assign Agent
                </button>

                <button
                  onClick={() => handleBulkStatusChange('In Progress')}
                  disabled={selectedIds.length === 0}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: selectedIds.length > 0 ? '#334155' : '#CBD5E1',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed',
                  }}
                >
                  Change Status
                </button>

                <button
                  onClick={() => handleBulkStatusChange('Resolved')}
                  disabled={selectedIds.length === 0}
                  style={{
                    backgroundColor: selectedIds.length > 0 ? '#10B981' : '#E2E8F0',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '5px 14px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed',
                  }}
                >
                  Mark as Resolved
                </button>
              </div>
            </div>

            {/* Inquiries Table */}
            <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '1080px', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      textAlign: 'left',
                      color: '#64748B',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <th style={{ padding: '12px 14px', width: '38px', whiteSpace: 'nowrap' }}></th>
                    <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Ticket ID</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Customer</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Subject & Last Message</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Related Order</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Category</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Priority</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Status</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Assigned To</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Last Updated</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.map((inq) => {
                    const isSelected = selectedIds.includes(inq.id);

                    // Priority Pill Colors
                    const priorityBg =
                      inq.priority === 'Urgent'
                        ? '#FEE2E2'
                        : inq.priority === 'High'
                        ? '#FFF7ED'
                        : inq.priority === 'Medium'
                        ? '#EFF6FF'
                        : '#F1F5F9';

                    const priorityColor =
                      inq.priority === 'Urgent'
                        ? '#DC2626'
                        : inq.priority === 'High'
                        ? '#EA580C'
                        : inq.priority === 'Medium'
                        ? '#2563EB'
                        : '#64748B';

                    // Status Pill Colors
                    const statusBg =
                      inq.status === 'Awaiting Reply'
                        ? '#FEF3C7'
                        : inq.status === 'In Progress'
                        ? '#EFF6FF'
                        : inq.status === 'Resolved'
                        ? '#ECFDF5'
                        : '#E0F2FE';

                    const statusColor =
                      inq.status === 'Awaiting Reply'
                        ? '#D97706'
                        : inq.status === 'In Progress'
                        ? '#2563EB'
                        : inq.status === 'Resolved'
                        ? '#16A34A'
                        : '#0284C7';

                    const statusDot =
                      inq.status === 'Awaiting Reply'
                        ? '#F59E0B'
                        : inq.status === 'In Progress'
                        ? '#3B82F6'
                        : inq.status === 'Resolved'
                        ? '#10B981'
                        : '#0284C7';

                    return (
                      <tr
                        key={inq.id}
                        onClick={() => handleOpenConversation(inq)}
                        style={{
                          borderBottom: '1px solid #F8FAFC',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#F0FDF4' : '#FFFFFF',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = '#FFFFFF';
                        }}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: '14px', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(inq.id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>

                        {/* Ticket ID */}
                        <td style={{ padding: '14px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>
                          {inq.ticketId}
                        </td>

                        {/* Customer */}
                        <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: '#E0E7FF',
                                color: '#3730A3',
                                fontWeight: 700,
                                fontSize: '11.5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {inq.customerInitials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '12.5px' }}>
                                {inq.customerName}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748B' }}>
                                {inq.customerEmail}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Subject & Snippet */}
                        <td style={{ padding: '14px 16px', maxWidth: '340px' }}>
                          <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '13px', lineHeight: '1.4' }}>
                            {inq.subject}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            "{inq.lastMessageSnippet}"
                          </div>
                        </td>

                        {/* Related Order */}
                        <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                          <span style={{ color: '#1A56DB', fontWeight: 600, fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {inq.relatedOrderId} <span>↗</span>
                          </span>
                        </td>

                        {/* Category */}
                        <td style={{ padding: '14px', color: '#475569', fontSize: '12px', whiteSpace: 'nowrap' }}>
                          {inq.category}
                        </td>

                        {/* Priority */}
                        <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              backgroundColor: priorityBg,
                              color: priorityColor,
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            {inq.priority}
                          </span>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              backgroundColor: statusBg,
                              color: statusColor,
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusDot }}></span>
                            {inq.status}
                          </span>
                        </td>

                        {/* Assigned To */}
                        <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {inq.assignedTo !== 'Unassigned' && (
                              <div
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  backgroundColor: '#1E40AF',
                                  color: '#FFFFFF',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                M
                              </div>
                            )}
                            <span style={{ fontSize: '12px', color: inq.assignedTo === 'Unassigned' ? '#94A3B8' : '#334155', fontStyle: inq.assignedTo === 'Unassigned' ? 'italic' : 'normal' }}>
                              {inq.assignedTo}
                            </span>
                          </div>
                        </td>

                        {/* Last Updated */}
                        <td style={{ padding: '14px', color: '#64748B', fontSize: '12px', whiteSpace: 'nowrap' }}>
                          {inq.lastUpdated}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenConversation(inq)}
                            style={{
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              color: '#0F172A',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Footer */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12.5px',
                color: '#64748B',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>Showing 1–{filteredInquiries.length} of 248 transactions</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#64748B', cursor: 'pointer' }}>
                  ←
                </button>
                <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', backgroundColor: '#E11D48', color: '#FFFFFF', fontWeight: 700 }}>
                  1
                </button>
                <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#475569', cursor: 'pointer' }}>
                  2
                </button>
                <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#475569', cursor: 'pointer' }}>
                  3
                </button>
                <span style={{ padding: '0 4px', color: '#94A3B8' }}>…</span>
                <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#475569', cursor: 'pointer' }}>
                  10
                </button>
                <button style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#64748B', cursor: 'pointer' }}>
                  →
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Items per page:</span>
                <select
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    color: '#334155',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="25">25 ▾</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. CUSTOMER INQUIRY CONVERSATION VIEW (media_1794203813534_a3986dcf.jpg) */}
      {/* ========================================================================= */}
      {viewMode === 'conversation' && (
        <>
          {/* Back Navigation Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#1A56DB',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                ← Back
              </button>
              <span style={{ color: '#CBD5E1' }}>/</span>
              <span style={{ color: '#64748B' }}>Customer Inquiries</span>
              <span style={{ color: '#CBD5E1' }}>/</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>Ticket {selectedInquiry.ticketId}</span>
            </div>

            <button
              onClick={() => showToast(`Opening order ${selectedInquiry.relatedOrderId}...`)}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#1A56DB',
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Order
            </button>
          </div>

          {/* Ticket Header Banner */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {selectedInquiry.subject}
            </h1>
            <div style={{ fontSize: '12.5px', color: '#64748B' }}>
              {selectedInquiry.customerName} · {selectedInquiry.customerEmail}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px' }}>
                {selectedInquiry.category.split(' ')[0]}
              </span>
              <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px' }}>
                {selectedInquiry.status}
              </span>
              <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                Opened {selectedInquiry.openedDate} · Last updated {selectedInquiry.lastUpdated}
              </span>
            </div>
          </div>

          {/* 2-Column Conversation Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '20px', alignItems: 'start' }}>
            {/* Left Column: Messages Thread & Reply Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
              {/* Thread Card */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Conversation
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    {selectedInquiry.messages.length} messages · 1 attachment
                  </span>
                </div>

                {/* Messages List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {selectedInquiry.messages.map((msg) => {
                    // System Notification divider
                    if (msg.senderRole === 'System') {
                      return (
                        <div key={msg.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0' }}>
                          <span style={{ fontSize: '11px', color: '#64748B', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 12px', borderRadius: '12px' }}>
                            🕒 {msg.message}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id}>
                        {/* Optional Date separator */}
                        {msg.dateLabel && (
                          <div style={{ textAlign: 'center', margin: '10px 0 16px 0', borderBottom: '1px solid #F1F5F9', lineHeight: '0.1em' }}>
                            <span style={{ background: '#FFFFFF', padding: '0 12px', fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
                              {msg.dateLabel}
                            </span>
                          </div>
                        )}

                        <div
                          style={{
                            display: 'flex',
                            gap: '14px',
                            backgroundColor: msg.isInternal ? '#FFFBEB' : '#FFFFFF',
                            borderRadius: '10px',
                            padding: msg.isInternal ? '12px' : '4px 0',
                            border: msg.isInternal ? '1px dashed #F59E0B' : 'none',
                          }}
                        >
                          {/* Avatar */}
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: msg.senderRole === 'Customer' ? '#E0E7FF' : '#1E40AF',
                              color: msg.senderRole === 'Customer' ? '#3730A3' : '#FFFFFF',
                              fontWeight: 700,
                              fontSize: '12.5px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {msg.senderAvatar}
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '13px' }}>
                                {msg.senderName}
                              </span>
                              <span style={{ fontSize: '11px', color: '#64748B' }}>
                                {msg.senderRole}
                              </span>
                              {msg.isInternal && (
                                <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>
                                  INTERNAL NOTE
                                </span>
                              )}
                              <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#94A3B8' }}>
                                {msg.timestamp}
                              </span>
                            </div>

                            <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', margin: '0 0 10px 0' }}>
                              {msg.message}
                            </p>

                            {/* Attached Screenshot preview */}
                            {msg.attachment && (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '10px 14px',
                                  backgroundColor: '#F8FAFC',
                                  borderRadius: '8px',
                                  border: '1px solid #E2E8F0',
                                  maxWidth: '380px',
                                  marginTop: '8px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ fontSize: '18px' }}>🖼️</span>
                                  <div>
                                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                                      {msg.attachment.name}
                                    </div>
                                    <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                                      {msg.attachment.caption}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => showToast(`Downloading ${msg.attachment?.name}...`)}
                                  style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#64748B',
                                  }}
                                >
                                  📥
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reply Box Card */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', marginBottom: '14px' }}>
                  <button
                    onClick={() => setReplyTab('customer')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: replyTab === 'customer' ? '2px solid #1A56DB' : '2px solid transparent',
                      color: replyTab === 'customer' ? '#1A56DB' : '#64748B',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      paddingBottom: '6px',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    Customer reply
                  </button>
                  <button
                    onClick={() => setReplyTab('internal')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: replyTab === 'internal' ? '2px solid #1A56DB' : '2px solid transparent',
                      color: replyTab === 'internal' ? '#1A56DB' : '#64748B',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      paddingBottom: '6px',
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    Internal note
                  </button>
                </div>

                {/* Textarea */}
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={replyTab === 'customer' ? `Write a reply to ${selectedInquiry.customerName}...` : 'Write an internal note for your team and Everest Pasal logistics...'}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '13px',
                    fontFamily: "'Poppins', sans-serif",
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Bottom Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#64748B' }}>
                      <span>👁</span>
                      <span>{replyTab === 'customer' ? 'Visible to the customer' : 'Private to team only'}</span>
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '2px' }}>
                      Internal notes are visible only to your team and are not sent to the customer.
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => showToast('Attachment dialog opened')}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        color: '#0F172A',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      Attach
                    </button>

                    <button
                      onClick={handleSendReply}
                      style={{
                        backgroundColor: '#1A56DB',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '8px 20px',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: "'Poppins', sans-serif",
                        boxShadow: '0 2px 6px rgba(26, 86, 219, 0.25)',
                      }}
                    >
                      Send reply
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Ticket Sidebar Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
              {/* Card 1: Ticket Details */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 14px 0' }}>
                  Ticket details
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Ticket ID</span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>{selectedInquiry.ticketId}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Category</span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>{selectedInquiry.category}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Created</span>
                    <span style={{ color: '#0F172A' }}>{selectedInquiry.openedDate}</span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                      Assigned to
                    </label>
                    <select
                      value={selectedInquiry.assignedTo}
                      onChange={(e) => {
                        const val = e.target.value;
                        const upd = { ...selectedInquiry, assignedTo: val };
                        setSelectedInquiry(upd);
                        setInquiries((prev) => prev.map((inq) => (inq.id === upd.id ? upd : inq)));
                        showToast(`Assigned to ${val}`);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                        color: '#0F172A',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <option value="Manish (you)">Manish (you)</option>
                      <option value="Support Desk">Support Desk</option>
                      <option value="Unassigned">Unassigned</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                      Status
                    </label>
                    <select
                      value={selectedInquiry.status}
                      onChange={(e) => {
                        const val = e.target.value as InquiryStatus;
                        const upd = { ...selectedInquiry, status: val };
                        setSelectedInquiry(upd);
                        setInquiries((prev) => prev.map((inq) => (inq.id === upd.id ? upd : inq)));
                        showToast(`Status updated to ${val}`);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                        color: '#0F172A',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <option value="Open">Open</option>
                      <option value="Awaiting Reply">Awaiting reply</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Waiting Alert Notice */}
                <div
                  style={{
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FCD34D',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    marginTop: '14px',
                    fontSize: '11.5px',
                    color: '#92400E',
                    lineHeight: '1.4',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  <span>🕒</span>
                  <div>
                    <strong>{selectedInquiry.customerName}</strong> is waiting for your response. Last customer message: {selectedInquiry.lastUpdated}.
                  </div>
                </div>
              </div>

              {/* Card 2: Customer */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 14px 0' }}>
                  Customer
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#E0E7FF',
                      color: '#3730A3',
                      fontWeight: 700,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {selectedInquiry.customerInitials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '13.5px' }}>
                      {selectedInquiry.customerName}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                      {selectedInquiry.customerEmail}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Related Order */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Related order
                  </h3>
                  <span style={{ color: '#1A56DB', fontSize: '14px', cursor: 'pointer' }}>↗</span>
                </div>

                {/* Route Visual Illustration */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span>📦</span>
                  <div style={{ flex: 1, borderTop: '2px dashed #CBD5E1', margin: '0 10px' }}></div>
                  <span>📍</span>
                </div>

                <div style={{ fontWeight: 700, color: '#1A56DB', fontSize: '13.5px' }}>
                  Order {selectedInquiry.relatedOrderId}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                  Delayed delivery · Tracking inquiry
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '12px', paddingTop: '10px', fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Expected by</span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>{selectedInquiry.expectedDelivery || 'Dec 13'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Delivery area</span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>{selectedInquiry.deliveryArea}</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Attachments */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 12px 0' }}>
                  Attachments (1)
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🖼️</span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>delivery_screenshot.png</div>
                      <div style={{ fontSize: '10.5px', color: '#64748B' }}>Expected delivery: Dec 13 · PNG image</div>
                    </div>
                  </div>
                  <span style={{ cursor: 'pointer', fontSize: '14px', color: '#64748B' }}>📥</span>
                </div>
                <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '6px' }}>
                  Uploaded by {selectedInquiry.customerName} · Dec 15, 11:45 AM
                </div>
              </div>

              {/* Card 5: Keep Team Notes Private */}
              <div
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
                }}
              >
                <div style={{ fontSize: '13.5px', fontWeight: 700 }}>Keep team notes private</div>
                <div style={{ fontSize: '11.5px', opacity: 0.9, marginTop: '3px' }}>
                  Use internal note for courier follow-ups.
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. CREATE NEW INQUIRY VIEW (media_1794203813509_21b95687.jpg) */}
      {/* ========================================================================= */}
      {viewMode === 'create' && (
        <>
          {/* Top Navigation & Status Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#1A56DB',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                ← Back to Inquiries
              </button>
              <span style={{ color: '#CBD5E1' }}>/</span>
              <span style={{ color: '#64748B' }}>Customer Engagement</span>
              <span style={{ color: '#CBD5E1' }}>/</span>
              <span style={{ color: '#64748B' }}>Customer Inquiries</span>
              <span style={{ color: '#CBD5E1' }}>/</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>Create New Inquiry</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '11px', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                Auto-save enabled
              </span>
              <span style={{ backgroundColor: '#EFF6FF', color: '#1A56DB', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                Ticket Ref: #TKT-2025-AUTO
              </span>
            </div>
          </div>

          {/* Page Heading & Header Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Create New Inquiry
                </h1>
                <span style={{ backgroundColor: '#EFF6FF', color: '#1A56DB', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                  VENDOR ASSIST
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                Initiate an official ticket or dispute with Everest Pasal logistics, buyer support, or settlement specialists.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => showToast('Draft saved.')}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  border: '1px solid #CBD5E1',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                💾 Save Draft
              </button>

              <button
                onClick={handleSubmitNewInquiry}
                style={{
                  backgroundColor: '#1A56DB',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 22px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                  boxShadow: '0 2px 6px rgba(26, 86, 219, 0.25)',
                }}
              >
                Submit inquiry ➔
              </button>
            </div>
          </div>

          {/* 2-Column Main Create Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '20px', alignItems: 'start' }}>
            {/* Left Column: 3 Numbered Form Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
              {/* SECTION 1: Inquiry Details & Classification */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1A56DB', color: '#FFFFFF', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      1
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        Inquiry Details & Classification
                      </h3>
                      <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                        Select the issue channel, priority tier, and descriptive title.
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#E11D48', fontWeight: 600 }}>* Mandatory</span>
                </div>

                {/* Channel Selector (4 Large Cards) */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                    Inquiry Channel / Operational Scope *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {[
                      { id: 'Courier Dispute', icon: '🚚', subtitle: 'Rider / transit delay' },
                      { id: 'Customer Care', icon: '🎧', subtitle: 'Direct buyer ticket' },
                      { id: 'Return & Damage', icon: '📦', subtitle: 'Unbox proof / RTO' },
                      { id: 'Payment / eSewa', icon: '💳', subtitle: 'Fonepay & COD mismatch' },
                    ].map((chan) => {
                      const isSelected = createChannel === chan.id;
                      return (
                        <div
                          key={chan.id}
                          onClick={() => setCreateChannel(chan.id as any)}
                          style={{
                            padding: '14px 12px',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid #1A56DB' : '1px solid #E2E8F0',
                            backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '20px' }}>{chan.icon}</span>
                            {isSelected && <span style={{ color: '#1A56DB', fontWeight: 800, fontSize: '12px' }}>✓</span>}
                          </div>
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', marginTop: '8px' }}>
                            {chan.id}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                            {chan.subtitle}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Subject Title Input */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Subject Title *</label>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Max 120 characters</span>
                  </div>
                  <input
                    type="text"
                    value={createSubject}
                    onChange={(e) => setCreateSubject(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      fontFamily: "'Poppins', sans-serif",
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Category & Priority Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Category *
                    </label>
                    <select
                      value={createCategory}
                      onChange={(e) => setCreateCategory(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '12.5px',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      <option value="Shipping & Delivery">Shipping & Delivery (Lalitpur / KTM)</option>
                      <option value="Returns & Refunds">Returns & Replacements</option>
                      <option value="Product Information">Product Specification Inquiry</option>
                      <option value="Payment Issues">Payment & Settlement Dispute</option>
                      <option value="General Inquiry">General Store Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Priority Level *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {(['Low', 'Medium', 'High', 'Urgent'] as InquiryPriority[]).map((p) => {
                        const isSelected = createPriority === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setCreatePriority(p)}
                            style={{
                              padding: '8px 4px',
                              borderRadius: '6px',
                              border: isSelected ? '1px solid #1A56DB' : '1px solid #E2E8F0',
                              backgroundColor: isSelected ? (p === 'Urgent' ? '#DC2626' : '#1A56DB') : '#FFFFFF',
                              color: isSelected ? '#FFFFFF' : '#334155',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          >
                            ● {p === 'Medium' ? 'Med' : p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Order Linkage & Buyer Profile */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1A56DB', color: '#FFFFFF', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      2
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        Order Linkage & Buyer Profile
                      </h3>
                      <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                        Search or confirm the associated marketplace transaction ID.
                      </p>
                    </div>
                  </div>

                  {isOrderVerified && (
                    <span style={{ backgroundColor: '#ECFDF5', color: '#16A34A', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                      EP-02408 · Linked & Verified
                    </span>
                  )}
                </div>

                {/* Tracking ID Search Bar */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Everest Order Tracking ID *
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <span style={{ position: 'absolute', left: '12px', top: '9px', color: '#94A3B8' }}>🔍</span>
                      <input
                        type="text"
                        value={orderTrackingInput}
                        onChange={(e) => setOrderTrackingInput(e.target.value)}
                        placeholder="e.g. EP-02408"
                        style={{
                          width: '100%',
                          padding: '9px 12px 9px 34px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px',
                          outline: 'none',
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyOrder}
                      style={{
                        padding: '9px 18px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #1A56DB',
                        color: '#1A56DB',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      Verify Order
                    </button>
                  </div>
                </div>

                {/* Verified Order Summary Banner */}
                {isOrderVerified && (
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '18px',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#1A56DB', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        📦
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px' }}>
                            Order #EP-02408
                          </span>
                          <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>
                            IN TRANSIT
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          Sony WH-1000XM5 Wireless Headphones (Silver Edition)
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', fontSize: '11.5px', textAlign: 'right' }}>
                      <div>
                        <div style={{ color: '#94A3B8', textTransform: 'uppercase', fontSize: '10px', fontWeight: 600 }}>ORDER TOTAL</div>
                        <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '13px' }}>NPR 4,850</div>
                      </div>
                      <div>
                        <div style={{ color: '#94A3B8', textTransform: 'uppercase', fontSize: '10px', fontWeight: 600 }}>ORDER DATE</div>
                        <div style={{ color: '#0F172A', fontWeight: 600 }}>Dec 15, 2025</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buyer Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Customer Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Customer Email</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Customer Phone (Nepal)</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Delivery Destination / Hub</label>
                    <input
                      type="text"
                      value={deliveryHub}
                      onChange={(e) => setDeliveryHub(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* SMS & Email Checkbox */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#334155', marginTop: '10px' }}>
                  <input
                    type="checkbox"
                    checked={autoNotifyCustomer}
                    onChange={(e) => setAutoNotifyCustomer(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>
                    <strong>Auto-notify Customer via SMS & Email</strong> (Send dispatch alerts when Everest Pasal resolution specialists update this ticket.)
                  </span>
                </label>
              </div>

              {/* SECTION 3: Statement & Supporting Evidence */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1A56DB', color: '#FFFFFF', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      3
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        Statement & Supporting Evidence
                      </h3>
                      <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                        Document the issue in detail and attach courier waybills or screenshots.
                      </p>
                    </div>
                  </div>

                  {/* Template Picker */}
                  <select
                    onChange={(e) => handleInsertTemplate(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      color: '#1A56DB',
                      fontWeight: 600,
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Insert Template ▾</option>
                    <option value="transit_delay">Transit Delay</option>
                    <option value="return_defect">Defective Return</option>
                    <option value="esewa_discrepancy">Payment Discrepancy</option>
                  </select>
                </div>

                {/* Rich Editor Simulated Toolbar */}
                <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden', marginBottom: '14px' }}>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '8px 12px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', color: '#475569' }}>
                      <button type="button" style={{ background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer' }}>B</button>
                      <button type="button" style={{ background: 'none', border: 'none', fontStyle: 'italic', cursor: 'pointer' }}>I</button>
                      <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>≡</button>
                      <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🔗</button>
                    </div>
                    <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>Markdown supported</span>
                  </div>

                  <textarea
                    rows={6}
                    value={statementText}
                    onChange={(e) => setStatementText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: 'none',
                      outline: 'none',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      fontFamily: "'Poppins', sans-serif",
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Mark as internal note checkbox */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#334155', marginBottom: '18px' }}>
                  <input
                    type="checkbox"
                    checked={isInternalNoteOnly}
                    onChange={(e) => setIsInternalNoteOnly(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>
                    <strong>Mark as Internal Note Only</strong> (Keep this hidden from the buyer. Visible only to your store and Everest Pasal logistics team.)
                  </span>
                </label>

                {/* Drag and Drop Evidence Files */}
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Attachments & Evidence Documents
                </div>

                <div
                  onClick={() => {
                    setAttachedFiles([
                      ...attachedFiles,
                      { name: `proof_doc_${Date.now().toString().slice(-4)}.jpg`, size: '1.4 MB' },
                    ]);
                    showToast('Attachment uploaded.');
                  }}
                  style={{
                    border: '2px dashed #CBD5E1',
                    borderRadius: '10px',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#F8FAFC',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1A56DB')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#CBD5E1')}
                >
                  <div style={{ fontSize: '28px', color: '#3B82F6', marginBottom: '6px' }}>☁️</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                    Drag and drop evidence files or <span style={{ color: '#1A56DB', textDecoration: 'underline' }}>browse files</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                    Upload unboxing clip, photo proof, waybill photo, or eSewa receipt. Max 25MB (PNG, JPG, PDF, MP4)
                  </div>
                </div>

                {/* Uploaded File Row */}
                {attachedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      marginTop: '10px',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📄</span>
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>{file.name}</span>
                      <span style={{ color: '#94A3B8', fontSize: '11px' }}>{file.size} · Ready to upload</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedFiles(attachedFiles.filter((_, i) => i !== idx))}
                      style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '13px' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Bottom Sticky Action Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #ECECEC',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🛡️</span>
                  <span>Inquiries are protected by Everest Pasal Vendor Protection SLA 2025</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      padding: '8px 18px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Draft saved.')}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      padding: '8px 18px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitNewInquiry}
                    style={{
                      backgroundColor: '#1A56DB',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '8px 22px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(26, 86, 219, 0.25)',
                    }}
                  >
                    Submit inquiry ➔
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Routing, SLA & Fulfillment Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
              {/* Card 1: Routing & Assignee */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Routing & Assignee
                  </h3>
                  <span style={{ backgroundColor: '#ECFDF5', color: '#16A34A', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                    Active SLA
                  </span>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Assigned Agent</label>
                  <select
                    value={assignedAgent}
                    onChange={(e) => setAssignedAgent(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Manish Sharma (You - Store Admin)">Manish Sharma (You - Store Admin)</option>
                    <option value="Logistics Support Desk">Logistics Support Desk</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Department Escalation</label>
                  <select
                    value={departmentEscalation}
                    onChange={(e) => setDepartmentEscalation(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Logistics & Delivery Liaison">Logistics & Delivery Liaison</option>
                    <option value="Finance & Gateway Support">Finance & Gateway Support</option>
                    <option value="Buyer Trust & Safety">Buyer Trust & Safety</option>
                  </select>
                </div>

                {/* Target SLA Box */}
                <div
                  style={{
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FCD34D',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '10px', color: '#B45309', fontWeight: 700, textTransform: 'uppercase' }}>TARGET RESOLUTION SLA</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#92400E', marginTop: '2px' }}>Standard SLA: 4 hours</div>
                  </div>
                  <span style={{ fontSize: '20px' }}>⏱️</span>
                </div>
              </div>

              {/* Card 2: Fulfillment Status */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Fulfillment Status
                  </h3>
                  <span style={{ backgroundColor: '#EFF6FF', color: '#1A56DB', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                    Live Hub
                  </span>
                </div>

                {/* Hub Transit Diagram */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px', textAlign: 'center', marginBottom: '14px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 600 }}>
                    <span style={{ color: '#0F172A' }}>Kathmandu Store</span>
                    <span style={{ color: '#DC2626', fontSize: '10px', backgroundColor: '#FEE2E2', padding: '2px 6px', borderRadius: '4px' }}>
                      DELAYED TRANSIT
                    </span>
                    <span style={{ color: '#0F172A' }}>Lalitpur Hub</span>
                  </div>
                  <div style={{ height: '3px', backgroundColor: '#E2E8F0', margin: '8px 0', position: 'relative' }}>
                    <div style={{ width: '65%', height: '100%', backgroundColor: '#DC2626' }}></div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', marginBottom: '14px' }}>
                  <div style={{ backgroundColor: '#F1F5F9', padding: '6px 8px', borderRadius: '6px' }}>
                    <span style={{ color: '#64748B', display: 'block' }}>COURIER PARTNER</span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>Nepal Express</span>
                  </div>
                  <div style={{ backgroundColor: '#F1F5F9', padding: '6px 8px', borderRadius: '6px' }}>
                    <span style={{ color: '#64748B', display: 'block' }}>PAYMENT MODE</span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>eSewa Prepaid</span>
                  </div>
                </div>

                {/* Customer Mini Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E0E7FF', color: '#1A56DB', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    AS
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#0F172A' }}>Aaradhya Shrestha</div>
                    <div style={{ fontSize: '10.5px', color: '#64748B' }}>Verified Buyer · 11 lifetime orders</div>
                  </div>
                  <span style={{ color: '#10B981', fontSize: '14px' }}>✓</span>
                </div>
              </div>

              {/* Card 3: Resolution Guidelines */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECECEC', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 12px 0' }}>
                  Resolution Guidelines
                </h3>

                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11.5px', color: '#475569', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>
                    <span style={{ color: '#16A34A', fontWeight: 600 }}>✓</span> Attaching Order ID & Waybill code speeds up logistics resolution by 40%.
                  </li>
                  <li>
                    <span style={{ color: '#16A34A', fontWeight: 600 }}>✓</span> For eSewa / Fonepay issues, upload buyer payment transaction screenshots.
                  </li>
                  <li>
                    <span style={{ color: '#DC2626', fontWeight: 600 }}>⚠</span> Never share sensitive OTP or customer security credentials in ticket messages.
                  </li>
                </ul>

                <div style={{ marginTop: '14px', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                  <a href="#sla" onClick={(e) => { e.preventDefault(); showToast('Everest Merchant SLA Policy document opened.'); }} style={{ fontSize: '12px', color: '#1A56DB', textDecoration: 'none', fontWeight: 600 }}>
                    Read Everest Merchant SLA Policy ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

