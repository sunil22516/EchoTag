import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RegisterItem from './components/RegisterItem';
import ScanQR from './components/ScanQR';
import ReportFound from './components/ReportFound';
import UserRegistration from './components/UserRegistration';
import UserProfile from './components/UserProfile';
import { auth } from './services/api';

import QrCodeIcon from './assets/icons/qr-code.svg';
import LogoIcon from './assets/icons/logo.png';
import AlertCircleIcon from './assets/icons/alert-circle.svg';
import SearchIcon from './assets/icons/search.svg';
import UploadIcon from './assets/icons/upload.svg';
import UserCircleIcon from './assets/icons/user-circle.svg';
import UserPlusIcon from './assets/icons/user-plus.svg';

interface User {
  name: string;
  email: string;
  picture?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await auth.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      setUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center">
                  <img src={LogoIcon} alt="QR Code" className="h-10 w-10 text-indigo-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">EchoTag</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/register" className="text-gray-700 hover:text-indigo-600">Register Item</Link>
                <Link to="/scan" className="text-gray-700 hover:text-indigo-600">Scan QR</Link>
                <Link to="/report" className="text-gray-700 hover:text-indigo-600">Report Found</Link>
                
                {loading ? (
                  <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                ) : user ? (
                  <UserProfile user={user} onLogout={handleLogout} />
                ) : (
                  <>
                    <button 
                      onClick={handleSignIn}
                      className="flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      <img src={UserCircleIcon} alt="User Circle" className="h-5 w-5 mr-2" />
                      Sign In
                    </button>
                    <Link 
                      to="/signup"
                      className="flex items-center px-4 py-2 rounded-md bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
                    >
                      <img src={UserPlusIcon} alt="User Plus" className="h-5 w-5 mr-2" />
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/register" element={<RegisterItem />} />
          <Route path="/scan" element={<ScanQR />} />
          <Route path="/report" element={<ReportFound />} />
          <Route path="/signup" element={<UserRegistration />} />
          <Route path="/" element={
            <>
              {/* Hero Section */}
              <div className="relative bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                  <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                    <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                      <div className="sm:text-center lg:text-left">
                        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                          <span className="block xl:inline">Never lose your</span>
                          <span className="block text-indigo-600 xl:inline"> valuables again</span>
                        </h1>
                        <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                          Register your items with QR codes, making it easy for honest people to return them if lost. Simple, secure, and efficient.
                        </p>
                        <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                          <div className="rounded-md shadow">
                            <Link to="/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
                              <img src={UploadIcon} alt="Upload" className="h-5 w-5 mr-2" />
                              Register Item
                            </Link>
                          </div>
                          <div className="mt-3 sm:mt-0 sm:ml-3">
                            <Link to="/scan" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10">
                              <img src={SearchIcon} alt="Search" className="h-5 w-5 mr-2" />
                              Scan QR Code
                            </Link>
                          </div>
                        </div>
                      </div>
                    </main>
                  </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                  <img className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80" alt="QR code scanning" />
                </div>
              </div>

              {/* Features */}
              <div className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="lg:text-center">
                    <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                      A better way to protect your belongings
                    </p>
                  </div>

                  <div className="mt-10">
                    <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                      <div className="relative">
                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                          <img src={QrCodeIcon} alt="QR Code" className="h-6 w-6" />
                        </div>
                        <p className="ml-16 text-lg leading-6 font-medium text-gray-900">QR Code Generation</p>
                        <p className="mt-2 ml-16 text-base text-gray-500">
                          Generate unique QR codes for your items that link to your contact information.
                        </p>
                      </div>

                      <div className="relative">
                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                          <img src={AlertCircleIcon} alt="Alert Circle" className="h-6 w-6" />
                        </div>
                        <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Instant Notifications</p>
                        <p className="mt-2 ml-16 text-base text-gray-500">
                          Receive immediate notifications when someone scans your lost item.
                        </p>
                      </div>

                      <div className="relative">
                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                          <img src={UserCircleIcon} alt="User Circle" className="h-6 w-6" />
                        </div>
                        <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Secure Authentication</p>
                        <p className="mt-2 ml-16 text-base text-gray-500">
                          Sign in securely with your account to manage your items.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;