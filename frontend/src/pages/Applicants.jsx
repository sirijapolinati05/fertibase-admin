import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import {
  Briefcase, Eye, UserX, Calendar, X, ChevronDown, Check, FileText, Upload, Download
} from 'lucide-react';

const useData = () => ({ cache: {}, updateCache: () => {} });

const getFileUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("/static")) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
    return `${baseUrl}${url}`;
  }
  return url;
};

const Applications = () => {
  const { cache, updateCache } = useData();
  const [applications, setApplications] = useState(cache.applications || []);
  const [loading, setLoading] = useState(false); // Initialize based on cache below

  const [selectedApp, setSelectedApp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Job filter state
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null); // null = All Jobs
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const [sortByScore, setSortByScore] = useState(false);

  // Scheduling State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedulingApp, setSchedulingApp] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    start_time: '',
    duration: 45,
    timezone: 'Asia/Calcutta',
    meeting_link: '',
    notes: ''
  });
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [hiringApp, setHiringApp] = useState(null);
  const [offerLetterFile, setOfferLetterFile] = useState(null);
  const [isHiring, setIsHiring] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState(null); // 'loading', 'done', 'error'
  const [revealAI, setRevealAI] = useState(false);
  const [resumePreview, setResumePreview] = useState(false);

  // Status hierarchy for cumulative pipeline
  const STATUS_ORDER = ['applied', 'shortlisted', 'tr1', 'tr2', 'final'];

  const fetchApplications = async (isBackground = false) => {
    if (!cache.applications && !isBackground) setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const url = `${import.meta.env.VITE_API_BASE_URL}/applications/?limit=1000`;
      const { data } = await axios.get(url, {
        headers: { Authorization: token }
      });
      const newApps = data.data || [];
      setApplications(newApps);
      updateCache('applications', newApps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/jobs/`);
      setJobs(data || []);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync local state with cache when cache changes (e.g., from other pages or background fetch)
  useEffect(() => {
    if (cache.applications) {
      setApplications(cache.applications);
    }
  }, [cache.applications]);

  useEffect(() => {
    // Initial fetch if cache is empty or on mount to ensure fresh data
    fetchApplications();
    fetchJobs();
  }, []);

  // Auto-refresh mechanism for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchApplications(true);
    }, 8000); // Refresh every 8 seconds
    return () => clearInterval(interval);
  }, []);


  const updateStatus = async (id, newStatus) => {
    const currentApp = applications.find(a => a.id === id);
    if (!currentApp) return;

    // Backward Guard: Prevent moving to an earlier stage (except 'rejected')
    const currentOrder = STAGE_ORDER[currentApp.applicant_stage] || 0;
    const nextOrder = STAGE_ORDER[newStatus] || 0;

    if (newStatus !== 'rejected' && nextOrder < currentOrder) {
      console.warn('Blocked backward move attempt');
      return;
    }

    // Optimistic Update
    const previousApps = [...applications];
    setApplications(prev => prev.map(app =>
      app.id === id ? { ...app, applicant_stage: newStatus } : app
    ));

    try {
      const token = localStorage.getItem('admin_token');
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/applications/${id}`,
        { status: newStatus },
        { headers: { Authorization: token } }
      );

      // Synchronize cache immediately for instant global updates
      const updatedApps = previousApps.map(app =>
        app.id === id ? { ...app, applicant_stage: newStatus } : app
      );
      updateCache('applications', updatedApps);


      if (selectedApp && selectedApp.id === id) {
        setIsModalOpen(false);
      }
    } catch (err) {
      setApplications(previousApps);
      alert('Failed to update status');
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    const appId = schedulingApp.id;

    // Optimistic update for UI feel (though status might not change, we update interview_details)
    const previousApps = [...applications];
    const updatedDetails = {
      ...scheduleForm,
      scheduled_at: new Date().toISOString()
    };

    setApplications(prev => prev.map(app =>
      app.id === appId ? { ...app, interview_details: updatedDetails } : app
    ));

    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/applications/${appId}/schedule`,
        scheduleForm,
        { headers: { Authorization: token } }
      );
      setIsScheduleModalOpen(false);
      // Reset form
      setScheduleForm({
        start_time: '',
        duration: 45,
        timezone: 'Asia/Calcutta',
        meeting_link: '',
        notes: ''
      });
    } catch (err) {
      setApplications(previousApps);
      alert('Failed to schedule interview');
    }
  };

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    if (!offerLetterFile) return alert('Please select an offer letter file');
    
    setIsHiring(true);
    const appId = hiringApp.id;
    const formData = new FormData();
    formData.append('offer_letter', offerLetterFile);

    try {
      const token = localStorage.getItem('admin_token');
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/applications/${appId}/hire`, 
        formData, 
        { 
          headers: { 
            Authorization: token
          } 
        }
      );

      // Update local state and cache
      const updatedApp = data.data;
      setApplications(prev => {
        const next = prev.map(app => app.id === appId ? updatedApp : app);
        updateCache('applications', next);
        return next;
      });
      
      setIsHireModalOpen(false);
      setOfferLetterFile(null);
      setHiringApp(null);
      alert('Candidate hired successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to process hiring: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsHiring(false);
    }
  };

  const openDetails = (app) => {
    console.log('Selected Application Data:', app); // DEBUG LOG
    setSelectedApp(app);
    setRevealAI(false); // Reset reveal state for the new app
    setResumePreview(false); // Reset resume preview
    setIsModalOpen(true);
  };

  const analyzeApplication = async (appId) => {
    // If we already have a score, just reveal it
    if (selectedApp.ai_score > 0 || selectedApp.ai_analysis?.summary) {
      setRevealAI(true);
      setAnalysisStatus('done');
      setTimeout(() => setAnalysisStatus(null), 2000);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStatus('loading');
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/applications/${appId}/analyze`, {}, {
        headers: { Authorization: token }
      });

      // Poll or wait for results
      setTimeout(async () => {
        const token = localStorage.getItem('admin_token');
        const url = `${import.meta.env.VITE_API_BASE_URL}/applications/?limit=100`;
        const { data } = await axios.get(url, {
          headers: { Authorization: token }
        });
        const newApps = data.data || [];
        setApplications(newApps);
        updateCache('applications', newApps);

        // Update the currently selected app in the modal
        const updatedSelectedApp = newApps.find(a => a.id === appId);
        if (updatedSelectedApp) {
          setSelectedApp(updatedSelectedApp);
          setRevealAI(true); // Reveal the results once fetched
        }

        setIsAnalyzing(false);
        setAnalysisStatus('done');
        setTimeout(() => setAnalysisStatus(null), 3000);
      }, 6000);
    } catch (err) {
      console.error(err);
      setAnalysisStatus('error');
      setIsAnalyzing(false);
    }
  };

  const columns = [
    { id: 'applied', label: 'Applied', color: 'blue' },
    { id: 'shortlisted', label: 'Shortlisted', color: 'amber' },
    { id: 'tr1', label: 'Technical Round 1', color: 'purple' },
    { id: 'tr2', label: 'Technical Round 2', color: 'indigo' },
    { id: 'final', label: 'Hired', color: 'blue' },
    { id: 'rejected', label: 'Rejected', color: 'red' },
  ];

  const STAGE_ORDER = {
    'applied': 0, 'pending': 0, 'reviewing': 0,
    'shortlisted': 1,
    'tr1': 2,
    'tr2': 3,
    'final': 4, 'hired': 4
  };

  const getAppsByColumn = (colId) => {
    // 1. Filter by Job
    let filtered = selectedJob
      ? applications.filter(app => app.job_id === selectedJob.id)
      : applications;

    // 2. Sorting by AI Score if enabled
    if (sortByScore) {
      filtered = [...filtered].sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0));
    }

    // 3. Rejected column logic
    if (colId === 'rejected') {
      return filtered.filter(app => app.applicant_stage === 'rejected');
    }

    // 4. Cumulative logic
    const colOrder = STAGE_ORDER[colId];
    if (colOrder === undefined) return [];

    return filtered.filter(app => {
      // 1. Get the candidate's current stage rank
      const appStageOrder = STAGE_ORDER[app.applicant_stage] || 0;

      // 2. Cumulative: Show in this column if their stage is THIS level OR higher
      // We show them in previous stages even if they are currently rejected, 
      // unless the user specifically wants to hide rejected ones from the success funnel.
      // Given the user request "has to be in previous state also even when moved to next stage",
      // and "applications at last are visible in rejected", we keep them in previous columns.

      return appStageOrder >= colOrder;
    });

  };

  // Column accent config — bg colors per column
  const colAccent = {
    'applied': { colBg: 'bg-blue-50', headerBg: 'bg-blue-100/70', headerText: 'text-blue-700', dot: 'bg-blue-400', badge: 'bg-white text-blue-600 border-blue-200', cardBg: 'bg-white hover:border-blue-200' },
    'shortlisted': { colBg: 'bg-amber-50', headerBg: 'bg-amber-100/70', headerText: 'text-amber-700', dot: 'bg-amber-400', badge: 'bg-white text-amber-600 border-amber-200', cardBg: 'bg-white hover:border-amber-200' },
    'tr1': { colBg: 'bg-purple-50', headerBg: 'bg-purple-100/70', headerText: 'text-purple-700', dot: 'bg-purple-400', badge: 'bg-white text-purple-600 border-purple-200', cardBg: 'bg-white hover:border-purple-200' },
    'tr2': { colBg: 'bg-indigo-50', headerBg: 'bg-indigo-100/70', headerText: 'text-indigo-700', dot: 'bg-indigo-400', badge: 'bg-white text-indigo-600 border-indigo-200', cardBg: 'bg-white hover:border-indigo-200' },
    'final': { colBg: 'bg-teal-50', headerBg: 'bg-teal-100/70', headerText: 'text-teal-700', dot: 'bg-teal-500', badge: 'bg-white text-teal-600 border-teal-200', cardBg: 'bg-white hover:border-teal-200' },
    'rejected': { colBg: 'bg-red-50', headerBg: 'bg-red-100/70', headerText: 'text-red-700', dot: 'bg-red-400', badge: 'bg-white text-red-600 border-red-200', cardBg: 'bg-white hover:border-red-200' },
  };

  const visibleTotal = selectedJob
    ? applications.filter(a => a.job_id === selectedJob.id).length
    : applications.length;

  const topMatchId = selectedJob
    ? applications
      .filter(a => a.job_id === selectedJob.id && a.ai_score > 0)
      .reduce((top, curr) => (curr.ai_score > (top?.ai_score || 0) ? curr : top), null)?.id
    : null;

  return (
    <div className="animate-entry h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-[1.75rem] font-bold text-[#0F172A] tracking-tight leading-tight mb-1">Applicants Pipeline</h1>
            <p className="text-[#64748B] text-[13px] font-medium">Filter by job opening and track candidate progression through the hiring pipeline.</p>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-full border border-blue-100/50 self-start mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">Live Updates</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSortByScore(!sortByScore)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${sortByScore
              ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm'
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
          >
            {sortByScore ? '⭐ Sorted by Match' : 'Sort by AI Match'}
          </button>
          <span className="text-[11px] font-semibold text-slate-400">{visibleTotal} applications</span>
        </div>
      </div>

      {/* Job Filter Dropdown */}
      <div className="mb-5 relative w-fit min-w-56" ref={filterRef}>
        <button
          onClick={() => setFilterOpen(v => !v)}
          className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-700 hover:border-slate-300 hover:shadow transition-all"
        >
          <div className="flex items-center gap-2">
            <Briefcase size={14} className="text-slate-400 shrink-0" />
            <span className="whitespace-nowrap">{selectedJob ? selectedJob.title : 'All Jobs'}</span>
          </div>
          <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {filterOpen && (
          <div className="absolute top-full mt-2 left-0 min-w-full w-max bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            {/* All Jobs option */}
            <button
              onClick={() => { setSelectedJob(null); setSortByScore(false); setFilterOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors ${!selectedJob ? 'text-blue-600' : 'text-slate-600'
                }`}
            >
              All Jobs
              {!selectedJob && <Check size={13} className="text-blue-500" />}
            </button>
            <div className="border-t border-slate-100" />
            {jobs.map(job => (
              <button
                key={job.id}
                onClick={() => {
                  setSelectedJob(job);
                  setSortByScore(true); // Auto-sort by score when a specific job is selected
                  setFilterOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors ${selectedJob?.id === job.id ? 'text-blue-600 font-semibold' : 'text-slate-600'
                  }`}
              >
                <span className="whitespace-nowrap text-left">{job.title}</span>
                {selectedJob?.id === job.id && <Check size={13} className="text-blue-500 shrink-0" />}
              </button>
            ))}
            {jobs.length === 0 && (
              <p className="px-4 py-3 text-xs text-slate-400 italic">No job openings found</p>
            )}
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-6 custom-scrollbar">
        <div className="flex gap-5 h-full min-w-max">
          {columns.map((col) => {
            const colApps = getAppsByColumn(col.id);
            const accent = colAccent[col.id] || { dot: 'bg-slate-400', badge: 'bg-slate-50 text-slate-500 border-slate-100' };
            return (
              <div key={col.id} className={`w-[260px] flex flex-col rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden ${accent.colBg}`}>
                {/* Column header */}
                <div className={`flex items-center justify-between px-4 py-3 border-b border-black/5 ${accent.headerBg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${accent.dot}`} />
                    <h2 className={`font-bold text-[11px] tracking-widest uppercase ${accent.headerText}`}>{col.label}</h2>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${accent.badge}`}>
                    {colApps.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-3 overflow-y-auto p-3 custom-scrollbar">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 animate-pulse h-28 flex flex-col gap-2">
                        <div className="h-3 w-3/4 bg-slate-100 rounded" />
                        <div className="h-2 w-1/2 bg-slate-50 rounded" />
                        <div className="mt-auto h-6 w-full bg-slate-50 rounded" />
                      </div>
                    ))
                  ) : colApps.length === 0 ? (
                    <div className="h-20 flex items-center justify-center border border-dashed border-slate-200 rounded-xl">
                      <p className="text-[10px] font-medium text-slate-300 uppercase tracking-widest">Empty</p>
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <div key={app.id} className="bg-white rounded-xl p-4 border border-slate-100 hover:border-blue-100 hover:shadow-md transition-all group">
                        {/* Card top: name + date */}
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-[#1E293B] text-[12px] group-hover:text-blue-700 transition-colors truncate pr-2 leading-tight">{app.full_name}</h3>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                            {format(new Date(app.created_at), 'MMM dd')}
                          </span>
                        </div>

                        {/* Job title */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <p className="text-[11px] text-slate-400 font-medium truncate">{app.job_title}</p>
                          {app.ai_score > 0 && (
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold border shadow-sm ${app.id === topMatchId
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : 'bg-slate-50 text-slate-500 border-slate-100'
                              }`}>
                              {app.id === topMatchId && <span className="text-amber-500">👑</span>}
                              {app.ai_score}%
                            </div>
                          )}
                        </div>

                        {/* Rejected badge */}
                        {app.applicant_stage === 'rejected' && (
                          <div className="mb-3 inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-100 rounded-full text-[9px] font-bold text-red-500 uppercase tracking-wider">
                            <UserX size={9} /> Rejected
                          </div>
                        )}

                        {/* Actions */}
                        <div className="pt-3 border-t border-slate-50">
                          <button onClick={() => openDetails(app)} className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700 transition-all mb-2">
                            <Eye size={11} strokeWidth={2} />
                            View details
                          </button>
                          <div className="flex flex-wrap gap-1.5">
                            {col.id === 'applied' && (
                              <>
                                <button onClick={() => updateStatus(app.id, 'shortlisted')} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white transition-all">Shortlist</button>
                                <button onClick={() => updateStatus(app.id, 'rejected')} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-red-500 bg-red-50 border border-red-100 hover:bg-red-600 hover:text-white transition-all">Reject</button>
                              </>
                            )}
                            {col.id === 'shortlisted' && (
                              <>
                                <button onClick={() => updateStatus(app.id, 'tr1')} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white transition-all">Move to TR1</button>
                                <button onClick={() => updateStatus(app.id, 'rejected')} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-red-500 bg-red-50 border border-red-100 hover:bg-red-600 hover:text-white transition-all">Reject</button>
                                <button onClick={() => { setSchedulingApp(app); setIsScheduleModalOpen(true); }} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-100 hover:bg-purple-600 hover:text-white transition-all">
                                  <Calendar size={9} /> Schedule
                                </button>
                              </>
                            )}
                            {col.id === 'tr1' && (
                              <>
                                <button onClick={() => updateStatus(app.id, 'tr2')} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white transition-all">Move to TR2</button>
                                <button onClick={() => updateStatus(app.id, 'rejected')} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-red-500 bg-red-50 border border-red-100 hover:bg-red-600 hover:text-white transition-all">Reject</button>
                                <button onClick={() => { setSchedulingApp(app); setIsScheduleModalOpen(true); }} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-100 hover:bg-purple-600 hover:text-white transition-all">
                                  <Calendar size={9} /> Schedule
                                </button>
                              </>
                            )}
                            {col.id === 'tr2' && (
                              <>
                                <button onClick={() => { setHiringApp(app); setIsHireModalOpen(true); }} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white bg-blue-600 border border-blue-700 hover:bg-blue-700 transition-all shadow-sm">Mark Hired</button>
                                <button onClick={() => updateStatus(app.id, 'rejected')} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-red-500 bg-red-50 border border-red-100 hover:bg-red-600 hover:text-white transition-all">Reject</button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex justify-center items-start p-4 pt-10 md:pt-10 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-white animate-in zoom-in-95 duration-200 mb-10">
            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-none">Application Details</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Candidate Portfolio</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Body — no scroll */}
            <div className="px-5 py-4 space-y-3">
              {/* Candidate info */}
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow shadow-blue-100 shrink-0">
                  {selectedApp.full_name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 leading-tight truncate">{selectedApp.full_name}</h3>
                  <p className="text-[11px] text-slate-500 font-semibold truncate">{selectedApp.job_title}</p>
                </div>
              </div>

              {/* Resume & AI Analysis Section */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Resume</span>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-3">
                    {selectedApp.resume_url && (
                      <button
                        onClick={() => analyzeApplication(selectedApp.id)}
                        disabled={isAnalyzing}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all shadow-sm disabled:opacity-50 ${selectedApp.ai_score
                          ? 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
                          : 'text-white bg-blue-600 border-blue-700 hover:bg-blue-700'
                          }`}
                      >
                        {isAnalyzing ? 'AI is Thinking...' : (selectedApp.ai_score ? 'Re-analyze' : 'Analyze with AI')}
                      </button>
                    )}
                    {selectedApp.resume_url && (
                      <button
                        onClick={() => setResumePreview(true)}
                        className="text-[11px] font-bold text-orange-500 hover:text-orange-600 underline underline-offset-2 transition-all">
                        Open Resume
                      </button>
                    )}
                  </div>
                  {analysisStatus === 'loading' && <p className="text-[9px] font-bold text-blue-600 animate-pulse">Analysis in progress... please wait</p>}
                  {analysisStatus === 'done' && <p className="text-[9px] font-bold text-blue-600">✨ Analysis complete!</p>}
                  {analysisStatus === 'error' && <p className="text-[9px] font-bold text-red-500">❌ Failed to start analysis</p>}
                </div>
              </div>

              {/* AI Analysis Section — Only shown if 'revealAI' is true */}
              {revealAI && (
                <>
                  {selectedApp.ai_score > 0 ? (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 space-y-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-blue-700 uppercase tracking-widest">AI Match Analysis</span>
                        <span className="text-xs font-black text-blue-700">{selectedApp.ai_score}% Match</span>
                      </div>
                      <p className="text-[11px] text-blue-800 leading-relaxed italic">
                        "{selectedApp.ai_analysis?.summary}"
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <p className="text-[8px] font-bold text-blue-600 uppercase mb-1">Key Matches</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedApp.ai_analysis?.matching_skills?.slice(0, 3).map((s, i) => (
                              <span key={i} className="text-[9px] bg-white text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Missing/Weak</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedApp.ai_analysis?.missing_skills?.slice(0, 3).map((s, i) => (
                              <span key={i} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 mt-2 text-center animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-[10px] font-bold text-red-600">AI Match Score: 0%</p>
                      <p className="text-[9px] text-red-400">The resume does not match the job description requirements.</p>
                    </div>
                  )}
                </>
              )}

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Application Responses */}
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Application Responses</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Course</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{selectedApp.highest_degree || '—'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Domain</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{selectedApp.professional_domain || '—'}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Skills</p>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">{selectedApp.key_skills || 'No skills listed'}</p>
              </div>

              {/* Offer Letter Download for Hired Candidates */}
              {selectedApp.applicant_stage === 'hired' && selectedApp.offer_letter_url && (
                <div className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center justify-between group/offer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-blue-900 leading-none mb-1">Offer Letter</p>
                      <p className="text-[9px] text-blue-600/70 font-medium">Sent to candidate</p>
                    </div>
                  </div>
                  <a 
                    href={getFileUrl(selectedApp.offer_letter_url)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    <Download size={14} /> Download
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-4 flex justify-end">
              <button onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Preview Modal */}
      {resumePreview && selectedApp?.resume_url && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[120] flex justify-center items-center p-4 md:p-8 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-full max-h-[90vh] shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Resume: {selectedApp.full_name}</h3>
              <button onClick={() => setResumePreview(false)} className="p-2 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full shadow-sm transition-all border border-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 w-full bg-slate-100">
              <iframe 
                src={getFileUrl(selectedApp.resume_url)} 
                className="w-full h-full border-none"
                title="Resume Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {isScheduleModalOpen && schedulingApp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex justify-center items-start p-4 pt-10 md:pt-20 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-white flex flex-col animate-in zoom-in-95 duration-200 mb-10">
            <div className="p-6 border-b border-slate-50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-none mb-1">Schedule Interview</h3>
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">For {schedulingApp.full_name}</p>
                </div>
                <button onClick={() => setIsScheduleModalOpen(false)} className="p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition-all">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleScheduleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Session Date & Time</label>
                  <input required type="datetime-local" value={scheduleForm.start_time} onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-xs text-slate-700" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Duration (Mins)</label>
                    <input required type="number" value={scheduleForm.duration} onChange={(e) => setScheduleForm({ ...scheduleForm, duration: parseInt(e.target.value) })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-xs text-slate-700" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Timezone</label>
                    <select value={scheduleForm.timezone} onChange={(e) => setScheduleForm({ ...scheduleForm, timezone: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-[10px] text-slate-700">
                      <option value="Asia/Calcutta">IST (India)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">EST (US)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Meeting Link (Google Meet)</label>
                  <input required type="url" placeholder="https://meet.google.com/xxx-xxxx-xxx" value={scheduleForm.meeting_link} onChange={(e) => setScheduleForm({ ...scheduleForm, meeting_link: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-xs text-slate-700" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Additional Notes</label>
                  <textarea rows="2" placeholder="Mention instructions..." value={scheduleForm.notes} onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-xs text-slate-700 resize-none" />
                </div>
                <button type="submit" className="w-full py-3 bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2">
                  <Calendar size={14} /> Schedule Interview
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Hire & Offer Letter Modal */}
      {isHireModalOpen && hiringApp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex justify-center items-start p-4 pt-10 md:pt-20 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-white flex flex-col animate-in zoom-in-95 duration-200 mb-10">
            {/* Header */}
            <div className="p-4 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-none mb-1">Confirm Hire & Upload Offer Letter</h3>
              </div>
              <button onClick={() => setIsHireModalOpen(false)} className="p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Candidate Info Card */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 leading-none mb-1">{hiringApp.full_name}</h4>
                <p className="text-[10px] text-slate-500 font-medium mb-1">{hiringApp.job_title} · {hiringApp.current_company || 'Independent'}</p>
                <p className="text-[10px] text-slate-400 font-medium">{hiringApp.email}</p>
              </div>

              <form onSubmit={handleHireSubmit} className="space-y-3">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                    Offer Letter <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-1.5">
                    Upload the signed offer letter (PDF, Word, etc.). It will be sent directly to the candidate.
                  </p>
                  
                  <div className={`relative border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    offerLetterFile ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                  }`}>
                    <input 
                      type="file" 
                      required
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setOfferLetterFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                      offerLetterFile ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'
                    }`}>
                      {offerLetterFile ? <FileText size={20} /> : <Upload size={20} />}
                    </div>
                    <div className="text-center">
                      <p className={`text-[12px] font-bold ${offerLetterFile ? 'text-blue-700' : 'text-slate-600'}`}>
                        {offerLetterFile ? offerLetterFile.name : 'Choose file'}
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5 uppercase tracking-wider">PDF, DOC, DOCX supported</p>
                    </div>
                  </div>
                </div>


                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsHireModalOpen(false)}
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[11px] rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isHiring || !offerLetterFile}
                    className="flex-2 px-6 py-3 bg-blue-500 text-white font-bold uppercase tracking-widest text-[11px] rounded-xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    {isHiring ? 'Processing...' : 'Confirm Hire & Send'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;


