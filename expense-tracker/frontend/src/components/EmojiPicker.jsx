const EmojiPicker = ({ emojis, selectedEmoji, onSelect }) => {
  return (
    <div className="grid grid-cols-5 gap-2">
      {emojis.map((emoji, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(emoji)}
          className={`w-11 h-11 flex items-center justify-center text-xl rounded-xl 
            transition-all duration-200 hover:scale-110
            ${selectedEmoji === emoji 
              ? 'bg-indigo-500/30 ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20' 
              : 'bg-slate-700/50 hover:bg-slate-700'
            }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiPicker;
