import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';

const BiolinkView = () => {
  const { username } = useParams();
  const [biolink, setBiolink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBiolink = async () => {
      try {
        const res = await fetch(`http://localhost:5050/api/biolinks/view/${username}`);
        if (res.ok) {
          const data = await res.json();
          setBiolink(data);
        } else {
          setError('Profile not found');
        }
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    if (username) fetchBiolink();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !biolink) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div 
      className="min-h-screen flex justify-center w-full"
      style={{ backgroundColor: biolink.theme?.backgroundColor || '#0f172a' }}
    >
      <div className="w-full max-w-md px-6 py-16">
        
        <div className="text-center space-y-4 mb-12">
          {biolink.avatarUrl ? (
            <img src={biolink.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full mx-auto object-cover border-4" style={{ borderColor: biolink.theme?.buttonColor }} />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto border-4 flex items-center justify-center text-3xl font-bold" style={{ backgroundColor: biolink.theme?.buttonColor, borderColor: 'rgba(255,255,255,0.1)', color: biolink.theme?.buttonTextColor }}>
              {biolink.profileName?.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-bold" style={{ color: biolink.theme?.textColor }}>{biolink.profileName}</h1>
          {biolink.bio && (
            <p className="text-sm" style={{ color: biolink.theme?.textColor, opacity: 0.9 }}>{biolink.bio}</p>
          )}
        </div>

        <div className="space-y-4">
          {biolink.links?.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 px-6 rounded-xl text-center font-medium shadow-sm hover:scale-[1.02] transition-transform"
              style={{ 
                backgroundColor: biolink.theme?.buttonColor, 
                color: biolink.theme?.buttonTextColor 
              }}
            >
              {link.title}
            </a>
          ))}
        </div>

        <div className="mt-16 text-center opacity-50">
          <a href="/" target="_blank" rel="noopener noreferrer" className="text-xs font-medium" style={{ color: biolink.theme?.textColor }}>
            Powered by VanishLink
          </a>
        </div>
      </div>
    </div>
  );
};

export default BiolinkView;
