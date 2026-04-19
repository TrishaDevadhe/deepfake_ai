import React, { useState, useEffect, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, ShieldCheck, ShieldAlert, Cpu, Activity, Clock, Link as LinkIcon, AlertTriangle, Loader2, Trash2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans selection:bg-primary selection:text-white p-6 md:p-12 background-pattern">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-lg shadow-primary/30">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">DeepShield AI</h1>
              <p className="text-slate-400 text-sm mt-1 tracking-wide">Next-Gen Deepfake Detection & Blockchain Validation</p>
              <button 
                onClick={handleClearHistory}
                className="mt-3 inline-flex items-center px-2 py-1 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 rounded hover:bg-red-500/20 hover:text-red-300 transition-colors"
                title="Delete Cached Analysis History"
              >
                <Trash2 className="w-3 h-3 mr-1" /> Clear Cache
              </button>
            </div>
          </div>
          <div className="mt-6 md:mt-0 flex items-center space-x-3 text-sm font-medium px-4 py-2 rounded-full glass">
            <Activity className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-slate-300">System Online</span>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Upload */}
          <section className="lg:col-span-1 space-y-6">
            <div className="glass rounded-2xl p-6 lg:p-8 hover:shadow-primary/5 transition duration-500">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-slate-200">
                <UploadCloud className="w-5 h-5 mr-3 text-primary" /> Upload Video
              </h2>
              
              <div 
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ease-in-out ${dragActive ? 'border-primary bg-primary/10 scale-105' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input id="file-upload" type="file" className="hidden" accept="video/*" onChange={handleChange} />
                <UploadCloud className={`w-12 h-12 mb-4 ${file ? 'text-primary' : 'text-slate-500'}`} />
                <p className="text-sm text-slate-300 font-medium">
                  {file ? file.name : 'Drag & drop video here'}
                </p>
                <p className="text-xs text-slate-500 mt-2">MP4, MOV up to 50MB</p>
                {!file && <span className="mt-4 px-4 py-2 bg-slate-800 rounded-lg text-xs font-semibold text-slate-300 pointer-events-none">Browse Files</span>}
              </div>

              <button 
                onClick={handleAnalyze} 
                disabled={!file || isProcessing}
                className={`w-full mt-6 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex justify-center items-center shadow-lg
                  ${!file || isProcessing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-primary/40 hover:scale-[1.02]'}`}
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Layers...</>
                ) : (
                  <><Cpu className="w-5 h-5 mr-2" /> Run AI Detection</>
                )}
              </button>
            </div>
          </section>

          {/* Right Column: AI Results & History */}
          <section className="lg:col-span-2 space-y-6">
            
            {/* Dashboard / Result panel */}
            <div className="glass rounded-2xl p-6 lg:p-8 min-h-[320px] relative overflow-hidden flex flex-col justify-center">
              
              {!result && !isProcessing && (
                <div className="absolute inset-0 flex flex-col flex-center items-center justify-center text-slate-500/50">
                   <ShieldCheck className="w-24 h-24 mb-4 opacity-20" />
                   <p className="font-medium tracking-wide">Awaiting Analysis Directive</p>
                </div>
              )}

              {isProcessing && (
                <div className="flex flex-col items-center justify-center space-y-6 py-12">
                   <div className="relative w-24 h-24 flex items-center justify-center">
                     <div className="absolute inset-0 rounded-full border-[3px] border-slate-700"></div>
                     <div className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent animate-spin"></div>
                     <Cpu className="w-8 h-8 text-primary animate-pulse" />
                   </div>
                   <div className="text-center space-y-2">
                     <h3 className="text-lg font-bold text-slate-200 animate-pulse">Running Multi-Layer Architecture</h3>
                     <p className="text-sm text-slate-400">Processing Physiological & Cryptographic Signals...</p>
                   </div>
                </div>
              )}

              {result && !isProcessing && (
                <div className="animate-in fade-in zoom-in duration-500 relative z-10 w-full">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-slate-200 flex items-center">
                        Analysis Complete <span className="ml-3 px-3 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs text-slate-400 font-mono tracking-wider">{result.filename}</span>
                      </h2>
                    </div>
                    
                    <div className={`px-5 py-2.5 rounded-full font-bold text-sm tracking-widest flex items-center shadow-lg uppercase
                      ${result.is_deepfake === 'REAL' ? 'bg-accent/10 text-accent border border-accent/20 shadow-accent/20' : 'bg-danger/10 text-danger border border-danger/20 shadow-danger/20'}
                    `}>
                      {result.is_deepfake === 'REAL' ? <ShieldCheck className="w-5 h-5 mr-2" /> : <ShieldAlert className="w-5 h-5 mr-2" />}
                      {result.is_deepfake}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    {/* Metrics Panel */}
                    <div className="space-y-5">
                      <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-slate-400 flex items-center">
                            <Activity className="w-4 h-4 mr-2" /> Overall AI Confidence
                          </span>
                          <span className={`text-xl font-bold ${result.confidence_score > 55 ? 'text-danger' : 'text-accent'}`}>{result.confidence_score}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${result.confidence_score > 55 ? 'bg-danger' : 'bg-accent'}`} style={{width: `${result.confidence_score}%`}}></div>
                        </div>
                      </div>

                      <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-400 flex items-center">
                          <LinkIcon className="w-4 h-4 mr-2" /> Blockchain Status
                        </span>
                        <span className="px-3 py-1 rounded-md text-xs font-bold bg-accent/20 text-accent border border-accent/30 tracking-widest uppercase">
                          {result.blockchain_verified}
                        </span>
                      </div>
                    </div>

                    {/* Explanations */}
                    <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800">
                      <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center border-b border-slate-800 pb-2"><AlertTriangle className="w-4 h-4 mr-2 text-primary" /> Physiological Signals</h3>
                      <ul className="space-y-3">
                        <li className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Eye Blink Anomaly</span>
                          <span className="text-sm font-bold text-slate-200">{result.details.blink_anomaly_score} hits</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Lip-Sync Mismatch</span>
                          <span className="text-sm font-bold text-slate-200">{result.details.lip_sync_mismatch_score}%</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Temporal Inconsistency</span>
                          <span className="text-sm font-bold text-slate-200">{result.details.temporal_inconsistency_score}%</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* History Table */}
            <div className="glass rounded-2xl p-6 lg:p-8">
              <h2 className="text-lg font-bold mb-6 flex items-center text-slate-200">
                <Clock className="w-5 h-5 mr-3 text-primary" /> Analysis Ledger
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                  <thead className="text-xs uppercase bg-slate-800/50 text-slate-300 border-b border-slate-700">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Filename</th>
                      <th className="px-4 py-3">Result</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3 rounded-tr-lg">Layer 2 Verify</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length > 0 ? history.map((h, i) => (
                      <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-300 truncate max-w-[150px]">{h.filename}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${h.is_deepfake === 'REAL' ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'}`}>
                            {h.is_deepfake}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono">{h.confidence_score}%</td>
                        <td className="px-4 py-3 flex items-center">
                          <ShieldCheck className="w-4 h-4 text-accent mr-1" /> {h.blockchain_verified}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No active historic records in ledger.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </section>
        </main>
      </div>
    </div>
  );
}
