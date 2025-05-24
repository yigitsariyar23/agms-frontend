import Link from 'next/link';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full fixed bottom-0 bg-transparent text-gray-400 py-2 px-4 z-50">
            <p className="text-sm text-center">
                Automated Graduation Management System © {currentYear}{' '}
                <Link href="/" className="hover:underline">
                    AGMS
                </Link>. All rights reserved.
            </p>
        </footer>
    );
};

export default Footer;
