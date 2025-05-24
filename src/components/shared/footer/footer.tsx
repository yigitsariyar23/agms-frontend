'use client';

import { useState, useEffect, useRef } from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [showInfo, setShowInfo] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);

    // ESC tuşu ile kapama
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowInfo(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Dışarı tıklanınca kapama
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
                setShowInfo(false);
            }
        };
        if (showInfo) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showInfo]);

    return (
        <>
            <footer className="w-full fixed bottom-0 bg-transparent text-gray-400 py-2 px-4 z-50">
                <p className="text-sm text-center">
                    Automated Graduation Management System © {currentYear}{' '}
                    <button
                        onClick={() => setShowInfo(true)}
                        className="text-black underline hover:text-gray-800 cursor-pointer transition-colors"
                    >
                        AGMS
                    </button>
                    . All rights reserved.

                </p>
            </footer>

            {showInfo && (
                <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
                    <div
                        ref={dialogRef}
                        className="bg-white rounded-lg p-8 max-w-3xl mx-4 max-h-[90vh] overflow-y-auto shadow-lg"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-3xl font-bold text-gray-800">About AGMS</h1>
                            <button
                                onClick={() => setShowInfo(false)}
                                className="text-gray-500 hover:text-gray-700 cursor-pointer text-xl"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                        <p className="mb-4 text-gray-800">
                            The Automated Graduation Management System (AGMS) is a comprehensive digital platform designed to streamline and enhance the graduation process for university students, faculty, and administrative staff. AGMS centralizes all graduation-related activities, including application submission, document tracking, progress monitoring, and communication between students and university departments. By automating routine tasks and providing real-time updates, AGMS reduces administrative workload, minimizes errors, and ensures a transparent and efficient graduation experience. The system is developed as part of a collaborative effort at Izmir Institute of Technology, aiming to modernize academic workflows and support students on their journey to graduation.
                        </p>
                        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Developers</h2>
                        <ul className="list-disc list-inside space-y-1 text-gray-800">
                            <li>Nedret Çiftçi – Frontend Development</li>
                            <li>[Developer Name] – Backend & Database Integration</li>
                            <li>[Developer Name] – UX/UI Design</li>
                        </ul>
                        <p className="mt-8 text-sm text-gray-500">
                            This project is a part of the Graduation Project course at Izmir Institute of Technology.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default Footer;
