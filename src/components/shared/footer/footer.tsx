'use client';

import { useState, useEffect, useRef } from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [showInfo, setShowInfo] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowInfo(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

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
            <footer className="w-full absolute bottom-0 bg-transparent text-gray-400 pt-2 pb-2 px-4 z-50">
                <p className="text-sm text-center">
                    Automated Graduation Management System © {currentYear}{' '}
                    <button
                        onClick={() => setShowInfo(true)}
                        className="text-black underline hover:text-gray-800 cursor-pointer transition-colors"
                    >
                        AGMS
                    </button>
                    . All rights reserved.
                    Licensed under the{' '}
                    <a
                        href="https://opensource.org/licenses/MIT"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-gray-600"
                    >
                        MIT License
                    </a>.
                </p>
            </footer>

            {showInfo && (
                <div className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            ref={dialogRef}
                            className="relative w-full max-w-3xl bg-white rounded-lg shadow-lg animate-in slide-in-from-bottom-2 duration-200"
                        >
                            <div className="p-8 max-h-[80vh] overflow-y-auto">
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
                                    <li>Yiğit Sarıyar - Project Manager</li>
                                    <li>Ahmet Kerem Şaylı - Frontend Development</li>
                                    <li>Meric Kelemeden - Quality Assurance and Backend Development</li>
                                    <li>Nedret Çiftçi – Frontend Development</li>
                                    <li>Necla Akyol – Quality Assurance and Backend Development</li>
                                    <li>Oğulcan Küçükbıyıklar - Devops and Backend Development</li>
                                    <li>Kaan Cesur - Frontend Development</li>
                                </ul>
                                <p className="mt-8 text-sm text-gray-500">
                                    This project is a part of the "Project Management" and "Software Engineering" courses at Izmir Institute of Technology.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Footer;
