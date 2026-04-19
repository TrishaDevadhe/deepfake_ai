import React, { useState, useEffect, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, ShieldCheck, ShieldAlert, Cpu, Activity, Clock, Loader2, Trash2 } from 'lucide-react';

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
      console.error('Failed to fetch history:', err);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to delete all cached history?')) return;
    try {
      const res = await fetch('http://localhost:8000/api/history', { method: 'DELETE' });
      if (res.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
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
    formData.append('file', file);

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
      console.error('Analysis failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 mb-4">
            <ShieldCheck className="w-8 h-8 text-sky-400" />
          </div>
          <h1 className="text-4xl font-semibold mb-2">DeepShield AI</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">Reliable deepfake detection with a clean and simple interface.</p>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <section className="lg:w-1/3 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <UploadCloud className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Upload Video</h2>
                <p className="text-sm text-slate-500">Drag and drop a file or use the button below.</p>
              </div>
            </div>

            <div
              className={`border rounded-3xl p-6 text-center cursor-pointer transition ${dragActive ? 'border-sky-400 bg-slate-900' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input id="file-upload" type="file" className="hidden" accept="video/*" onChange={handleChange} />
              <p className="text-sm text-slate-400 mb-3">{file ? file.name : 'Drop your video here'}</p>
              <button className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">
                Choose file
              </button>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!file || isProcessing}
              className={`w-full rounded-3xl px-5 py-3 text-sm font-semibold transition ${
                !file || isProcessing
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-sky-500 text-white hover:bg-sky-400'
              }`}
            >
              {isProcessing ? (
                <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</span>
              ) : (
                <span className="inline-flex items-center gap-2"><Cpu className="w-4 h-4" /> Detect Deepfake</span>
              )}
            </button>

            <div className="rounded-3xl border border-slate-800 p-4 bg-slate-950">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Status</span>
                <span className="font-semibold text-slate-100">Online</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                <span>Cached analyses</span>
                <button onClick={handleClearHistory} className="text-slate-200 hover:text-white">Clear</button>
              </div>
            </div>
          </section>

          <section className="lg:w-2/3 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              {!result && !isProcessing && (
                <div className="text-center py-16">
                  <p className="text-slate-400">Upload a video to see results here.</p>
                </div>
              )}

              {isProcessing && (
                <div className="text-center py-16">
                  <p className="text-slate-300 mb-4">Analyzing video...</p>
                  <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                </div>
              )}

              {result && !isProcessing && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold">Analysis Complete</h2>
                      <p className="text-sm text-slate-400">{result.filename}</p>
                    </div>
                    <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                      result.is_deepfake === 'REAL' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
                    }`}>
                      {result.is_deepfake === 'REAL' ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                      {result.is_deepfake}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                      <p className="text-sm text-slate-400 uppercase tracking-wide">Confidence</p>
                      <p className="mt-3 text-3xl font-semibold text-white">{result.confidence_score}%</p>
                      <div className="mt-4 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-sky-500" style={{ width: `${result.confidence_score}%` }} />
                      </div>
                    </div>
                    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                      <p className="text-sm text-slate-400 uppercase tracking-wide">Blockchain</p>
                      <p className="mt-3 text-3xl font-semibold text-white">{result.blockchain_verified}</p>
                      <p className="mt-2 text-sm text-slate-500">Verification status</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">Detection details</h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-3xl bg-slate-900 p-4 text-center">
                        <p className="text-2xl font-semibold text-sky-400">{result.details.blink_anomaly_score}</p>
                        <p className="mt-2 text-sm text-slate-500">Blink anomalies</p>
                      </div>
                      <div className="rounded-3xl bg-slate-900 p-4 text-center">
                        <p className="text-2xl font-semibold text-fuchsia-400">{result.details.lip_sync_mismatch_score}%</p>
                        <p className="mt-2 text-sm text-slate-500">Lip sync</p>
                      </div>
                      <div className="rounded-3xl bg-slate-900 p-4 text-center">
                        <p className="text-2xl font-semibold text-cyan-400">{result.details.temporal_inconsistency_score}%</p>
                        <p className="mt-2 text-sm text-slate-500">Temporal issues</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-400">History</p>
                  <h2 className="text-xl font-semibold text-white">Previous analyses</h2>
                </div>
                <button onClick={handleClearHistory} className="text-sm text-slate-400 hover:text-white">
                  Clear
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500">
                      <th className="pb-3 pr-6">Filename</th>
                      <th className="pb-3 pr-6">Result</th>
                      <th className="pb-3 pr-6">Score</th>
                      <th className="pb-3">Verified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {history.length > 0 ? (
                      history.map((h, i) => (
                        <tr key={i} className="hover:bg-slate-950/70 transition-colors">
                          <td className="py-4 pr-6 truncate max-w-[190px]">{h.filename}</td>
                          <td className="py-4 pr-6">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              h.is_deepfake === 'REAL' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
                            }`}>
                              {h.is_deepfake}
                            </span>
                          </td>
                          <td className="py-4 pr-6 font-mono">{h.confidence_score}%</td>
                          <td className="py-4 text-slate-400">{h.blockchain_verified}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-slate-500">
                          No analysis history available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
