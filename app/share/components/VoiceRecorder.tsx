import React from 'react';

interface VoiceRecorderProps {

    isRecording: boolean;
    recordingTime: number;
    liveTranscript: string;
    transcription: string;
    audioBlob: Blob | null;
    isStructuring: boolean;
    onStartRecording: () => void;
    onStopRecording: () => void;
    onStructure: () => void;
    onReset: () => void;
    onSetVoiceInputMode: (mode: boolean) => void;
    onSetTranscription: (text: string) => void;
    setAudioBlob: (blob: Blob | null) => void;
    formatTime: (seconds: number) => string;
    useSimulation?: boolean;
    disableStructure?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
    isRecording,
    recordingTime,
    liveTranscript,
    transcription,
    audioBlob,
    isStructuring,
    onStartRecording,
    onStopRecording,
    onStructure,
    onReset,
    onSetVoiceInputMode,
    onSetTranscription,
    setAudioBlob,
    formatTime,
    useSimulation = false,
    disableStructure = false
}) => {
    return (
        <div className="mb-6 space-y-4">
            {/* Simulation/Demo Banner */}
            {useSimulation && (
                <div className="px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <div className="text-left">
                        <p className="text-sm font-medium text-yellow-200">Microphone Unavailable - Demo Mode Active</p>
                        <p className="text-xs text-yellow-500/80">Using simulated audio and text for demonstration.</p>
                    </div>
                </div>
            )}

            {/* Recording UI */}
            <div className={`p-6 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10 border ${useSimulation ? 'border-yellow-500/20' : 'border-purple-500/20'} rounded-2xl`}>
                <div className="text-center">
                    {!audioBlob && !isRecording && (
                        <>
                            <div className="text-4xl mb-4">🎤</div>
                            <h3 className="text-lg font-semibold text-white mb-2">Tell Your Story</h3>
                            <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                                Press record and share your experience naturally in any language.
                                You can speak in English, Hindi, or a mix of both!
                            </p>

                            <button
                                type="button"
                                onClick={onStartRecording}
                                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2 mx-auto"
                            >
                                <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
                                Start Recording
                            </button>
                        </>
                    )}

                    {isRecording && (
                        <>
                            <div className="relative w-24 h-24 mx-auto mb-4">
                                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                                <div className="absolute inset-2 bg-red-500/30 rounded-full animate-pulse" />
                                <div className="absolute inset-4 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">🎤</span>
                                </div>
                            </div>
                            <div className="text-3xl font-mono text-white mb-2">{formatTime(recordingTime)}</div>
                            <p className="text-sm text-gray-400 mb-4">Recording... Speak naturally about your experience</p>

                            {/* Live Transcription Display */}
                            {liveTranscript && (
                                <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-xl max-w-lg mx-auto text-left max-h-60 overflow-y-auto custom-scrollbar">
                                    <div className="text-xs text-green-400 mb-1 sticky top-0 bg-[#0f172a]/90 backdrop-blur pb-1">🎧 Live transcription:</div>
                                    <p className="text-sm text-gray-300 italic whitespace-pre-wrap">{liveTranscript}</p>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={onStopRecording}
                                className="px-8 py-4 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-all flex items-center gap-2 mx-auto"
                            >
                                ⏹️ Stop Recording
                            </button>
                        </>
                    )}

                    {audioBlob && !transcription && (
                        <>
                            <div className="text-4xl mb-4">✅</div>
                            <h3 className="text-lg font-semibold text-white mb-2">Recording Complete!</h3>
                            <p className="text-sm text-gray-400 mb-4">Duration: {formatTime(recordingTime)}</p>

                            {/* Audio Playback */}
                            {audioBlob.size > 0 && (
                                <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl max-w-md mx-auto">
                                    <div className="text-xs text-gray-400 mb-2">🎧 Listen to your recording:</div>
                                    <audio
                                        controls
                                        src={URL.createObjectURL(audioBlob)}
                                        className="w-full h-10"
                                        style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                                    />
                                </div>
                            )}

                            {/* Show captured text if any */}
                            {liveTranscript && (
                                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl max-w-lg mx-auto text-left">
                                    <div className="text-xs text-green-400 mb-1">✅ Captured text:</div>
                                    <p className="text-sm text-gray-300">&quot;{liveTranscript}&quot;</p>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-3 justify-center mt-4">
                                <button
                                    type="button"
                                    onClick={onReset}
                                    className="px-5 py-2.5 bg-white/10 text-gray-300 rounded-xl hover:bg-white/20 transition-all text-sm"
                                >
                                    🔄 Re-record
                                </button>
                                {liveTranscript ? (
                                    <button
                                        type="button"
                                        onClick={() => onSetTranscription(liveTranscript)}
                                        disabled={disableStructure}
                                        className={`px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all text-sm ${disableStructure ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {disableStructure ? 'Limit Reached' : '✨ Structure with AI'}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => { onSetVoiceInputMode(false); setAudioBlob(null); }}
                                        className="px-5 py-2.5 bg-white/10 text-gray-300 rounded-xl hover:bg-white/20 transition-all text-sm"
                                    >
                                        ⌨️ Switch to Typing Mode
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Transcription Display */}
            {transcription && !isStructuring && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-white">📝 Transcription</h4>
                        <span className="text-xs text-gray-400">{transcription.split(' ').length} words</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-4 max-h-32 overflow-y-auto">
                        {transcription}
                    </p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onReset}
                            className="flex-1 py-2 bg-white/10 text-gray-300 rounded-xl hover:bg-white/20 transition-all text-sm"
                        >
                            🔄 Start Over
                        </button>
                        <button
                            type="button"
                            onClick={onStructure}
                            disabled={disableStructure}
                            className={`flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all text-sm ${disableStructure ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {disableStructure ? 'Limit Reached' : '✨ Structure with AI'}
                        </button>
                    </div>
                </div>
            )}

            {/* Structuring Animation */}
            {isStructuring && (
                <div className="p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl text-center">
                    <div className="text-4xl mb-4 animate-spin">⚙️</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Crafting Your Story...</h3>
                    <p className="text-sm text-gray-400">AI is organizing your experience into a compelling narrative</p>
                    <div className="mt-4 space-y-2 max-w-xs mx-auto">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="text-green-400">✓</span> Identifying key moments
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="text-green-400">✓</span> Extracting lessons learned
                        </div>
                        <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse">
                            <span>⏳</span> Generating advice section
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
