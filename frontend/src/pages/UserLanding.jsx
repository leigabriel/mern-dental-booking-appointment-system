import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { FaTooth } from "react-icons/fa";

const UserLanding = () => {
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Redirect admin and staff to their dashboards
    if (user && (user.role === "admin" || user.role === "staff")) {
        return (
            <Navigate
                to={user.role === "admin" ? "/admin/dashboard" : "/staff/dashboard"}
                replace
            />
        );
    }

    const handleLogout = () => {
        logout();
        setShowLogoutModal(false);
    };

    return (
        <div className="bg-blue-950">
            {/* Fixed Header Navigation */}
            <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
                <nav
                    aria-label="Global"
                    className="flex items-center justify-center gap-6 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full shadow-xl"
                >
                    <div className="flex lg:flex-1">
                        <Link to="/" className="-m-1.5 p-1.5">
                            <span className="sr-only">DENTALCARE</span>
                            <img
                                src="/dentalcare512x512.png"
                                alt="DENTALCARE Logo"
                                className="h-6 w-auto"
                            />
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex lg:hidden">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-200"
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg
                                className="size-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex lg:gap-x-12">
                        <a
                            href="#hero"
                            className="text-lg/6 font-semibold text-white hover:text-blue-400"
                        >
                            Home
                        </a>
                        <a
                            href="#services"
                            className="text-lg/6 font-semibold text-white hover:text-blue-400"
                        >
                            Services
                        </a>
                        <a
                            href="#about"
                            className="text-lg/6 font-semibold text-white hover:text-blue-400"
                        >
                            About
                        </a>
                        <a
                            href="#blog"
                            className="text-lg/6 font-semibold text-white hover:text-blue-400"
                        >
                            Blog
                        </a>
                        <a
                            href="#contact"
                            className="text-lg/6 font-semibold text-white hover:text-blue-400"
                        >
                            Contact
                        </a>
                        <Link
                            to="/book"
                            className="text-lg/6 font-semibold text-white hover:text-blue-400"
                        >
                            Book Now
                        </Link>
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end relative gap-x-3 items-center whitespace-nowrap">
                        {user ? (
                            <div className="group relative">
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-x-2 text-lg/6 uppercase font-semibold text-white hover:text-blue-400"
                                >
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/128/5393/5393061.png"
                                        alt="Profile"
                                        className="h-6 w-6 rounded-full object-cover invert"
                                    />
                                </Link>
                                <div className="absolute mt-2 w-28 bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-white hover:bg-gray-700 rounded-t-lg"
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => setShowLogoutModal(true)}
                                        className="w-full text-left px-4 py-2 text-white hover:bg-red-700 rounded-b-lg"
                                    >
                                        Log out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="rounded-md bg-white/10 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20 transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/register"
                                    className="rounded-md bg-indigo-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-blue-950 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10">
                            <div className="flex items-center justify-between">
                                <Link to="/" className="-m-1.5 p-1.5">
                                    <span className="sr-only">DENTALCARE</span>
                                    <img
                                        src="/dentalcare512x512.png"
                                        alt="DENTALCARE Logo"
                                        className="h-8 w-auto"
                                    />
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="-m-2.5 rounded-md p-2.5 text-gray-200"
                                >
                                    <span className="sr-only">Close menu</span>
                                    <svg
                                        className="size-8"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18 18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <div className="mt-6 flow-root">
                                <div className="-my-6 divide-y divide-white/10">
                                    <div className="space-y-2 py-6">
                                        <a
                                            href="#services"
                                            className="-mx-3 block rounded-lg px-3 py-2 text-lg/7 font-semibold text-white hover:bg-white/5"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Services
                                        </a>
                                        <a
                                            href="#about"
                                            className="-mx-3 block rounded-lg px-3 py-2 text-lg/7 font-semibold text-white hover:bg-white/5"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            About
                                        </a>
                                        <a
                                            href="#blog"
                                            className="-mx-3 block rounded-lg px-3 py-2 text-lg/7 font-semibold text-white hover:bg-white/5"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Blog
                                        </a>
                                        <a
                                            href="#contact"
                                            className="-mx-3 block rounded-lg px-3 py-2 text-lg/7 font-semibold text-white hover:bg-white/5"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Contact
                                        </a>
                                        <Link
                                            to="/book"
                                            className="-mx-3 block rounded-lg px-3 py-2 text-lg/7 font-semibold text-white hover:bg-white/5"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Book Now
                                        </Link>
                                    </div>
                                    <div className="py-6">
                                        {user ? (
                                            <>
                                                <Link
                                                    to="/profile"
                                                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-white/5"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    Profile ({user.first_name})
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setShowLogoutModal(true);
                                                        setMobileMenuOpen(false);
                                                    }}
                                                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-white/5 w-full text-left"
                                                >
                                                    Log out
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    to="/login"
                                                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-white/5"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    Log in
                                                </Link>
                                                <Link
                                                    to="/register"
                                                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-white/5"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    Register
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <div id="hero" className="bg-blue-950">
                <div className="relative isolate px-6 pt-14 lg:px-8">
                    <div
                        aria-hidden="true"
                        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                    >
                        <div
                            style={{
                                clipPath:
                                    "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                            }}
                            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                        ></div>
                    </div>
                    <div className="mx-auto max-w-8xl py-32 sm:py-48 lg:py-56">
                        <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                            <div className="relative rounded-full px-3 py-1 text-lg text-gray-200 ring-1 ring-white/20 hover:ring-white/50">
                                Welcome to DENTALCARE. We're happy to see you!
                            </div>
                        </div>
                        <div className="text-center">
                            <h1 className="text-balance text-5xl font-bold tracking-tight text-white sm:text-8xl">
                                HEALTHY TEETH,
                                <br />
                                HAPPY LIFE
                            </h1>
                            <p className="mt-8 text-pretty text-lg font-medium text-gray-400 sm:text-xl">
                                Experience world-class dental care in a welcoming environment.
                                Achieve the smile you deserve.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <Link
                                    to={user ? "/book" : "/login"}
                                    className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                >
                                    Book Appointment
                                </Link>
                                <a
                                    href="#about"
                                    className="rounded-md hover:bg-gray-200/20 border border-white/50 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm"
                                >
                                    Learn more <span aria-hidden="true">↓</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div
                        aria-hidden="true"
                        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
                    >
                        <div
                            style={{
                                clipPath:
                                    "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                            }}
                            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                        ></div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div id="about" className="overflow-hidden bg-blue-950 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                        <div className="lg:pt-4 lg:pr-8">
                            <div className="lg:max-w-lg">
                                <h2 className="text-2xl font-semibold text-indigo-400">
                                    About DENTALCARE
                                </h2>
                                <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">
                                    Personalized & High-Quality Care
                                </p>
                                <p className="mt-6 text-xl text-gray-300">
                                    DENTALCARE is dedicated to being your partner in oral health.
                                    Our experienced team utilizes state-of-the-art technology to
                                    deliver comprehensive general, cosmetic, and preventative
                                    care.
                                </p>
                                <dl className="mt-10 max-w-xl space-y-8 text-base text-gray-400 lg:max-w-none">
                                    <div className="relative pl-9">
                                        <dt className="text-xl inline font-semibold text-white">
                                            <svg
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className="absolute top-1 left-1 h-5 w-5 text-indigo-400"
                                            >
                                                <path
                                                    d="M5.5 17a4.5 4.5 0 0 1-1.44-8.765 4.5 4.5 0 0 1 8.302-3.046 3.5 3.5 0 0 1 4.504 4.272A4 4 0 0 1 15 17H5.5Zm3.75-2.75a.75.75 0 0 0 1.5 0V9.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0l-3.25 3.5a.75.75 0 1 0 1.1 1.02l1.95-2.1v4.59Z"
                                                    clipRule="evenodd"
                                                    fillRule="evenodd"
                                                />
                                            </svg>
                                            Our Commitment. <br />
                                        </dt>
                                        <dd className="inline text-lg">
                                            We provide personalized and high-quality dental care in a
                                            welcoming environment, using the latest technology.
                                        </dd>
                                    </div>
                                    <div className="relative pl-9">
                                        <dt className="text-xl inline font-semibold text-white">
                                            <svg
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className="absolute top-1 left-1 h-5 w-5 text-indigo-400"
                                            >
                                                <path
                                                    d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                                                    clipRule="evenodd"
                                                    fillRule="evenodd"
                                                />
                                            </svg>
                                            Years of Service. <br />
                                        </dt>
                                        <dd className="inline text-lg">
                                            Since opening our doors in 2015, we've served thousands of
                                            happy patients, achieving healthy and confident smiles.
                                        </dd>
                                    </div>
                                    <div className="relative pl-9">
                                        <dt className="text-xl inline font-semibold text-white">
                                            <svg
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className="absolute top-1 left-1 h-5 w-5 text-indigo-400"
                                            >
                                                <path d="M4.632 3.533A2 2 0 0 1 6.577 2h6.846a2 2 0 0 1 1.945 1.533l1.976 8.234A3.489 3.489 0 0 0 16 11.5H4c-.476 0-.93.095-1.344.267l1.976-8.234Z" />
                                                <path
                                                    d="M4 13a2 2 0 1 0 0 4h12a2 2 0 1 0 0-4H4Zm11.24 2a.75.75 0 0 1 .75-.75H16a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75h-.01a.75.75 0 0 1-.75-.75V15Zm-2.25-.75a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75H13a.75.75 0 0 0 .75-.75V15a.75.75 0 0 0-.75-.75h-.01Z"
                                                    clipRule="evenodd"
                                                    fillRule="evenodd"
                                                />
                                            </svg>
                                            Our Philosophy. <br />
                                        </dt>
                                        <dd className="inline text-lg">
                                            We prioritize patient education and preventative care
                                            above all else to ensure lasting oral health.
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                        <img
                            src="https://i.pinimg.com/1200x/07/51/32/0751325a4da916d5a0f00555649045ff.jpg"
                            alt="Dental care"
                            className="w-full max-w-none rounded-xl shadow-xl ring-1 ring-white/10 sm:w-228 md:-ml-4 lg:-ml-0"
                        />
                    </div>
                </div>
            </div>

            {/* Services Section */}
            <div
                id="services"
                className="relative isolate overflow-hidden bg-blue-950 px-6 py-24 sm:py-32 lg:overflow-visible lg:px-0"
            >
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <svg
                        aria-hidden="true"
                        className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-500 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
                    >
                        <defs>
                            <pattern
                                id="e813992c-7d03-4cc4-a2bd-151760b470a0"
                                width="200"
                                height="200"
                                x="50%"
                                y="-1"
                                patternUnits="userSpaceOnUse"
                            >
                                <path d="M100 200V.5M.5 .5H200" fill="none" />
                            </pattern>
                        </defs>
                        <svg x="50%" y="-1" className="overflow-visible fill-blue-500/50">
                            <path
                                d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
                                strokeWidth="0"
                            />
                        </svg>
                        <rect
                            width="100%"
                            height="100%"
                            fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)"
                            strokeWidth="0"
                        />
                    </svg>
                </div>

                <div className="relative isolate mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
                    <div className="lg:sticky lg:top-4 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-1 lg:gap-x-8 lg:px-8 lg:overflow-hidden -mt-12 p-12 hidden">
                        <img
                            src="https://i.pinimg.com/1200x/fb/9c/41/fb9c41e93cfea49347d0b3185ef22dfa.jpg"
                            alt="Dental Care"
                            className="w-full max-w-none rounded-xl bg-gray-800 shadow-xl ring-1 ring-white/10 object-cover h-full"
                        />
                    </div>
                    <div className="lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-1 lg:gap-x-8 lg:px-8">
                        <div className="lg:pr-4">
                            <div className="max-w-xl text-base text-gray-400 lg:max-w-lg">
                                <p className="text-4xl font-semibold text-indigo-400">
                                    Our Care
                                </p>
                                <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                                    Comprehensive Dental Services
                                </h1>
                                <p className="mt-6 text-xl text-gray-300">
                                    We offer a wide range of services to meet your dental needs,
                                    from routine checkups to advanced cosmetic procedures, all
                                    delivered with expertise and care.
                                </p>
                                <p className="mt-8 text-lg">
                                    Our commitment is to provide personalized care in a
                                    comfortable environment. We utilize the latest technology to
                                    ensure efficient and effective treatments for all our
                                    patients.
                                </p>
                                <ul role="list" className="mt-8 space-y-8 text-gray-400">
                                    <li className="flex gap-x-3">
                                        <svg
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="mt-1 h-5 w-5 flex-none text-indigo-400"
                                        >
                                            <path d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                                        </svg>
                                        <span className="text-lg">
                                            <strong className="font-semibold text-white text-xl">
                                                Comprehensive Exams & Cleanings. <br />
                                            </strong>{" "}
                                            Regular checkups and professional cleanings are essential
                                            for maintaining optimal oral health and preventing future
                                            problems.
                                        </span>
                                    </li>
                                    <li className="flex gap-x-3">
                                        <svg
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="mt-1 h-5 w-5 flex-none text-indigo-400"
                                        >
                                            <path d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
                                        </svg>
                                        <span className="text-lg">
                                            <strong className="font-semibold text-white text-xl">
                                                Cosmetic Dentistry. <br />
                                            </strong>{" "}
                                            Enhance your smile with services like teeth whitening,
                                            veneers, and bonding for a confident appearance.
                                        </span>
                                    </li>
                                    <li className="flex gap-x-3">
                                        <svg
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="mt-1 h-5 w-5 flex-none text-indigo-400"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-4.75a.75.75 0 001.5 0V8.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="text-lg">
                                            <strong className="font-semibold text-white text-xl">
                                                Restorative Treatments. <br />
                                            </strong>{" "}
                                            We offer fillings, crowns, bridges, root canals, and
                                            extractions to restore function and health to damaged
                                            teeth.
                                        </span>
                                    </li>
                                </ul>
                                <h2 className="mt-16 text-2xl font-bold tracking-tight text-white">
                                    Ready for a healthier smile?
                                </h2>
                                <p className="mt-2 text-xl">
                                    <Link to="/book" className="text-blue-300 underline">
                                        Book your appointment right now!
                                    </Link>{" "}
                                    Use our online system or give us a call. We look forward to
                                    welcoming you to our practice and helping you achieve the
                                    smile you deserve.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Blog Section */}
            <div id="blog" className="bg-blue-950 py-24 sm:py-32">
                <div className="relative isolate mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:mx-0">
                        <h2 className="text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">
                            From the DENTALCARE Blog
                        </h2>
                        <p className="mt-2 text-lg text-gray-300">
                            Learn how to care for your smile with our expert advice.
                        </p>
                    </div>
                    <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-400 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {/* Blog Post 1 */}
                        <article className="flex max-w-xl flex-col items-start justify-between">
                            <div className="flex items-center gap-x-4 text-xs">
                                <time dateTime="2025-03-16" className="text-gray-400">
                                    Mar 16, 2025
                                </time>
                                <span className="relative z-10 rounded-full bg-yellow-200 px-3 py-1.5 font-medium text-gray-900">
                                    General Health
                                </span>
                            </div>
                            <div className="group relative grow">
                                <h3 className="mt-3 text-lg font-semibold text-white group-hover:text-gray-300">
                                    <a href="#blog">
                                        <span className="absolute inset-0"></span>The Importance of
                                        Regular Checkups
                                    </a>
                                </h3>
                                <p className="mt-5 line-clamp-3 text-sm text-gray-400">
                                    Preventative care is key. Regular visits help catch issues
                                    early, saving you time, money, and discomfort. Don't wait for
                                    a problem to arise!
                                </p>
                            </div>
                            <div className="relative mt-8 flex items-center gap-x-4">
                                <img
                                    src="https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                    alt=""
                                    className="h-10 w-10 rounded-full bg-gray-800"
                                />
                                <div className="text-sm">
                                    <p className="font-semibold text-white">Dr. Michael Foster</p>
                                    <p className="text-gray-400">Orthodontist</p>
                                </div>
                            </div>
                        </article>

                        {/* Blog Post 2 */}
                        <article className="flex max-w-xl flex-col items-start justify-between">
                            <div className="flex items-center gap-x-4 text-xs">
                                <time dateTime="2025-03-10" className="text-gray-400">
                                    Mar 10, 2025
                                </time>
                                <span className="relative z-10 rounded-full bg-purple-700 px-3 py-1.5 font-medium text-gray-200">
                                    Cosmetic
                                </span>
                            </div>
                            <div className="group relative grow">
                                <h3 className="mt-3 text-lg font-semibold text-white group-hover:text-gray-300">
                                    <a href="#blog">
                                        <span className="absolute inset-0"></span>How Teeth
                                        Whitening Can Boost Your Confidence
                                    </a>
                                </h3>
                                <p className="mt-5 line-clamp-3 text-sm text-gray-400">
                                    A brighter smile can make a huge difference in your
                                    self-esteem. Learn about our safe and effective in-office
                                    whitening treatments.
                                </p>
                            </div>
                            <div className="relative mt-8 flex items-center gap-x-4">
                                <img
                                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                    alt=""
                                    className="h-10 w-10 rounded-full bg-gray-800"
                                />
                                <div className="text-sm">
                                    <p className="font-semibold text-white">Dr. Lindsay Walton</p>
                                    <p className="text-gray-400">Pediatric Dentist</p>
                                </div>
                            </div>
                        </article>

                        {/* Blog Post 3 */}
                        <article className="flex max-w-xl flex-col items-start justify-between">
                            <div className="flex items-center gap-x-4 text-xs">
                                <time dateTime="2025-02-12" className="text-gray-400">
                                    Feb 12, 2025
                                </time>
                                <span className="relative z-10 rounded-full bg-green-600 px-3 py-1.5 font-medium text-gray-200">
                                    Nutrition
                                </span>
                            </div>
                            <div className="group relative grow">
                                <h3 className="mt-3 text-lg font-semibold text-white group-hover:text-gray-300">
                                    <a href="#blog">
                                        <span className="absolute inset-0"></span>Foods to Eat (and
                                        Avoid) for a Healthy Smile
                                    </a>
                                </h3>
                                <p className="mt-5 line-clamp-3 text-sm text-gray-400">
                                    Did you know your diet directly impacts your oral health?
                                    Learn which foods to embrace and which to avoid for stronger
                                    teeth and gums.
                                </p>
                            </div>
                            <div className="relative mt-8 flex items-center gap-x-4">
                                <img
                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                    alt=""
                                    className="h-10 w-10 rounded-full bg-gray-800"
                                />
                                <div className="text-sm">
                                    <p className="font-semibold text-white">Dr. Tom Cook</p>
                                    <p className="text-gray-400">Clinic Director</p>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            </div>

            {/* Partners Section */}
            <div className="bg-blue-950 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <h2 className="text-center text-lg font-semibold text-white">
                        Our Health Partners
                    </h2>
                    <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
                        <img
                            src="https://images.seeklogo.com/logo-png/43/2/colgate-new-logo-png_seeklogo-439471.png"
                            alt="Colgate"
                            className="col-span-2 max-h-40 w-full object-contain lg:col-span-1"
                        />
                        <img
                            src="https://images.seeklogo.com/logo-png/10/2/oral-b-logo-png_seeklogo-103851.png"
                            alt="Oral-B"
                            className="col-span-2 max-h-40 w-full object-contain lg:col-span-1"
                        />
                        <img
                            src="https://images.seeklogo.com/logo-png/10/2/philips-logo-png_seeklogo-108446.png"
                            alt="Philips"
                            className="col-span-2 max-h-40 w-full object-contain lg:col-span-1"
                        />
                        <img
                            src="https://1000logos.net/wp-content/uploads/2020/08/Crest-Logo-500x281.png"
                            alt="Crest"
                            className="col-span-2 max-h-40 w-full object-contain sm:col-start-2 lg:col-span-1"
                        />
                        <img
                            src="https://images.seeklogo.com/logo-png/50/2/sensodyne-logo-png_seeklogo-506390.png"
                            alt="Sensodyne"
                            className="col-span-2 col-start-2 max-h-60 w-full object-contain sm:col-start-auto lg:col-span-1"
                        />
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div id="team" className="bg-blue-950 py-24 sm:py-32">
                <div className="relative isolate mx-auto grid max-w-7xl gap-20 px-6 lg:px-8 xl:grid-cols-3">
                    <div className="max-w-xl">
                        <h2 className="text-3xl font-semibold tracking-tight text-pretty text-white sm:text-4xl">
                            Meet our Dentist
                        </h2>
                        <p className="mt-6 text-lg text-gray-400">
                            We're a dynamic group of individuals who are passionate about what
                            we do and dedicated to delivering the best results for our
                            clients.
                        </p>
                    </div>
                    <ul
                        role="list"
                        className="grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2"
                    >
                        <li>
                            <div className="flex items-center gap-x-6">
                                <img
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                    alt=""
                                    className="h-16 w-16 rounded-full outline-1 -outline-offset-1 outline-white/10"
                                />
                                <div>
                                    <h3 className="text-base font-semibold tracking-tight text-white">
                                        Dr. Leslie Alexander
                                    </h3>
                                    <p className="text-sm font-semibold text-indigo-400">
                                        General Dentist
                                    </p>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center gap-x-6">
                                <img
                                    src="https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                    alt=""
                                    className="h-16 w-16 rounded-full outline-1 -outline-offset-1 outline-white/10"
                                />
                                <div>
                                    <h3 className="text-base font-semibold tracking-tight text-white">
                                        Dr. Michael Foster
                                    </h3>
                                    <p className="text-sm font-semibold text-indigo-400">
                                        Orthodontist
                                    </p>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center gap-x-6">
                                <img
                                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                    alt=""
                                    className="h-16 w-16 rounded-full outline-1 -outline-offset-1 outline-white/10"
                                />
                                <div>
                                    <h3 className="text-base font-semibold tracking-tight text-white">
                                        Dr. Dries Vincent
                                    </h3>
                                    <p className="text-sm font-semibold text-indigo-400">
                                        Prosthodontist
                                    </p>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center gap-x-6">
                                <img
                                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                    alt=""
                                    className="h-16 w-16 rounded-full outline-1 -outline-offset-1 outline-white/10"
                                />
                                <div>
                                    <h3 className="text-base font-semibold tracking-tight text-white">
                                        Dr. Lindsay Walton
                                    </h3>
                                    <p className="text-sm font-semibold text-indigo-400">
                                        Pediatric Dentist
                                    </p>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center gap-x-6">
                                <img
                                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                    alt=""
                                    className="h-16 w-16 rounded-full outline-1 -outline-offset-1 outline-white/10"
                                />
                                <div>
                                    <h3 className="text-base font-semibold tracking-tight text-white">
                                        Courtney Henry
                                    </h3>
                                    <p className="text-sm font-semibold text-indigo-400">
                                        Lead Hygienist
                                    </p>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center gap-x-6">
                                <img
                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                    alt=""
                                    className="h-16 w-16 rounded-full outline-1 -outline-offset-1 outline-white/10"
                                />
                                <div>
                                    <h3 className="text-base font-semibold tracking-tight text-white">
                                        Tom Cook
                                    </h3>
                                    <p className="text-sm font-semibold text-indigo-400">
                                        Clinic Director
                                    </p>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Contact Section */}
            <div id="contact" className="bg-blue-950 py-24 sm:py-32">
                <div className="relative isolate mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <form className="w-full max-w-xl mx-auto bg-white/5 backdrop-blur-sm p-10 rounded-md shadow-2xl ring-1 ring-white/10">
                            <h1 className="text-3xl font-bold text-white mb-8 text-center">
                                Contact Us
                            </h1>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label
                                        htmlFor="first-name"
                                        className="block text-sm font-semibold text-white mb-2"
                                    >
                                        First name
                                    </label>
                                    <input
                                        id="first-name"
                                        type="text"
                                        name="first-name"
                                        required
                                        className="block w-full rounded-md bg-white/10 px-3.5 py-2 text-base text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="last-name"
                                        className="block text-sm font-semibold text-white mb-2"
                                    >
                                        Last name
                                    </label>
                                    <input
                                        id="last-name"
                                        type="text"
                                        name="last-name"
                                        required
                                        className="block w-full rounded-md bg-white/10 px-3.5 py-2 text-base text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-semibold text-white mb-2"
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        className="block w-full rounded-md bg-white/10 px-3.5 py-2 text-base text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="phone-number"
                                        className="block text-sm font-semibold text-white mb-2"
                                    >
                                        Phone number (Optional)
                                    </label>
                                    <input
                                        id="phone-number"
                                        type="tel"
                                        name="phone-number"
                                        placeholder="(555) 123-4567"
                                        className="block w-full rounded-md bg-white/10 px-3.5 py-2 text-base text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label
                                        htmlFor="message"
                                        className="block text-sm font-semibold text-white mb-2"
                                    >
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="4"
                                        required
                                        className="block w-full rounded-md bg-white/10 px-3.5 py-2 text-base text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="mt-10">
                                <button
                                    type="submit"
                                    className="block w-full rounded-md bg-indigo-500 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-md hover:bg-indigo-400 transition"
                                >
                                    Send Message
                                </button>
                            </div>
                        </form>

                        <div className="flex flex-col justify-center items-center text-center lg:text-left lg:items-start">
                            <h2 className="text-4xl font-bold text-white mb-6">
                                Our Location
                            </h2>
                            <div className="w-full h-[400px] rounded-2xl overflow-hidden ring-2 ring-white/10 shadow-2xl bg-gradient-to-br from-blue-800 to-blue-700">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.0!2d121.1778!3d13.4070!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDI0JzI1LjIiTiAxMjHCsDEwJzQwLjEiRQ!5e0!3m2!1sen!2sph!4v1234567890"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                ></iframe>
                            </div>
                            <p className="mt-8 text-xl text-gray-200 max-w-xl">
                                Visit our dental clinic or reach out to us for appointments,
                                inquiries, and feedback.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-[#212631]/40 rounded-t-4xl border-t border-white/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-gray-200/10 pb-10">
                        <div className="space-y-4">
                            <h3 className="text-4xl font-bold text-white">DENTALCARE</h3>
                            <p className="text-sm text-gray-300">
                                Committed to providing personalized and high-quality dental care
                                in a comfortable and welcoming environment.
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-300">
                                <svg
                                    className="w-5 h-5 text-indigo-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.717 21 3 14.283 3 6V5z"
                                    ></path>
                                </svg>
                                <span className="font-mono">0963-405-5941</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-white">
                                Quick Links
                            </h4>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <a
                                        href="#about"
                                        className="text-gray-300 hover:text-white transition"
                                    >
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#services"
                                        className="text-gray-300 hover:text-white transition"
                                    >
                                        Our Services
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#contact"
                                        className="text-gray-300 hover:text-white transition"
                                    >
                                        Find Us
                                    </a>
                                </li>
                                <li>
                                    <Link
                                        to="/book"
                                        className="text-gray-300 hover:text-white transition"
                                    >
                                        Book
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-white">
                                Patient Center
                            </h4>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <Link
                                        to="/book"
                                        className="text-gray-300 hover:text-white transition"
                                    >
                                        Book Appointment
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/login"
                                        className="text-gray-300 hover:text-white transition"
                                    >
                                        Patient Login
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-300 hover:text-white transition"
                                    >
                                        FAQs
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-300 hover:text-white transition"
                                    >
                                        Privacy Policy
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-white">
                                Location & Hours
                            </h4>
                            <address className="space-y-3 text-sm not-italic">
                                <p className="text-gray-300">Naujan, Oriental Mindoro, 5204</p>
                                <p className="text-gray-300">Mon - Fri: 8:00 AM - 5:00 PM</p>
                                <p className="text-gray-300">Sat: 8:00 AM - 21:00 PM</p>
                            </address>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
                        <p>
                            &copy; {new Date().getFullYear()} DENTALCARE. All rights reserved.
                        </p>
                        <div className="flex space-x-4 mt-4 md:mt-0">
                            <a
                                href="#"
                                className="text-gray-400 hover:text-indigo-400 transition"
                            >
                                <img
                                    src="https://cdn-icons-png.flaticon.com/128/174/174855.png"
                                    alt="Instagram"
                                    className="w-6 h-6 rounded-md"
                                />
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-indigo-400 transition"
                            >
                                <img
                                    src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png"
                                    alt="Facebook"
                                    className="w-6 h-6 rounded-md"
                                />
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-indigo-400 transition"
                            >
                                <img
                                    src="https://cdn-icons-png.flaticon.com/128/5968/5968830.png"
                                    alt="Twitter"
                                    className="w-6 h-6 rounded-md invert"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="relative w-96 h-64 border-2 border-white duration-500 group overflow-hidden rounded-xl bg-neutral-900 text-neutral-50 p-6 flex flex-col justify-evenly shadow-xl">
                        <div className="absolute blur duration-500 group-hover:blur-none w-72 h-72 rounded-full group-hover:translate-x-10 group-hover:translate-y-10 bg-red-900 right-1 -bottom-24"></div>
                        <div className="absolute blur duration-500 group-hover:blur-none w-12 h-12 rounded-full group-hover:translate-x-8 group-hover:translate-y-2 bg-rose-700 right-12 bottom-12"></div>
                        <div className="absolute blur duration-500 group-hover:blur-none w-36 h-36 rounded-full group-hover:translate-x-10 group-hover:-translate-y-10 bg-rose-800 right-1 -top-12"></div>
                        <div className="absolute blur duration-500 group-hover:blur-none w-24 h-24 bg-red-700 rounded-full group-hover:-translate-x-10"></div>

                        <div className="z-10 flex flex-col justify-evenly h-full text-center">
                            <h3 className="text-2xl font-bold mb-1">Confirm Logout</h3>
                            <p className="text-sm text-gray-300 mb-4">
                                Are you sure you want to end your current session?
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="hover:bg-neutral-200 cursor-pointer bg-neutral-50 rounded text-neutral-800 font-semibold w-full sm:w-1/2 py-2 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 cursor-pointer hover:bg-red-500 text-white rounded font-semibold w-full sm:w-1/2 py-2 transition"
                                >
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserLanding;