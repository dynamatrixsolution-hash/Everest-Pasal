// ==============================================================================
// EVEREST PASAL - EMAIL VERIFICATION PAGE
// Real 6-digit OTP verification with backend integration and dev testing helpers
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, Link } from '../router/index.js';
import { useAuth } from '../context/AuthContext.js';
import { BrandLogo } from '../components/Common/BrandLogo.js';

export const VerifyEmailPage: React.FC = () => {
  const { navigate, query } = useRouter();
  const { verifyOtp, requestOtp } = useAuth();
  const emailParam = query.get('email') || 'alex@email.com';

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Automatically request OTP on initial page load if not already requested
  useEffect(() => {
    let isMounted = true;
    const fetchInitialOtp = async () => {
      try {
        const res = await requestOtp(emailParam, 'VERIFICATION');
        if (isMounted && res && res.otp) {
          setDevOtpHint(res.otp);
        }
      } catch (err: any) {
        console.warn('[VERIFY-INIT] Initial OTP note:', err.message);
      }
    };
    fetchInitialOtp();
    return () => {
      isMounted = false;
    };
  }, [emailParam]);

  // Countdown timer for resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || '';
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleFillCode = (codeToFill: string) => {
    const digits = codeToFill.split('').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = digits[i] || '';
    }
    setOtp(newOtp);
    inputRefs.current[5]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await verifyOtp(emailParam, code, 'VERIFICATION');
      if (res.verified) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(res.message || 'The provided verification code is invalid.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again or request a new code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    setError(null);

    try {
      const res = await requestOtp(emailParam, 'VERIFICATION');
      if (res && res.otp) {
        setDevOtpHint(res.otp);
      }
      setTimer(60);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F7F4EE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Verification Card */}
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          backgroundColor: '#FAF7F2',
          border: '1px solid #EBE5DB',
          borderRadius: '24px',
          padding: '48px 40px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Everest Pasal Logo */}
        <div style={{ marginBottom: '14px' }}>
          <BrandLogo variant="horizontal" height={36} />
        </div>

        {/* Sub-brand tag */}
        <div
          style={{
            fontSize: '10.5px',
            fontWeight: 800,
            color: '#0B4EA2',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            marginBottom: '2px',
          }}
        >
          EVEREST PASAL
        </div>
        <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '22px' }}>
          Secure account verification
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: '30px',
            fontWeight: 800,
            color: '#111827',
            marginBottom: '8px',
            letterSpacing: '-0.02em',
          }}
        >
          Verify your email
        </h1>

        {/* Subtitle with email */}
        <p
          style={{
            fontSize: '13px',
            color: '#64748b',
            marginBottom: '20px',
            maxWidth: '340px',
            lineHeight: 1.4,
          }}
        >
          Enter the 6-digit code sent to <strong style={{ color: '#1e293b' }}>{emailParam}</strong>
        </p>

        {/* Dev / Test OTP Helper Pill */}
        <div
          style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🔑 Testing / Dev OTP
            </div>
            <div style={{ fontSize: '12px', color: '#3B82F6' }}>
              Code: <strong style={{ color: '#1E3A8A' }}>{devOtpHint || '123456'}</strong> (or master: 123456)
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleFillCode(devOtpHint || '123456')}
            style={{
              backgroundColor: '#1E40AF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Autofill Code
          </button>
        </div>

        {error && (
          <div
            style={{
              width: '100%',
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              color: '#b91c1c',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              marginBottom: '20px',
              textAlign: 'left',
              boxSizing: 'border-box',
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              width: '100%',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: 600,
              boxSizing: 'border-box',
            }}
          >
            ✓ Email verified successfully! Loading your session...
          </div>
        )}

        <form onSubmit={handleVerify} style={{ width: '100%' }}>
          {/* Label */}
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#64748b',
              textAlign: 'left',
              marginBottom: '10px',
            }}
          >
            6-digit verification code
          </div>

          {/* 6 OTP Input Boxes */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              marginBottom: '28px',
            }}
            onPaste={handlePaste}
          >
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                style={{
                  width: '52px',
                  height: '56px',
                  borderRadius: '12px',
                  border: '1.5px solid #d9d2c5',
                  backgroundColor: '#ffffff',
                  textAlign: 'center',
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#111827',
                  outline: 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0B4EA2';
                  e.target.style.boxShadow = '0 0 0 3px rgba(11, 78, 162, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d9d2c5';
                  e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                }}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || success}
            style={{
              width: '100%',
              backgroundColor: '#0B4EA2',
              color: '#ffffff',
              padding: '13px',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 700,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(11, 78, 162, 0.3)',
              marginBottom: '20px',
              transition: 'all 0.15s ease',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        {/* Resend Timer Text */}
        <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '12px' }}>
          Didn't receive a code? {canResend ? 'You can request a new one now.' : `Resend in ${formatTimer(timer)}`}
        </div>

        {/* Resend Outlined Button */}
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend || resending}
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #dcd5c9',
            color: canResend ? '#0B4EA2' : '#94a3b8',
            padding: '7px 22px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: canResend && !resending ? 'pointer' : 'not-allowed',
            marginBottom: '28px',
            transition: 'all 0.15s ease',
            opacity: resending ? 0.6 : 1,
          }}
        >
          {resending ? 'Sending...' : 'Resend Code'}
        </button>

        {/* Back to sign in link */}
        <Link
          to="/login"
          style={{
            color: '#0B4EA2',
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>←</span>
          <span>Back to sign in</span>
        </Link>
      </div>
    </div>
  );
};
