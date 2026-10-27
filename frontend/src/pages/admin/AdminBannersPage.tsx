// ==============================================================================
// EVEREST PASAL - SUPER ADMIN HERO BANNERS & SLIDER MANAGER
// Allows Super Admin to dynamically configure hero slider banners,
// background colors, images, CTA targets, sort order, and active status
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';

export interface BannerItem {
  id: string;
  company_code?: string;
  banner_code: string;
  banner_name: string;
  subtitle?: string;
  button_text?: string;
  placement_code?: string;
  image_url: string;
  target_url?: string;
  bg_color?: string;
  sort_order: number;
  active: boolean;
  publish: boolean;
  created_at?: string;
  updated_at?: string;
}

const PRESET_IMAGES = [
  { label: '60% OFF Summer Sale', url: '/images/hero_sale_banner.jpg', color: '#DC2626' },
  { label: 'Himalayan Cashmere', url: '/images/hero_pashmina.jpg', color: '#F7F4F0' },
  { label: 'Next-Gen Smartwatch', url: '/images/hero_smartwatch.jpg', color: '#F3F6F9' },
  { label: 'Wild Forest Honey', url: '/images/hero_honey.jpg', color: '#F9F6F0' },
];

const PRESET_COLORS = [
  '#DC2626', // Vibrant Red (Mockup theme)
  '#0A3871', // Royal Navy Blue
  '#0F172A', // Slate Dark
  '#059669', // Emerald Green
  '#D97706', // Amber Gold
  '#7C3AED', // Royal Purple
  '#F7F4F0', // Cashmere Cream
  '#FAF3E9', // Warm Vanilla (Site BG)
];

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);

  // Form Fields
  const [bannerName, setBannerName] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [buttonText, setButtonText] = useState<string>('Shop Now');
  const [imageUrl, setImageUrl] = useState<string>('/images/hero_sale_banner.jpg');
  const [targetUrl, setTargetUrl] = useState<string>('/products?sale=flash');
  const [bgColor, setBgColor] = useState<string>('#DC2626');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<BannerItem[]>('/api/v1/content/banners/all');
      setBanners(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.error('Failed to load banners:', err);
      // Fallback: try public banners endpoint
      try {
        const fallback = await ApiClient.get<BannerItem[]>('/api/v1/content/banners');
        setBanners(Array.isArray(fallback) ? fallback : []);
      } catch (e: any) {
        showToast(`Failed to load banners: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setBannerName('');
    setSubtitle('');
    setButtonText('Shop Now');
    setImageUrl('/images/hero_sale_banner.jpg');
    setTargetUrl('/products?sale=flash');
    setBgColor('#DC2626');
    setSortOrder(banners.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (banner: BannerItem) => {
    setEditingBanner(banner);
    setBannerName(banner.banner_name || '');
    setSubtitle(banner.subtitle || '');
    setButtonText(banner.button_text || 'Shop Now');
    setImageUrl(banner.image_url || '');
    setTargetUrl(banner.target_url || '/');
    setBgColor(banner.bg_color || '#DC2626');
    setSortOrder(banner.sort_order || 1);
    setIsActive(banner.active !== false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerName.trim() || !imageUrl.trim()) {
      alert('Please provide banner name and image URL');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        banner_name: bannerName.trim(),
        subtitle: subtitle.trim(),
        button_text: buttonText.trim(),
        image_url: imageUrl.trim(),
        target_url: targetUrl.trim(),
        bg_color: bgColor,
        sort_order: Number(sortOrder) || 1,
        active: isActive,
        publish: true,
        placement_code: 'HERO_SLIDER',
      };

      if (editingBanner) {
        await ApiClient.put(`/api/v1/content/banners/${editingBanner.id}`, payload);
        showToast('Banner updated successfully!');
      } else {
        await ApiClient.post('/api/v1/content/banners', payload);
        showToast('New hero banner created!');
      }

      setIsModalOpen(false);
      await fetchBanners();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (banner: BannerItem) => {
    try {
      const updated = !banner.active;
      await ApiClient.put(`/api/v1/content/banners/${banner.id}`, { active: updated });
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, active: updated } : b))
      );
      showToast(`Banner ${updated ? 'activated' : 'paused'}`);
    } catch (err: any) {
      alert(`Toggle failed: ${err.message}`);
    }
  };

  const handleDelete = async (bannerId: string) => {
    if (!window.confirm('Are you sure you want to delete this hero slider banner?')) {
      return;
    }
    try {
      await ApiClient.delete(`/api/v1/content/banners/${bannerId}`);
      setBanners((prev) => prev.filter((b) => b.id !== bannerId));
      showToast('Banner removed successfully');
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm('Reset/seed default hero slides? This will guarantee the 4 core slides are present.')) {
      return;
    }
    try {
      setLoading(true);
      await ApiClient.post('/api/v1/content/banners/seed', {});
      showToast('Default hero slides seeded successfully!');
      await fetchBanners();
    } catch (err: any) {
      alert(`Seed failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Poppins', sans-serif" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            backgroundColor: '#0F172A',
            color: '#ffffff',
            padding: '12px 22px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13.5px',
            fontWeight: 600,
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '24px' }}>🖼️</span>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Hero Banners &amp; Slider Manager
            </h1>
          </div>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
            Dynamic Super Admin control for homepage hero carousel. All slides render with equal 480px height and responsive width.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleSeedDefaults}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              color: '#334155',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🔄</span>
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={openCreateModal}
            style={{
              backgroundColor: '#DC2626',
              border: 'none',
              color: '#FFFFFF',
              padding: '10px 22px',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>+</span>
            <span>Add New Slider</span>
          </button>
        </div>
      </div>

      {/* Telemetry / Summary Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '18px 22px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Total Slides</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>{banners.length}</div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '18px 22px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Active in Carousel</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669' }}>
            {banners.filter((b) => b.active).length}
          </div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '18px 22px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Slider Height</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0A3871' }}>480px (Strict Equal)</div>
        </div>
      </div>

      {/* Banners List / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          <p>Loading dynamic hero banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '2px dashed #CBD5E1',
            padding: '50px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏔️</div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>No Banners Configured</h3>
          <p style={{ color: '#64748B', fontSize: '13.5px', marginBottom: '20px' }}>
            Click &ldquo;Reset Defaults&rdquo; to populate the 4 default slides or create a custom one.
          </p>
          <button
            onClick={handleSeedDefaults}
            style={{
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Load 4 Default Slides
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '18px 22px',
                display: 'grid',
                gridTemplateColumns: '60px 220px 1fr 140px 180px',
                alignItems: 'center',
                gap: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'border-color 0.15s ease',
              }}
            >
              {/* Order Pill */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>ORDER</span>
                <span
                  style={{
                    backgroundColor: '#F1F5F9',
                    color: '#0F172A',
                    fontWeight: 800,
                    fontSize: '15px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '2px',
                  }}
                >
                  {banner.sort_order || index + 1}
                </span>
              </div>

              {/* Banner Visual Preview (Equal aspect ratio box) */}
              <div
                style={{
                  width: '220px',
                  height: '110px',
                  borderRadius: '10px',
                  backgroundColor: banner.bg_color || '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid #CBD5E1',
                }}
              >
                <img
                  src={banner.image_url}
                  alt={banner.banner_name}
                  style={{
                    maxWidth: '90%',
                    maxHeight: '90%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '6px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#FFFFFF',
                    fontSize: '9px',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}
                >
                  {banner.bg_color || '#DC2626'}
                </span>
              </div>

              {/* Title & Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {banner.banner_name}
                  </h3>
                  {banner.active ? (
                    <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                      Active
                    </span>
                  ) : (
                    <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                      Paused
                    </span>
                  )}
                </div>
                {banner.subtitle && (
                  <p style={{ color: '#64748B', fontSize: '12.5px', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                    {banner.subtitle}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '14px', fontSize: '11.5px', color: '#475569' }}>
                  <span>🎯 Link: <strong>{banner.target_url || '/'}</strong></span>
                  <span>🔘 CTA: <strong>{banner.button_text || 'Shop Now'}</strong></span>
                </div>
              </div>

              {/* Active Toggle Switch */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>Visible</span>
                <button
                  onClick={() => handleToggleActive(banner)}
                  style={{
                    width: '48px',
                    height: '26px',
                    borderRadius: '13px',
                    backgroundColor: banner.active ? '#059669' : '#CBD5E1',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background-color 0.2s ease',
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      position: 'absolute',
                      top: '3px',
                      left: banner.active ? '25px' : '3px',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => openEditModal(banner)}
                  style={{
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#0F172A',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {editingBanner ? 'Edit Hero Slider Banner' : 'Create New Hero Banner'}
                </h2>
                <p style={{ color: '#64748B', fontSize: '13px', margin: '2px 0 0 0' }}>
                  Configure visual elements, equal dimensions, and dynamic URL targets.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '22px',
                  color: '#64748B',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Banner Name / Title */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                  Banner Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 60% OFF - Summer Mega Sale"
                  value={bannerName}
                  onChange={(e) => setBannerName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13.5px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Subtitle */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Exclusive discounts on streetwear, sneakers and t-shirts"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13.5px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* 2-col Grid: Target URL & Button Text */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Target Link URL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /products?sale=flash"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13.5px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shop Now"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13.5px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Image URL & Presets */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                  Image URL / Asset Path *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /images/hero_sale_banner.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13.5px',
                    outline: 'none',
                    marginBottom: '8px',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Quick Presets:</span>
                  {PRESET_IMAGES.map((p) => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() => {
                        setImageUrl(p.url);
                        setBgColor(p.color);
                      }}
                      style={{
                        backgroundColor: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        color: '#334155',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Color & Presets */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                  Slider Background Color
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <input
                    type="color"
                    value={bgColor.startsWith('#') ? bgColor : '#DC2626'}
                    onChange={(e) => setBgColor(e.target.value)}
                    style={{
                      width: '42px',
                      height: '42px',
                      padding: '2px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    placeholder="#DC2626"
                    style={{
                      width: '120px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    Spans 100% full-width behind image
                  </span>
                </div>
                {/* Color swatches */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Palette:</span>
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBgColor(c)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: c,
                        border: bgColor === c ? '2.5px solid #000000' : '1px solid #CBD5E1',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* Sort Order & Active */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Sort Order (Display Sequence)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 1)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13.5px',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: '28px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span>Active in Public Carousel</span>
                  </label>
                </div>
              </div>

              {/* LIVE EQUAL SIZE PREVIEW */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Live Slide Preview (Fixed Equal Size)
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '180px',
                    borderRadius: '14px',
                    backgroundColor: bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '1px solid #CBD5E1',
                    position: 'relative',
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={bannerName || 'Preview'}
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90%',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '12px',
                      backgroundColor: 'rgba(0,0,0,0.65)',
                      color: '#ffffff',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {bannerName || 'Sample Slide Title'}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    color: '#334155',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#DC2626',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '10px 24px',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
