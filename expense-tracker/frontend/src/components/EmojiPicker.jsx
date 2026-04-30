import { useState, useRef, useEffect } from 'react';
import EmojiPickerReact from 'emoji-picker-react';

const EmojiPicker = ({ selectedEmoji, onSelect }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleEmojiClick = (emojiData) => {
    onSelect(emojiData.emoji);
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger button showing current emoji */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        title="Pick an emoji"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: open
            ? 'linear-gradient(135deg, rgba(99,102,241,0.35) 0%, rgba(139,92,246,0.25) 100%)'
            : 'rgba(51,65,85,0.5)',
          border: open ? '2px solid rgba(99,102,241,0.7)' : '2px solid rgba(71,85,105,0.5)',
          fontSize: '28px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          boxShadow: open ? '0 0 18px rgba(99,102,241,0.3)' : 'none',
          transform: open ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {selectedEmoji}
      </button>

      {/* Subtle hint text */}
      <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
        Click to change emoji
      </p>

      {/* Emoji Picker Popup */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '68px',
            left: '0',
            zIndex: 9999,
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.2)',
            animation: 'emojiPickerIn 0.18s ease',
          }}
        >
          <EmojiPickerReact
            onEmojiClick={handleEmojiClick}
            theme="dark"
            searchPlaceholder="Search emoji..."
            lazyLoadEmojis={true}
            height={380}
            width={320}
            previewConfig={{ showPreview: false }}
            skinTonesDisabled={false}
            style={{
              '--epr-bg-color': '#1e293b',
              '--epr-category-label-bg-color': '#1e293b',
              '--epr-search-input-bg-color': '#0f172a',
              '--epr-search-input-text-color': '#f1f5f9',
              '--epr-search-border-color': '#334155',
              '--epr-hover-color': 'rgba(99,102,241,0.2)',
              '--epr-focus-bg-color': 'rgba(99,102,241,0.15)',
              '--epr-text-color': '#94a3b8',
              '--epr-border-color': '#1e293b',
              '--epr-highlight-color': '#6366f1',
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes emojiPickerIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
};

export default EmojiPicker;
