'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { User as FirebaseUser } from 'firebase/auth';
import { onAuthChange } from '@/lib/services/authService';
import { CreateStoryInput } from '@/lib/firebase/types';
import { Experience, EnhanceMode } from './types';
import { SAMPLE_EXPERIENCES, RETHINKER_BUDDY_STORIES, RETHINKER_BUDDY_COMMENTS, RETHINKER_BUDDY_PROFILE } from './constants';
import { fixGrammar, expandText, makeEngaging, improveClarity } from './utils';
import { StoryCard } from './components/StoryCard';
import { VoiceRecorder } from './components/VoiceRecorder';
import { StoryForm } from './components/StoryForm';

export default function SharePage() {
    const router = useRouter();
    const [experiences, setExperiences] = useState<Experience[]>(RETHINKER_BUDDY_STORIES);
    const [showForm, setShowForm] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showComments, setShowComments] = useState<string | null>(null);
    const [playingStoryId, setPlayingStoryId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        wasPositive: true,
        whatHappened: '',
        whatILearned: '',
        adviceForOthers: '',
        tags: [] as string[],
        newTag: '',
        imageUrl: '',
        isAnonymous: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // AI Writing Assistant State
    const [activeField, setActiveField] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [showAIAssistant, setShowAIAssistant] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [aiSuggestion, setAiSuggestion] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [aiSuggestedTags, setAiSuggestedTags] = useState<string[]>([]);

    // Voice-to-Story State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [transcription, setTranscription] = useState('');
    const [isStructuring, setIsStructuring] = useState(false);
    const [voiceInputMode, setVoiceInputMode] = useState(false);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const recordingIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
    const [useSimulation, setUseSimulation] = useState(false);
    const [structureAttempts, setStructureAttempts] = useState(0);

    // Firebase Auth State
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Configurable limit based on user tier/status
    const getStructureLimit = (user: FirebaseUser | null) => {
        if (user) return 30;
        return 10;
    };

    const MAX_STRUCTURE_ATTEMPTS = getStructureLimit(currentUser);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [aiError, setAiError] = useState<string | null>(null);

    // Web Speech API refs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = React.useRef<any>(null);
    const [liveTranscript, setLiveTranscript] = useState('');
    const accumulatedTranscriptRef = React.useRef<string>('');
    const interimTranscriptRef = React.useRef<string>('');
    const isRecordingRef = React.useRef<boolean>(false);

    const restartTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeUtteranceRef = React.useRef<any>(null);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            setCurrentUser(user);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Fetch user's stories from Firebase
    const fetchUserStories = useCallback(async () => {
        if (!currentUser) {
            // If not logged in, show sample + bot stories
            setExperiences([...RETHINKER_BUDDY_STORIES, ...SAMPLE_EXPERIENCES]);
            return;
        }

        try {
            const response = await fetch(`/api/stories?pageSize=20&viewingUserId=${currentUser.uid}`);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const fetchedExperiences: Experience[] = data.items.map((story: any) => ({
                    id: story.id,
                    title: story.title,
                    category: story.category,
                    wasPositive: story.isPositive,
                    whatHappened: story.whatHappened,
                    whatILearned: story.whatILearned,
                    adviceForOthers: story.adviceForOthers,
                    createdAt: new Date(story.createdAt).toISOString().split('T')[0],
                    tags: story.tags || [],
                    imageUrl: story.imageUrl,
                    reactions: story.reactions || { helpful: 0, inspiring: 0, eyeOpening: 0 },
                    userReaction: story.userReaction || null,
                    comments: [],
                    commentsCount: story.commentsCount || 0,
                    views: story.views || 0,
                    status: story.status || 'published',
                    isAnonymous: story.isAnonymous,
                    authorName: story.authorName,
                    authorPhotoURL: story.authorPhotoURL,
                }));
                // Combine fetched with bot stories (bot stories at the bottom or interspersed)
                setExperiences([...fetchedExperiences, ...RETHINKER_BUDDY_STORIES]);
            } else {
                // If no user stories, fill with Bot Stories + Samples
                setExperiences([...RETHINKER_BUDDY_STORIES, ...SAMPLE_EXPERIENCES]);
            }
        } catch (error) {
            console.error('Error fetching stories:', error);
            setExperiences([...RETHINKER_BUDDY_STORIES, ...SAMPLE_EXPERIENCES]);
        }
    }, [currentUser]);

    // Fetch user's stories from Firebase
    useEffect(() => {
        if (!authLoading) {
            fetchUserStories();
        }
    }, [fetchUserStories, authLoading]);

    // Start recording
    const startRecording = async () => {
        if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setUseSimulation(true);
            simulateRecording();
            return;
        }

        try {
            if (typeof MediaRecorder === 'undefined') {
                setUseSimulation(true);
                simulateRecording();
                return;
            }

            // Wrap getUserMedia with timeout
            const streamPromise = navigator.mediaDevices.getUserMedia({ audio: true });
            const timeoutPromise = new Promise<MediaStream>((_, reject) =>
                setTimeout(() => reject(new Error('Permission request timed out')), 3000)
            );

            const stream = await Promise.race([streamPromise, timeoutPromise]);

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const chunks: BlobPart[] = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                if (chunks.length > 0) {
                    const blob = new Blob(chunks, { type: 'audio/webm' });
                    setAudioBlob(blob);
                }
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start(100);
            setIsRecording(true);
            setRecordingTime(0);
            setUseSimulation(false);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err: unknown) {
            console.error('Recording error:', err);
            setUseSimulation(true);
            simulateRecording();
        }
    };

    const simulateRecording = () => {
        setIsRecording(true);
        setRecordingTime(0);
        setLiveTranscript('');

        const sampleText = "Microphone check... one, two, three. This is a demonstration of the speech-to-text feature since we couldn't access your microphone. Please check your browser permissions to enable real recording.";
        const words = sampleText.split(' ');
        let wordIndex = 0;

        recordingIntervalRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);

            // Simulate speech-to-text
            if (wordIndex < words.length) {
                const chunk = words.slice(wordIndex, wordIndex + 3).join(' ') + ' ';
                setLiveTranscript(prev => prev + chunk);
                setTranscription(prev => prev + chunk);
                wordIndex += 3;
            }
        }, 1000);
    };

    const stopRecording = () => {
        setIsRecording(false);
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }
        if (useSimulation) {
            setAudioBlob(new Blob([], { type: 'audio/webm' }));
        } else if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Speech Recognition
    const startSpeechRecognition = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        accumulatedTranscriptRef.current = '';
        interimTranscriptRef.current = '';
        isRecordingRef.current = true;

        const createRecognition = () => {
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            recognition.maxAlternatives = 1;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let sessionTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        sessionTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (sessionTranscript) accumulatedTranscriptRef.current += sessionTranscript;
                interimTranscriptRef.current = interimTranscript;
                setLiveTranscript(accumulatedTranscriptRef.current + interimTranscript);
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onerror = (event: any) => {
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    isRecordingRef.current = false;
                    return;
                }
                if (isRecordingRef.current && (event.error === 'network' || event.error === 'no-speech' || event.error === 'aborted')) {
                    restartTimeoutRef.current = setTimeout(() => {
                        if (isRecordingRef.current) createRecognition();
                    }, 500);
                }
            };

            recognition.onend = () => {
                if (interimTranscriptRef.current.trim()) {
                    accumulatedTranscriptRef.current += interimTranscriptRef.current + ' ';
                    interimTranscriptRef.current = '';
                }
                if (isRecordingRef.current) {
                    restartTimeoutRef.current = setTimeout(() => {
                        if (isRecordingRef.current) createRecognition();
                    }, 100);
                } else {
                    if (accumulatedTranscriptRef.current.trim()) {
                        setTranscription(accumulatedTranscriptRef.current.trim());
                    }
                }
            };

            try { recognition.start(); } catch (err) { console.error(err); }
        };

        createRecognition();
        setLiveTranscript('');
    };

    const stopSpeechRecognition = () => {
        isRecordingRef.current = false;
        if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
        }
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { /* ignore */ }
            recognitionRef.current = null;
        }
        const finalText = accumulatedTranscriptRef.current.trim() || liveTranscript.trim();
        if (finalText) setTranscription(finalText);
    };

    const startRecordingWithSpeech = async () => {
        await startRecording();
        startSpeechRecognition();
    };

    const stopRecordingWithSpeech = () => {
        stopRecording();
        stopSpeechRecognition();
    };

    const resetVoiceInput = () => {
        setAudioBlob(null);
        setTranscription('');
        setLiveTranscript('');
        setRecordingTime(0);
        setVoiceInputMode(false);
        setUseSimulation(false);
        accumulatedTranscriptRef.current = '';
        interimTranscriptRef.current = '';
        isRecordingRef.current = false;
    };

    const structureStoryWithAI = async () => {
        if (!transcription) return;

        if (structureAttempts >= MAX_STRUCTURE_ATTEMPTS) {
            setAiError(`You can only use the AI structure feature ${MAX_STRUCTURE_ATTEMPTS} times per session. Please edit manually.`);
            return;
        }

        setIsStructuring(true);
        setStructureAttempts(prev => prev + 1);
        try {
            const response = await fetch('/api/structure-story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcription }),
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.error);

            const structured = result.data;

            setFormData({
                ...formData,
                title: structured.title || formData.title,
                category: structured.category || formData.category,
                wasPositive: structured.isPositive ?? formData.wasPositive,
                whatHappened: structured.whatHappened || '',
                whatILearned: structured.whatILearned || '',
                adviceForOthers: structured.adviceForOthers || '',
                tags: structured.tags || [],
            });
            setIsStructuring(false);
            setVoiceInputMode(false); // Switch to form
        } catch (error: unknown) {
            console.error('Error structuring story:', error);
            setAiError('Failed to structure story with AI.');
            setFormData({
                ...formData,
                title: 'My Story (Draft)',
                category: 'personal',
                whatHappened: transcription,
                tags: ['draft'],
            });
            setIsStructuring(false);
            setVoiceInputMode(false); // Switch to form
        }
    };

    // AI Enhancement
    const enhanceWithAI = async (text: string, field: string, mode: EnhanceMode = 'all'): Promise<string> => {
        try {
            const response = await fetch('/api/enhance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, mode, field }),
            });
            if (!response.ok) throw new Error('API request failed');
            const data = await response.json();
            return data.enhanced || text;
        } catch (error) {
            console.error('Enhancement error:', error);
            let enhanced = text;
            switch (mode) {
                case 'grammar': enhanced = fixGrammar(text); break;
                case 'expand': enhanced = expandText(fixGrammar(text), field); break;
                case 'clarity': enhanced = fixGrammar(improveClarity(text)); break;
                case 'engaging': enhanced = fixGrammar(makeEngaging(text)); break;
                default:
                    enhanced = makeEngaging(fixGrammar(improveClarity(text)));
                    if (enhanced.length < 150) enhanced = expandText(enhanced, field);
            }
            return enhanced;
        }
    };

    const handleReaction = async (id: string, type: 'helpful' | 'inspiring' | 'eyeOpening') => {
        if (!currentUser) return alert('Please sign in to react');

        setExperiences(prev => prev.map(exp => {
            if (exp.id !== id) return exp;
            const newReactions = { ...exp.reactions };
            if (exp.userReaction === type) { // toggle off
                newReactions[type]--;
                return { ...exp, reactions: newReactions, userReaction: null };
            } else { // toggle on
                if (exp.userReaction) newReactions[exp.userReaction]--;
                newReactions[type]++;
                return { ...exp, reactions: newReactions, userReaction: type };
            }
        }));

        try {
            await fetch(`/api/stories/${id}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid, type }),
            });
        } catch (error) { console.error(error); }
    };

    const handleAddComment = async (storyId: string, text: string, parentId?: string | null) => {
        if (!currentUser) {
            alert('Please sign in to comment');
            return;
        }

        try {
            const response = await fetch(`/api/stories/${storyId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    authorId: currentUser.uid,
                    authorName: currentUser.displayName || 'Anonymous',
                    parentId
                })
            });
            const result = await response.json();
            if (result.success) {
                // Fetch fresh comments to update UI properly
                const commentsRes = await fetch(`/api/stories/${storyId}/comments`);
                const commentsData = await commentsRes.json();

                setExperiences(prev => prev.map(exp => {
                    if (exp.id !== storyId) return exp;
                    return {
                        ...exp,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        comments: commentsData.data.map((c: any) => ({
                            id: c.id,
                            author: c.authorName || 'Anonymous',
                            text: c.text,
                            createdAt: new Date(c.createdAt).toLocaleDateString(),
                            parentId: c.parentId
                        })),
                        commentsCount: (exp.commentsCount || 0) + 1
                    };
                }));
            }
        } catch (error) { console.error(error); }
    };

    const handlePlayAudio = (story: Experience) => {
        // Always cancel existing speech first
        window.speechSynthesis.cancel();

        // If clicking the same story, just stop (toggle off)
        if (playingStoryId === story.id) {
            setPlayingStoryId(null);
            return;
        }

        // Start new speech
        const text = `${story.title}. ${story.whatHappened}. What I Learned: ${story.whatILearned}. Advice: ${story.adviceForOthers}`;
        const utterance = new SpeechSynthesisUtterance(text);

        // Try to select a "premium" or more natural voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoices = [
            'Google US English',
            'Samantha',
            'Daniel',
            'Microsoft Aria Online (Natural) - English (United States)',
            'Microsoft Guy Online (Natural) - English (United States)'
        ];

        const selectedVoice = voices.find(v => preferredVoices.some(p => v.name.includes(p))) || voices.find(v => v.lang.startsWith('en'));
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        utterance.onend = () => {
            setPlayingStoryId(null);
            activeUtteranceRef.current = null;
        };
        utterance.onerror = () => {
            setPlayingStoryId(null);
            activeUtteranceRef.current = null;
        };

        setPlayingStoryId(story.id);
        activeUtteranceRef.current = utterance; // Keep reference to prevent GC
        window.speechSynthesis.speak(utterance);
    };

    const fetchComments = async (storyId: string) => {
        try {
            const response = await fetch(`/api/stories/${storyId}/comments`);
            const result = await response.json();
            if (result.success) {
                setExperiences(prev => prev.map(exp => {
                    if (exp.id !== storyId) return exp;
                    return {
                        ...exp,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        comments: result.data.map((c: any) => ({
                            id: c.id,
                            author: c.authorName || 'Anonymous',
                            text: c.text,
                            createdAt: new Date(c.createdAt).toLocaleDateString(),
                            parentId: c.parentId
                        }))
                    };
                }));
            }
        } catch (error) { console.error('Failed to fetch comments:', error); }
    };

    useEffect(() => {
        if (showComments) {
            fetchComments(showComments);
        }
    }, [showComments]);

    const handleSubmit = async (status: 'draft' | 'published') => {
        if (!currentUser) { router.push('/login'); return; }
        setIsSubmitting(true);
        setSaveError('');
        setSaveSuccess(false);

        try {
            if (!formData.title || !formData.category || !formData.whatHappened) throw new Error('Fill required fields');

            const storyData: CreateStoryInput = {
                title: formData.title,
                whatHappened: formData.whatHappened,
                whatILearned: formData.whatILearned,
                adviceForOthers: formData.adviceForOthers,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                category: formData.category as any,
                type: formData.wasPositive ? 'good' : 'lesson',
                isPositive: formData.wasPositive,
                tags: formData.tags,
                imageUrl: formData.imageUrl || undefined,
                transcription: transcription || undefined,
                recordingDuration: recordingTime > 0 ? recordingTime : undefined,
                isAnonymous: formData.isAnonymous,
                status: status,
            };

            // Cast storyData to any to match API expectation if needed, or update types
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const payload: any = storyData;

            const response = await fetch('/api/stories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    userName: formData.isAnonymous ? 'Anonymous' : (currentUser.displayName || 'Anonymous'),
                    userPhotoURL: formData.isAnonymous ? null : currentUser.photoURL,
                    story: payload,
                }),
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
            setSaveSuccess(true);

            // --- RETHINKER BUDDY LOGIC ---
            // Trigger automatic bot comment ONLY for published stories
            if (result.storyId && status === 'published') {
                setTimeout(async () => {
                    try {
                        const randomComment = RETHINKER_BUDDY_COMMENTS[Math.floor(Math.random() * RETHINKER_BUDDY_COMMENTS.length)];
                        await fetch(`/api/stories/${result.storyId}/comments`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: 'rethinker-buddy-bot', // dedicated bot ID
                                authorName: RETHINKER_BUDDY_PROFILE.name,
                                text: randomComment,
                                parentId: null
                            })
                        });
                        // Optional: Refresh feed to show comment if needed, but for now just posting it is enough
                    } catch (err) {
                        console.error('Bot comment failed', err);
                    }
                }, 3000); // Wait 3 seconds to feel natural
            }
            // -----------------------------

            setTimeout(() => {
                setShowForm(false);
                setFormData({
                    title: '', category: '', wasPositive: true, whatHappened: '', whatILearned: '', adviceForOthers: '', tags: [], newTag: '', imageUrl: '', isAnonymous: false
                });
                resetVoiceInput();
                // Refresh stories to show the new one + potential bot comment
                if (currentUser) {
                    // trigger re-fetch logic if extracted, or easier: rely on auto-refresh or user reload. 
                    // For now, let's just let the user see their story.
                }
            }, 2000);
        } catch (error: unknown) {
            const err = error as Error;
            console.error('Save error:', err);
            setSaveError(err.message || 'Unknown error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] bg-gradient-to-b from-[#0f172a] to-[#1e1b4b] pb-20">
            {/* Navbar */}
            <nav className="border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md fixed w-full z-50 top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="text-xl font-bold tracking-tight text-white/90">RethinkClub</Link>
                            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
                                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                                <Link href="/share" className="text-white font-semibold">Feed</Link>
                                <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {currentUser ? (
                                <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-white text-gray-300">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                                        {currentUser?.displayName?.[0] || currentUser?.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden md:inline">{currentUser?.displayName || 'User'}</span>
                                </Link>
                            ) : (
                                <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white">Sign In</Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="pt-24">
                {saveSuccess && (
                    <div className="fixed top-24 right-4 bg-green-100 border border-green-200 text-green-800 px-6 py-4 rounded-xl shadow-lg animate-fade-in z-50 flex items-center gap-3">
                        <span className="text-xl">✅</span>
                        <div>
                            <h4 className="font-bold">Success!</h4>
                            <p className="text-sm">Your story has been saved.</p>
                        </div>
                    </div>
                )}
                {saveError && (
                    <div className="fixed top-24 right-4 bg-red-100 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-lg animate-fade-in z-50 flex items-center gap-3">
                        <span className="text-xl">❌</span>
                        <div>
                            <h4 className="font-bold">Error</h4>
                            <p className="text-sm">{saveError}</p>
                        </div>
                    </div>
                )}
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-sm">
                            Share Your <span className="text-indigo-400 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Wisdom</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                            Your experiences can light the way for someone else. Share your authentic stories, lessons, and breakthroughs.
                        </p>

                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-8 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-medium shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
                            >
                                ✨ Share Your Experience
                            </button>
                        )}
                    </div>

                    {/* Main Content Area */}
                    <div className="max-w-2xl mx-auto">
                        {/* Feed Column */}
                        <div className="space-y-6">
                            {/* Voice Recording Section */}
                            {showForm && (
                                <>
                                    {aiError && (
                                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl flex items-center justify-between animate-fade-in">
                                            <div className="flex items-center gap-2">
                                                <span>⚠️</span>
                                                <span>{aiError}</span>
                                            </div>
                                            <button
                                                onClick={() => setAiError(null)}
                                                className="px-3 py-1 bg-red-500/20 rounded hover:bg-red-500/30 transition-colors text-sm"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    )}
                                    <VoiceRecorder
                                        isRecording={isRecording}
                                        recordingTime={recordingTime}
                                        liveTranscript={liveTranscript}
                                        transcription={transcription}
                                        audioBlob={audioBlob}
                                        isStructuring={isStructuring}
                                        onStartRecording={startRecordingWithSpeech}
                                        onStopRecording={stopRecordingWithSpeech}
                                        onStructure={structureStoryWithAI}
                                        onReset={resetVoiceInput}
                                        onSetVoiceInputMode={setVoiceInputMode}
                                        onSetTranscription={setTranscription}
                                        setAudioBlob={setAudioBlob}
                                        formatTime={formatTime}
                                        useSimulation={useSimulation}
                                        disableStructure={structureAttempts >= MAX_STRUCTURE_ATTEMPTS}
                                    />
                                </>
                            )}

                            {/* Story List */}
                            {!showForm && (
                                <div className="space-y-4">
                                    {experiences.length === 0 ? (
                                        <div className="text-center py-16">
                                            <div className="text-5xl mb-4">📝</div>
                                            <h3 className="text-xl font-medium text-white mb-2">No experiences yet</h3>
                                            <p className="text-gray-400 mb-6">Share your first experience to help others!</p>
                                            <button onClick={() => setShowForm(true)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium">
                                                + Share Your First Experience
                                            </button>
                                        </div>
                                    ) : (
                                        experiences.map(exp => (
                                            <StoryCard
                                                key={exp.id}
                                                experience={exp}
                                                isExpanded={expandedId === exp.id}
                                                currentUser={currentUser}
                                                showComments={showComments === exp.id}
                                                onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
                                                onReaction={handleReaction}
                                                onEdit={(e) => console.log('Edit', e.id)} // Placeholder edit
                                                onDelete={(id) => setExperiences(prev => prev.filter(e => e.id !== id))} // Placeholder delete
                                                onShare={(exp, platform) => console.log('Share', platform)}
                                                onToggleComments={(id) => setShowComments(showComments === id ? null : id)}
                                                onAddComment={handleAddComment}
                                                isPlaying={playingStoryId === exp.id}
                                                onPlay={handlePlayAudio}
                                            />
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Render Form if showForm is true */}
                            {showForm && !voiceInputMode && (
                                <StoryForm
                                    formData={formData}
                                    setFormData={setFormData}
                                    onSubmit={handleSubmit}
                                    onCancel={() => setShowForm(false)}
                                    isSubmitting={isSubmitting}
                                    activeField={activeField}
                                    setActiveField={setActiveField}
                                    showAIAssistant={showAIAssistant}
                                    aiSuggestion={aiSuggestion}
                                    onEnhance={enhanceWithAI}
                                    aiSuggestedTags={aiSuggestedTags}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
