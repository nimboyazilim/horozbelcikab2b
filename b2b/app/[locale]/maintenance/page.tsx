import Image from "next/image";
import notFoundImage from '@/public/assets/horoz-electric-logo-2.png';

export default function MaintenancePage() {

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Logo */}
                <div className="mb-8">
                    <Image 
                        src={notFoundImage} 
                        alt="Horoz Electric Logo" 
                        width={200} 
                        height={62}
                        className="mx-auto"
                    />
                </div>

                {/* Bakım İkonu */}
                <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                        <svg 
                            className="w-10 h-10 text-orange-600" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                            />
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                            />
                        </svg>
                    </div>
                </div>

                {/* Başlık */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Maintenance Mode
                </h1>

                {/* Açıklama */}
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Our system is currently under maintenance. Our services will be available again shortly.
                </p>

                {/* Bilgi Kutusu */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">What's Happening?</p>
                            <p>We are updating our system to provide better service. All your data is safe during this process.</p>
                        </div>
                    </div>
                </div>

                {/* Geri Sayım (Opsiyonel) */}
                <div className="mb-8">
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <p className="text-sm text-gray-500 mb-2">Estimated Time</p>
                        <div className="text-2xl font-bold text-gray-900">
                            48 hours
                        </div>
                    </div>
                </div>

                {/* İletişim Bilgileri */}
                <div className="text-sm text-gray-500">
                    <p>Contact us for emergencies:</p>
                    <p className="mt-1">
                        <a 
                            href="mailto:info@horozelectric.ro" 
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            info@horozeurope.com
                        </a>
                    </p>
                </div>

                {/* Yenile Butonu */}
                <div className="mt-8">
                    <a 
                        href="/"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 inline-block"
                    >
                        Return to Home Page
                    </a>
                </div>
            </div>
        </div>
    );
}
