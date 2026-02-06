import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface GalaxyNodeProps {
    id: string;
    label: string;
    x: number;
    y: number;
    color: string;
    story: string;
    writeUps?: { title: string; content: string }[];
    isSelected: boolean;
    isAnySelected: boolean;
    onClick: () => void;
    isEditing?: boolean;
    onClose?: () => void;
}

export const GalaxyNode: React.FC<GalaxyNodeProps> = ({
    label,
    x,
    y,
    color,
    story,
    writeUps,
    isSelected,
    isAnySelected,
    onClick,
    isEditing,
    onClose
}) => {
    // If selected, center (0,0) and scale up
    // If another is selected, fade out
    // Default: position at x, y

    const isOthers = isAnySelected && !isSelected;
    const [activeIndex, setActiveIndex] = useState(0);

    // Form State
    const [formData, setFormData] = useState({ title: '', category: 'Work', content: '' });

    const handleScroll = (e: React.UIEvent<unknown>) => {
        // Cast to HTMLElement to access scrollTop and clientHeight regardless of exact type
        const element = e.currentTarget as HTMLElement;
        const index = Math.round(element.scrollTop / element.clientHeight);
        if (index !== activeIndex) {
            setActiveIndex(index);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onClose) onClose();
    };

    return (
        <motion.g
            onClick={!isAnySelected ? onClick : isSelected ? () => onClick() : undefined}
            initial={{ opacity: 0, scale: 0, x, y }}
            animate={isSelected ? "selected" : isOthers ? "hidden" : "idle"}
            whileHover={!isAnySelected ? "hover" : undefined}
            variants={{
                idle: { x, y, scale: 1, opacity: 1 },
                selected: { x: 0, y: 0, scale: 4, opacity: 1 },
                hidden: { x, y, scale: 0, opacity: 0 },
                hover: { scale: 1.1 }
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={isOthers ? "pointer-events-none" : "cursor-pointer"}
        >
            {/* Soft Glow Layer */}
            <motion.circle
                r="15"
                fill={color}
                filter="url(#glow)"
                variants={{
                    idle: { opacity: 0.6, scale: 1 },
                    selected: { opacity: 0.8, scale: 1 },
                    hidden: { opacity: 0 },
                    hover: { opacity: 0.9, scale: 1.2 }
                }}
            />

            {/* Core Circle */}
            <circle
                r="15"
                fill={color}
            />

            {/* Label */}
            {!isEditing && (
                <motion.text
                    y={isSelected ? "-5" : "1"}
                    alignmentBaseline="middle"
                    textAnchor="middle"
                    fill="white"
                    fontWeight="500"
                    className="pointer-events-none select-none font-sans"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
                    variants={{
                        idle: { fontSize: "6px", y: 1 },
                        selected: { fontSize: "3px", y: -6 }, // Move up slightly to make room for story
                        hidden: { opacity: 0 },
                        hover: { fontSize: "6px", y: 1 }
                    }}
                >
                    {label}
                </motion.text>
            )}

            {/* Story Text */}
            <foreignObject
                x="-12"
                y="-2"
                width="24"
                height="14"
                className={`overflow-y-auto no-scrollbar snap-y snap-mandatory ${isSelected ? 'pointer-events-auto' : 'pointer-events-none'}`}
                style={{ opacity: isSelected ? 1 : 0, transition: 'opacity 0.5s ease 0.2s' }}
                onScroll={handleScroll}
            >
                <motion.div
                    className="h-full w-full"
                    initial="idle"
                    variants={{
                        idle: { opacity: 0 },
                        selected: { opacity: 1, transition: { delay: 0.3 } },
                        hidden: { opacity: 0 }
                    }}
                >
                    {isEditing ? (
                        <div className="h-full w-full flex flex-col items-center justify-center p-1">
                            <h3 className="text-[1.5px] font-bold text-black mb-1">Share Your Journey</h3>
                            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[1px]">
                                <input
                                    type="text"
                                    placeholder="Title"
                                    className="text-[1.5px] p-[1px] rounded-[1px] text-black outline-none"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                                <select
                                    className="text-[1.5px] p-[1px] rounded-[1px] text-black outline-none"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option>Work</option>
                                    <option>Health</option>
                                    <option>Money</option>
                                    <option>Relationships</option>
                                    <option>Life</option>
                                </select>
                                <textarea
                                    placeholder="Your story..."
                                    className="text-[1.5px] p-[1px] rounded-[1px] text-black outline-none h-4 resize-none"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                                <div className="flex gap-1 justify-center mt-1">
                                    <button type="submit" className="text-[1.5px] bg-black text-white px-2 py-[0.5px] rounded-full font-bold">Share</button>
                                    <button type="button" onClick={onClose} className="text-[1.5px] bg-gray-500 text-white px-2 py-[0.5px] rounded-full">Cancel</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        writeUps && writeUps.length > 0 ? (
                            <>
                                {writeUps.map((section, idx) => (
                                    <div key={idx} className="h-full w-full flex-shrink-0 snap-center flex flex-col items-center justify-center p-1">
                                        <h4 className="text-[1.5px] uppercase tracking-wider text-white/90 font-bold mb-0.5 drop-shadow-md">{section.title}</h4>
                                        <p className="text-[2px] font-bold text-white leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,1)] text-balance text-center">
                                            {section.content}
                                        </p>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center snap-center">
                                <p className="text-[2px] font-medium text-white leading-tight drop-shadow-md text-balance">
                                    {story}
                                </p>
                            </div>
                        )
                    )}
                </motion.div>
            </foreignObject>

            {/* Navigation Dots */}
            {isSelected && writeUps && writeUps.length > 1 && (
                <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {writeUps.map((_, i) => (
                        <circle
                            key={i}
                            cx="13"
                            cy={(i - (writeUps.length - 1) / 2) * 2 + 5}
                            r={activeIndex === i ? 0.6 : 0.4}
                            fill="white"
                            opacity={activeIndex === i ? 1 : 0.4}
                        />
                    ))}
                </motion.g>
            )}
        </motion.g>
    );
};
