import React, { useState, useEffect, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, ShieldCheck, ShieldAlert, Cpu, Activity, Clock, Link as LinkIcon, AlertTriangle, Loader2, Trash2, Zap, Eye, BarChart3 } from 'lucide-react';

interface AnalysisResult {
  filename: string;
  is_deepfake: 'REAL' | 'DEEPFAKE';
  confidence_score: number;
  details: {
    blink_anomaly_score: number;
    lip_sync_mismatch_score: number;
    temporal_inconsistency_score: number;
  };
  blockchain_verified: string;
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/history');
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to delete all cached history?")) return;
    try {
      const res = await fetch('http://localhost:8000/api/history', { method: 'DELETE' });
      if (res.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'success') {
        setResult(data.result);
        fetchHistory();
      }
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-sans overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)] animate-pulse"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.03),transparent_50%)]"></div>

      <div className="relative z-10 min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Modern Header */}
          <header className="text-center mb-12 pt-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl shadow-blue-500/25 mb-6">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              DeepShield AI
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Advanced deepfake detection powered by AI and blockchain verification
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                <span className="text-green-400 font-medium">System Online</span>
              </div>
              <button
                onClick={handleClearHistory}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-colors group"
              >
                <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                <span className="text-red-400 font-medium group-hover:text-red-300">Clear Cache</span>
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

            {/* Upload Section */}
            <div className="xl:col-span-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:border-blue-500/20">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <UploadCloud className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Upload Video</h2>
                </div>

                <div
                  className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group ${
                    dragActive
                      ? 'border-blue-400 bg-blue-500/10 scale-105 shadow-lg shadow-blue-500/25'
                      : 'border-white/20 hover:border-blue-400/50 hover:bg-white/5'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input id="file-upload" type="file" className="hidden" accept="video/*" onChange={handleChange} />
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                    file ? 'bg-green-500/20' : 'bg-white/10 group-hover:bg-blue-500/20'
                  }`}>
                    <UploadCloud className={`w-8 h-8 ${file ? 'text-green-400' : 'text-slate-400 group-hover:text-blue-400'}`} />
                  </div>
                  <p className="text-lg font-medium text-white mb-2">
                    {file ? file.name : 'Drop your video here'}
                  </p>
                  <p className="text-sm text-slate-400">Supports MP4, MOV up to 50MB</p>
                  {!file && (
                    <div className="mt-4 px-6 py-2 bg-white/10 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/20 transition-colors">
                      Browse Files
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={!file || isProcessing}
                  className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300 flex justify-center items-center shadow-xl ${
                    !file || isProcessing
                      ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6 mr-3" />
                      Detect Deepfake
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className="xl:col-span-8 space-y-8">

              {/* Analysis Results */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl min-h-[400px] flex flex-col justify-center">
                {!result && !isProcessing && (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Eye className="w-12 h-12 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-300 mb-2">Ready for Analysis</h3>
                    <p className="text-slate-400">Upload a video to begin deepfake detection</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-8">
                      <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Cpu className="w-12 h-12 text-blue-400 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Processing Video</h3>
                    <p className="text-slate-400">Running advanced AI analysis...</p>
                  </div>
                )}

                {result && !isProcessing && (
                  <div className="animate-in fade-in zoom-in duration-500">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Analysis Complete</h2>
                        <p className="text-slate-400">{result.filename}</p>
                      </div>
                      <div className={`inline-flex items-center px-6 py-3 rounded-2xl font-bold text-lg shadow-xl ${
                        result.is_deepfake === 'REAL'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {result.is_deepfake === 'REAL' ? (
                          <ShieldCheck className="w-6 h-6 mr-3" />
                        ) : (
                          <ShieldAlert className="w-6 h-6 mr-3" />
                        )}
                        {result.is_deepfake}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Confidence Score */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">AI Confidence</h3>
                            <p className="text-slate-400 text-sm">Detection accuracy</p>
                          </div>
                        </div>
                        <div className="flex items-end space-x-4">
                          <span className={`text-4xl font-bold ${
                            result.confidence_score > 55 ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {result.confidence_score}%
                          </span>
                          <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${
                                result.confidence_score > 55 ? 'bg-red-500' : 'bg-green-500'
                              }`}
                              style={{width: `${result.confidence_score}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Blockchain Verification */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <LinkIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">Blockchain</h3>
                            <p className="text-slate-400 text-sm">Verification status</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-green-400">{result.blockchain_verified}</span>
                          <ShieldCheck className="w-8 h-8 text-green-400" />
                        </div>
                      </div>
                    </div>

                    {/* Detailed Metrics */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-3 text-yellow-400" />
                        Detection Metrics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-400 mb-2">{result.details.blink_anomaly_score}</div>
                          <div className="text-sm text-slate-400">Blink Anomalies</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-400 mb-2">{result.details.lip_sync_mismatch_score}%</div>
                          <div className="text-sm text-slate-400">Lip Sync Issues</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-cyan-400 mb-2">{result.details.temporal_inconsistency_score}%</div>
                          <div className="text-sm text-slate-400">Temporal Issues</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* History Section */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Analysis History</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Filename</th>
                        <th className="pb-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Result</th>
                        <th className="pb-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Confidence</th>
                        <th className="pb-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Verified</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {history.length > 0 ? history.map((h, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 text-white font-medium truncate max-w-[200px]">{h.filename}</td>
                          <td className="py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                              h.is_deepfake === 'REAL'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {h.is_deepfake}
                            </span>
                          </td>
                          <td className="py-4 text-white font-mono">{h.confidence_score}%</td>
                          <td className="py-4 flex items-center text-green-400">
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            {h.blockchain_verified}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-400">
                            No analysis history available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}