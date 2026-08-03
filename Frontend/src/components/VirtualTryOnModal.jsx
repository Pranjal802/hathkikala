import { useState } from 'react';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.jsx';
import { resolveImageUrl } from '../utils/resolveImageUrl.js';
import { X, Sparkles, Upload, Loader2, Download, ShoppingBag, Smartphone, CheckCircle2, User, RefreshCcw, Camera } from 'lucide-react';

const DEMO_MODELS = [
  {
    id: 'demo-1',
    name: 'Ethnic Festive Pose',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo-2',
    name: 'Modern Portrait Pose',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo-3',
    name: 'Studio Model Pose',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
  },
];

export default function VirtualTryOnModal({ product, isOpen, onClose }) {
  const { addToCart, showNotification } = useStore();
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(DEMO_MODELS[0].url);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedPreview, setUploadedPreview] = useState('');
  const [posePreference, setPosePreference] = useState('wearing');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [generatedResult, setGeneratedResult] = useState(null);

  if (!isOpen || !product) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid photo file', 'error');
        return;
      }
      setUploadedFile(file);
      const objUrl = URL.createObjectURL(file);
      setUploadedPreview(objUrl);
      setSelectedPhotoUrl(objUrl);
    }
  };

  const handleGenerateTryOn = async () => {
    setIsGenerating(true);
    setProgressStep(1);

    try {
      let finalUserPhotoUrl = selectedPhotoUrl;

      // Upload custom photo to Cloudinary if file attached
      if (uploadedFile) {
        setProgressStep(1); // "Uploading customer photo..."
        const formData = new FormData();
        formData.append('image', uploadedFile);
        formData.append('folder', 'handmade/ai_tryon_user');

        const uploadRes = await api.uploadImage(formData).catch(() => null);
        if (uploadRes?.data?.url || uploadRes?.data?.secure_url) {
          finalUserPhotoUrl = uploadRes.data.url || uploadRes.data.secure_url;
        }
      }

      // Step 2 Progress
      setTimeout(() => setProgressStep(2), 1200); // "Mapping handcrafted item & patterns..."
      setTimeout(() => setProgressStep(3), 2400); // "Synthesizing AI realistic lighting..."

      const res = await api.generateVirtualTryOn({
        productId: product.id || product._id,
        userImageUrl: finalUserPhotoUrl,
        posePreference,
      });

      if (res.success && res.data) {
        setTimeout(() => {
          setGeneratedResult(res.data);
          setIsGenerating(false);
          showNotification('AI Try-On preview generated successfully! ✨');
        }, 3200);
      }
    } catch (err) {
      showNotification(err.message || 'AI Try-On generation failed', 'error');
      setIsGenerating(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    onClose();
  };

  const handleDownloadResult = () => {
    if (!generatedResult?.generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = generatedResult.generatedImageUrl;
    link.download = `HathKiKala_TryOn_${product.name.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Try-On photo downloaded! 📸');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-4xl shadow-2xl w-full max-w-2xl overflow-hidden border border-rose-100 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3E2C23] via-[#5C4033] to-[#C97C5D] px-6 py-4 text-white flex items-center justify-between shadow">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <h3 className="font-serif text-lg font-bold">AI Virtual Try-On Studio</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white/20 hover:bg-rose-600 rounded-full transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Target Product Summary Pill */}
          <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shadow-sm shrink-0">
                <img
                  src={resolveImageUrl(product.thumbnail || product.images?.[0]?.url)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#C97C5D] tracking-wider">Target Item</span>
                <h4 className="font-bold text-xs text-gray-800 line-clamp-1">{product.name}</h4>
              </div>
            </div>
            <span className="font-extrabold text-xs text-[#C97C5D] bg-white px-3 py-1.5 rounded-xl border border-rose-100 shadow-sm">
              ₹{product.discountPrice || product.basePrice}
            </span>
          </div>

          {!generatedResult ? (
            <div className="space-y-6">
              
              {/* Step 1: Upload or Select Model Photo */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#C97C5D]" /> 1. Upload Your Photo or Select a Model
                </label>

                {/* Upload Button Box */}
                <div className="border-2 border-dashed border-rose-200 hover:border-[#C97C5D] rounded-2xl p-4 text-center cursor-pointer bg-rose-50/30 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="tryon-photo-upload"
                  />
                  <label htmlFor="tryon-photo-upload" className="cursor-pointer block space-y-1.5">
                    {uploadedPreview ? (
                      <div className="flex items-center justify-center gap-3">
                        <img src={uploadedPreview} alt="Customer Upload" className="w-16 h-16 rounded-xl object-cover border shadow-sm" />
                        <div className="text-left">
                          <p className="text-xs font-bold text-emerald-700">✓ Your photo attached!</p>
                          <p className="text-[10px] text-gray-400">Click to replace photo</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 py-1">
                        <Upload className="w-8 h-8 text-[#C97C5D] mx-auto" />
                        <p className="text-xs font-bold text-gray-700">Upload your selfie or photo</p>
                        <p className="text-[10px] text-gray-400">PNG, JPG or WEBP screenshots</p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Preset Demo Models Selector */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Or choose a model pose:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {DEMO_MODELS.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          setSelectedPhotoUrl(model.url);
                          setUploadedFile(null);
                          setUploadedPreview('');
                        }}
                        className={`p-2 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                          selectedPhotoUrl === model.url && !uploadedPreview
                            ? 'border-[#C97C5D] bg-rose-50 shadow-sm ring-2 ring-[#C97C5D]/30'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                          <img src={model.url} alt={model.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700 truncate w-full">{model.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 2: Pose Preference */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                  2. Select Item Placement Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'wearing', label: 'Wearing Item' },
                    { id: 'holding', label: 'Carrying / Holding' },
                    { id: 'studio', label: 'Studio Showcase' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPosePreference(p.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                        posePreference === p.id
                          ? 'bg-[#C97C5D] text-white border-[#C97C5D]'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Generation Action Button / Animated Loading Screen */}
              {isGenerating ? (
                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 text-center space-y-4 animate-fadeIn">
                  <Loader2 className="w-10 h-10 text-[#C97C5D] animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-amber-900">Generative AI Fusing In Progress...</h4>
                    <p className="text-xs text-amber-800 font-medium">
                      {progressStep === 1 && '1/3 Analyzing customer posture & lighting...'}
                      {progressStep === 2 && '2/3 Mapping handcrafted mirror-work & pattern...'}
                      {progressStep === 3 && '3/3 Synthesizing realistic studio preview...'}
                    </p>
                  </div>
                  <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#C97C5D] h-full transition-all duration-700"
                      style={{ width: `${(progressStep / 3) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleGenerateTryOn}
                  className="w-full py-4 bg-[#C97C5D] hover:bg-[#b0674a] text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
                >
                  <Sparkles size={18} className="text-amber-200" /> Generate AI Virtual Try-On ✨
                </button>
              )}

            </div>
          ) : (
            /* Result Screen */
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-center">
                <span className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" /> AI Virtual Try-On Rendered Successfully!
                </span>
              </div>

              {/* Generated Image Result Display */}
              <div className="relative aspect-4/3 rounded-3xl overflow-hidden border-2 border-rose-100 shadow-lg bg-rose-50/50">
                <img
                  src={generatedResult.generatedImageUrl}
                  alt="AI Try-On Result"
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-300" /> AI Preview Output
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleDownloadResult}
                  className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Download size={15} /> Download Photo
                </button>

                <a
                  href={`https://wa.me/919313729507?text=${encodeURIComponent(`Check out my AI Virtual Try-On preview for ${product.name}!`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Smartphone size={15} /> Share on WhatsApp
                </a>

                <button
                  onClick={handleAddToCart}
                  className="py-3 bg-[#C97C5D] hover:bg-[#b0674a] text-white font-bold rounded-2xl text-xs transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <ShoppingBag size={15} /> Add to Cart
                </button>
              </div>

              <button
                onClick={() => setGeneratedResult(null)}
                className="w-full text-center text-xs font-bold text-gray-500 hover:text-[#C97C5D] flex items-center justify-center gap-1 pt-1"
              >
                <RefreshCcw size={13} /> Try another photo or pose
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
