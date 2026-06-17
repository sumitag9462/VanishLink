import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, ShieldAlert, Lock, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { ReportLinkButton } from '../../components/links/ReportLinkButton';
import api from '../../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
// remove trailing /api to get backend root
const REDIRECT_BASE = API_BASE.replace(/\/api\/?$/, '');

const RedirectHandler = () => {
  const { slug } = useParams();

  const [status, setStatus] = useState('loading'); // loading | redirect | not_found | expired | scheduled | password | preview | blocked | otp_required | error
  const [linkData, setLinkData] = useState(null);
  const [reason, setReason] = useState('');
  const [startsAt, setStartsAt] = useState(null);

  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authToken, setAuthToken] = useState('');

  // OTP Verification States
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpStep, setOtpStep] = useState('enter_email'); // enter_email | enter_otp
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const getRedirectUrl = (authTokenVal = authToken, otpTokenVal = otpToken) => {
    const params = [];
    if (authTokenVal) params.push(`token=${authTokenVal}`);
    if (otpTokenVal) params.push(`otpToken=${otpTokenVal}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return `${REDIRECT_BASE}/r/${slug}${query}`;
  };

  useEffect(() => {
    const fetchLink = async () => {
      try {
        setStatus('loading');

        const res = await api.get(`/links/${slug}${window.location.search}`);

        if (res.data.status === 'not_found') {
          setStatus('not_found');
          return;
        }

        if (res.data.status === 'expired') {
          setStatus('expired');
          setReason(res.data.reason || 'Link has self-destructed.');
          return;
        }

        if (res.data.status === 'scheduled') {
          setStatus('scheduled');
          setReason(res.data.reason || 'Link is not active yet.');
          if (res.data.startsAt) {
            setStartsAt(res.data.startsAt);
          }
          return;
        }

        const link = res.data.link;
        setLinkData(link);

        // Check authentication flows in order: OTP -> Password -> Preview -> Direct Redirect
        if (link.otpEnabled) {
          setStatus('otp_required');
          return;
        }

        if (link.hasPassword) {
          setStatus('password');
          return;
        }

        if (link.showPreview) {
          setStatus('preview');
          return;
        }

        // Direct redirection
        setStatus('redirect');
        setTimeout(() => {
          window.location.href = getRedirectUrl();
        }, 800);
      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 403) {
          setStatus('blocked');
          setReason(err.response.data || 'Access Denied for Your Region');
        } else {
          setStatus('error');
        }
      }
    };

    fetchLink();
  }, [slug]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!linkData) return;

    if (!passwordInput.trim()) {
      setPasswordError('Password is required.');
      return;
    }

    try {
      const res = await api.post(`/links/${slug}/verify-password`, { password: passwordInput });
      if (res.data.success) {
        setPasswordError('');
        const token = res.data.token || '';
        setAuthToken(token);

        if (linkData.showPreview) {
          setStatus('preview');
        } else {
          setStatus('redirect');
          setTimeout(() => {
            window.location.href = getRedirectUrl(token, otpToken);
          }, 800);
        }
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setPasswordError('Incorrect password. Try again.');
      } else {
        setPasswordError('An error occurred verifying password.');
      }
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setOtpError('Email is required.');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await api.post(`/links/${slug}/send-otp`, { email: emailInput });
      if (res.data.success) {
        setOtpStep('enter_otp');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP code.';
      setOtpError(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpInput.trim()) {
      setOtpError('OTP code is required.');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await api.post(`/links/${slug}/verify-otp`, { email: emailInput, code: otpInput });
      if (res.data.success) {
        const token = res.data.token;
        setOtpToken(token);

        // Transition logic to next step
        if (linkData.hasPassword && !authToken) {
          setStatus('password');
        } else if (linkData.showPreview) {
          setStatus('preview');
        } else {
          setStatus('redirect');
          setTimeout(() => {
            window.location.href = getRedirectUrl(authToken, token);
          }, 800);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP code.';
      setOtpError(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  // -----------------------
  // RENDER STATES
  // -----------------------

  if (status === 'loading' || status === 'redirect') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-400 font-mono text-sm animate-pulse">
          {status === 'loading'
            ? 'Establishing Secure Handshake...'
            : 'Decryption Complete. Redirecting...'}
        </p>
      </div>
    );
  }

  if (status === 'not_found') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center border-red-500/20 bg-slate-900">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Link Not Found</h1>
          <p className="text-slate-400">
            This Vanish link does not exist or was removed.
          </p>
        </Card>
      </div>
    );
  }

  if (status === 'blocked') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center border-red-500/20 bg-slate-900">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
          <p className="text-slate-400">
            {reason || 'Access Denied: This link is restricted for your region.'}
          </p>
        </Card>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center border-red-500/20 bg-slate-900">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Connection Terminated</h1>
          <p className="text-slate-400">
            {reason || 'This Vanish link has expired or self-destructed.'}
          </p>
        </Card>
      </div>
    );
  }

  if (status === 'scheduled') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center border-slate-700 bg-slate-900">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
            <Eye className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Link Not Active Yet</h1>
          <p className="text-slate-400 text-sm">
            {reason || 'This Vanish link is scheduled to activate later.'}
          </p>
          {startsAt && (
            <p className="text-xs text-slate-500 mt-2">
              Activation time: {new Date(startsAt).toLocaleString()}
            </p>
          )}
        </Card>
      </div>
    );
  }

  // OTP MODE
  if (status === 'otp_required') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 border-slate-800 bg-slate-900">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Identity Verification</h2>
            <p className="text-slate-400 text-sm mt-1">
              {otpStep === 'enter_email'
                ? 'Enter your email to receive a secure access code.'
                : `Enter the code sent to ${emailInput}.`}
            </p>
          </div>

          {otpStep === 'enter_email' ? (
            <form onSubmit={handleSendOtp} className="space-y-3">
              <Input
                type="email"
                placeholder="you@example.com"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setOtpError('');
                }}
                className="text-center font-mono"
                autoFocus
                required
              />
              {otpError && (
                <p className="text-xs text-red-400 text-center">{otpError}</p>
              )}
              <Button className="mt-2 w-full animate-in fade-in" type="submit" isLoading={otpLoading}>
                Send Verification Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <Input
                type="text"
                placeholder="6-Digit Code"
                value={otpInput}
                onChange={(e) => {
                  setOtpInput(e.target.value);
                  setOtpError('');
                }}
                className="text-center tracking-widest font-mono text-lg"
                autoFocus
                required
              />
              {otpError && (
                <p className="text-xs text-red-400 text-center">{otpError}</p>
              )}
              <Button className="mt-2 w-full animate-in fade-in" type="submit" isLoading={otpLoading}>
                Verify Access Code
              </Button>
              <button
                type="button"
                className="text-xs text-slate-500 hover:text-slate-300 w-full text-center mt-2 underline"
                onClick={() => {
                  setOtpStep('enter_email');
                  setOtpInput('');
                  setOtpError('');
                }}
              >
                Back to Email
              </button>
            </form>
          )}
        </Card>
      </div>
    );
  }

  // PASSWORD MODE
  if (status === 'password') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 border-slate-800 bg-slate-900">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Encrypted Payload</h2>
            <p className="text-slate-400 text-sm mt-1">
              Enter password to decrypt destination.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <Input
              type="password"
              placeholder="Enter Password..."
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError('');
              }}
              className="text-center tracking-widest font-mono"
              autoFocus
            />
            {passwordError && (
              <p className="text-xs text-red-400 text-center">{passwordError}</p>
            )}
            <Button className="mt-2 w-full" type="submit">
              Unlock
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // PREVIEW MODE (after password/OTP if needed)
  if (status === 'preview' && linkData) {
    const hasAiSummary = !!(linkData.aiSummary || linkData.aiCategory);

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-md">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">Secure Preview</h2>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Analyze safety and context before proceeding
            </p>
          </div>

          {/* AI Smart Summary Panel */}
          {hasAiSummary && (
            <div className="mb-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-500/10">
                  🧠 AI Smart Info
                </span>
                {linkData.aiCategory && (
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
                    {linkData.aiCategory}
                  </span>
                )}
              </div>

              {linkData.aiSummary && (
                <p className="text-xs text-slate-300 leading-relaxed font-sans italic">
                  &ldquo;{linkData.aiSummary}&rdquo;
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-800/60">
                {linkData.aiReadingTime && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono mr-auto">
                    ⏱️ {linkData.aiReadingTime} min read
                  </span>
                )}
                {Array.isArray(linkData.aiKeywords) && linkData.aiKeywords.map((kw, idx) => (
                  <span key={idx} className="text-[10px] text-emerald-500/80 hover:text-emerald-400 font-mono">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="my-4 p-3 bg-slate-950 border border-slate-800/60 rounded-lg text-emerald-400 font-mono text-xs truncate select-all">
            {linkData.targetUrl}
          </div>

          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => {
                setStatus('redirect');
                setTimeout(() => {
                  window.location.href = getRedirectUrl();
                }, 800);
              }}
            >
              Proceed to Destination
            </Button>

            <Button
              variant="secondary"
              type="button"
              className="w-full"
              onClick={() => {
                window.history.back();
              }}
            >
              Cancel
            </Button>

            <div className="pt-4 border-t border-slate-800/60 flex justify-center">
              <ReportLinkButton
                linkId={linkData._id}
                linkSlug={slug}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Error fallback
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center border-red-500/20 bg-slate-900">
          <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-slate-400 text-sm">Please try again later.</p>
        </Card>
      </div>
    );
  }

  return null;
};

export default RedirectHandler;
