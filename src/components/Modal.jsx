import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, message, type = 'info', showCloseButton = true }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'success':
        return 'from-green-500 to-emerald-500';
      case 'error':
        return 'from-red-500 to-pink-500';
      case 'warning':
        return 'from-yellow-500 to-orange-500';
      case 'info':
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={showCloseButton ? onClose : undefined}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        <div className="text-center">
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${getGradient()} rounded-full mb-6 shadow-lg`}>
            <span className="text-2xl">{getIcon()}</span>
          </div>
          
          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
          
          {/* Message */}
          <p className="text-purple-200 text-lg mb-8 leading-relaxed">{message}</p>
          
          {/* Close Button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className={`bg-gradient-to-r ${getGradient()} text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg`}
            >
              Got it!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal; 