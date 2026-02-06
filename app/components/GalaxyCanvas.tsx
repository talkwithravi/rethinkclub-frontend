'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GalaxyNode } from './GalaxyNode';

const CATEGORIES = [
    {
        id: 'work', label: 'Work', color: '#a5b4fc', story: 'I found joy in the process, not just the outcome.',
        children: [
            {
                id: 'career', label: 'Career', color: '#c7d2fe', story: 'Climbing the mountain one step at a time.',
                writeUps: [
                    { title: 'Vision', content: 'To build a career that aligns with my values and impact.' },
                    { title: 'Current Focus', content: 'Developing leadership skills and technical mastery.' },
                    { title: 'Reflection', content: 'Am I moving in a direction that excites me?' }
                ]
            },
            {
                id: 'projects', label: 'Projects', color: '#e0e7ff', story: 'Building things that matter.',
                writeUps: [
                    { title: 'Goal', content: 'Launch 3 meaningful projects this year.' },
                    { title: 'Status', content: 'Currently prototyping a new idea.' }
                ]
            },
            {
                id: 'learning', label: 'Learning', color: '#eef2ff', story: 'Curiosity is the engine of growth.',
                writeUps: [
                    { title: 'To Learn', content: 'Advanced AI agents and Rust.' },
                    { title: 'Why', content: 'To stay ahead of the curve and build better tools.' }
                ]
            }
        ]
    },
    {
        id: 'health', label: 'Health', color: '#6ee7b7', story: 'My body is the vessel for my dreams.',
        children: [
            { id: 'fitness', label: 'Fitness', color: '#a7f3d0', story: 'Stronger every day.' },
            { id: 'mind', label: 'Mind', color: '#d1fae5', story: 'Peace begins within.' },
            { id: 'sleep', label: 'Sleep', color: '#ecfdf5', story: 'Rest is not idleness.' }
        ]
    },
    {
        id: 'money', label: 'Money', color: '#fcd34d', story: 'Wealth is a tool for freedom, not a scorecard.',
        children: [
            { id: 'savings', label: 'Savings', color: '#fde68a', story: 'Seed for the future.' },
            { id: 'invest', label: 'Invest', color: '#fef3c7', story: 'Growing without effort.' }
        ]
    },
    {
        id: 'relationships', label: 'Relationships', color: '#f9a8d4', story: 'Connection is the thread that weaves meaning.',
        children: [
            { id: 'family', label: 'Family', color: '#fbcfe8', story: 'Roots that run deep.' },
            { id: 'friends', label: 'Friends', color: '#fce7f3', story: 'Chosen family.' }
        ]
    },
    {
        id: 'life', label: 'Life', color: '#c4b5fd', story: 'Every moment is a new beginning.',
        children: [
            { id: 'travel', label: 'Travel', color: '#ddd6fe', story: 'The world is a book.' },
            { id: 'hobbies', label: 'Hobbies', color: '#ede9fe', story: 'Play allows us to find ourselves.' }
        ]
    },
];

export default function GalaxyCanvas() {
    const router = useRouter();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    // Toggle selection
    const handleNodeClick = (id: string, isChild = false) => {
        if (isChild) {
            if (selectedChildId === id) {
                // Optional: Toggle off child?
                // setSelectedChildId(null);
            } else {
                setSelectedChildId(id);
            }
            return;
        }

        if (selectedId === id) {
            // Optional: setSelectedId(null); 
        } else {
            setSelectedId(id);
            setSelectedChildId(null); // Reset child selection when switching parent
        }
    };

    const handleBgClick = (e: React.MouseEvent) => {
        // Only deselect if clicking the SVG background directly (not a node bubbles up)
        if (e.target === e.currentTarget) {
            if (selectedChildId) {
                setSelectedChildId(null);
            } else if (selectedId) {
                setSelectedId(null);
            }
        }
    };

    // Calculate positions (Pentagon)
    // -90 degrees is top (0, -r)
    const radius = 50;
    const nodes = CATEGORIES.map((cat, index) => {
        const angle = (index * (360 / CATEGORIES.length) - 90) * (Math.PI / 180);
        return {
            ...cat,
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle),
        };
    });

    const selectedCategory = CATEGORIES.find(c => c.id === selectedId);

    // Calculate child nodes if a category is selected
    // Orbit around center
    const childNodes = selectedCategory?.children ? selectedCategory.children.map((child, index) => {
        const count = selectedCategory.children.length;
        // Start from top?
        const angle = (index * (360 / count) - 90) * (Math.PI / 180);
        const childRadius = 32; // Inside the zoomed parent
        return {
            ...child,
            x: childRadius * Math.cos(angle),
            y: childRadius * Math.sin(angle),
        };
    }) : [];

    const isAnyNodeSelected = selectedId !== null;

    return (
        <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden font-sans relative">
            {/* Share Experience Button (HTML positioned) */}
            <button
                onClick={() => router.push('/share')}
                className="absolute bottom-8 right-8 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-6 py-3 backdrop-blur-md transition-all font-medium tracking-wide shadow-lg z-50"
            >
                + Share Experience
            </button>

            <svg
                className="w-full h-full max-w-[100vmin] max-h-[100vmin]"
                viewBox="-100 -100 200 200"
                onClick={handleBgClick}
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    </filter>
                    <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4" />
                    </radialGradient>
                </defs>

                {/* Center Circle - Share Experience */}
                {!isAnyNodeSelected && (
                    <g
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push('/share');
                        }}
                        className="cursor-pointer"
                    >
                        <circle
                            r="18"
                            fill="url(#centerGradient)"
                            filter="url(#glow)"
                            className="transition-all duration-300 hover:scale-110"
                        />
                        <circle
                            r="18"
                            fill="url(#centerGradient)"
                        />
                        <text
                            y="0"
                            alignmentBaseline="middle"
                            textAnchor="middle"
                            fill="white"
                            fontSize="4px"
                            fontWeight="600"
                            className="pointer-events-none select-none"
                            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
                        >
                            + Share
                        </text>
                        <text
                            y="5"
                            alignmentBaseline="middle"
                            textAnchor="middle"
                            fill="white"
                            fontSize="2.5px"
                            fontWeight="400"
                            opacity="0.7"
                            className="pointer-events-none select-none"
                        >
                            Your Experience
                        </text>
                    </g>
                )}

                {/* Main Categories */}
                {nodes.map((node) => (
                    <GalaxyNode
                        key={node.id}
                        id={node.id}
                        label={node.label}
                        x={node.x}
                        y={node.y}
                        color={node.color}
                        story={selectedChildId ? '' : node.story} // Hide parent story if child is selected
                        isSelected={selectedId === node.id}
                        isAnySelected={selectedId !== null}
                        onClick={() => handleNodeClick(node.id)}
                    />
                ))}

                {/* Child Categories (only if parent selected) */}
                {selectedId && childNodes.map((child) => (
                    <GalaxyNode
                        key={child.id}
                        id={child.id}
                        label={child.label}
                        x={child.x}
                        y={child.y}
                        color={child.color}
                        story={child.story}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        writeUps={(child as any).writeUps}
                        isSelected={selectedChildId === child.id}
                        isAnySelected={selectedChildId !== null}
                        onClick={() => handleNodeClick(child.id, true)}
                    />
                ))}
            </svg>
        </div>
    );
}
