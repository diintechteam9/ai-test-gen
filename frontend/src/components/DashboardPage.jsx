import React, { useState } from 'react'
import { 
  BiBarChartAlt2, 
  BiFile, 
  BiEdit, 
  BiBrain, 
  BiStar,
  BiHelpCircle,
  BiCog,
  BiChevronLeft,
  BiChevronRight,
  BiBell,
  BiUser,
  BiBookOpen,
  BiLogOut,
  BiHome
} from 'react-icons/bi'
import ObjectivePage from './ObjectivePage'

const DashboardPage = () => {
  const [activeItem, setActiveItem] = useState('overview')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const mainNavItems = [
    { id: 'overview', label: 'Dashboard', icon: BiHome },
    { id: 'objective-test', label: 'Create Test', icon: BiFile },
    { id: 'subjective-test', label: 'Subjective Test', icon: BiEdit },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: BiBrain },
    { id: 'Question Bank', label: 'Question Bank', icon: BiBookOpen },
    { id: 'credits', label: 'Credits', icon: BiStar },
  ]

  const bottomNavItems = [
    { id: 'help', label: 'Help Center', icon: BiHelpCircle },
    { id: 'settings', label: 'Settings', icon: BiCog },
    { id: 'logout', label: 'Logout', icon: BiLogOut },
  ]

  const handleNavClick = (itemId) => {
    setActiveItem(itemId)
  }

  // Render content based on active item
  const renderContent = () => {
    switch (activeItem) {
      case 'objective-test':
        return <ObjectivePage />
      case 'overview':
      default:
        return (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BiHome size={32} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome to Dashboard
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Get started by creating your first test or explore the available features.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center mb-3">
                  <BiFile size={24} className="text-blue-600 mr-3" />
                  <h4 className="font-semibold text-blue-800">Create Test</h4>
                </div>
                <p className="text-blue-700 text-sm">Generate objective tests with AI assistance</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <div className="flex items-center mb-3">
                  <BiBrain size={24} className="text-green-600 mr-3" />
                  <h4 className="font-semibold text-green-800">Knowledge Base</h4>
                </div>
                <p className="text-green-700 text-sm">Access educational resources and materials</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center mb-3">
                  <BiBookOpen size={24} className="text-purple-600 mr-3" />
                  <h4 className="font-semibold text-purple-800">Question Bank</h4>
                </div>
                <p className="text-purple-700 text-sm">Browse and manage your question collection</p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <>
      <style>
        {`
          @media print {
            .sidebar, .header, .no-print {
              display: none !important;
            }
            .main-content {
              margin-left: 0 !important;
              width: 100% !important;
            }
          }
        `}
      </style>
      <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`${isSidebarOpen ? 'w-50' : 'w-20'} bg-gradient-to-b from-blue-900 to-blue-800 shadow-xl transition-all duration-300 ease-in-out flex flex-col fixed left-0 top-0 h-full z-50 sidebar`}
      >
        {/* Header */}
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-white mb-1">AI Test Gen</h1>
              
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-blue-700 transition-colors text-white"
            >
              {isSidebarOpen ? <BiChevronLeft size={20} /> : <BiChevronRight size={20} />}
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-6">
          <div className="space-y-2">
            <div className={`${isSidebarOpen ? 'px-2' : 'px-1'}`}>
              <h3 className={`text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3 ${!isSidebarOpen && 'hidden'}`}>
                Main Menu
              </h3>
            </div>
            {mainNavItems.map((item) => {
              const IconComponent = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    activeItem === item.id
                      ? 'bg-white text-blue-700 shadow-lg transform scale-105'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }`}
                >
                  <IconComponent size={20} className={`${isSidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                  {isSidebarOpen && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Bottom Navigation */}
        <div className="px-3 py-4 border-t border-blue-700">
          <div className="space-y-2">
            <div className={`${isSidebarOpen ? 'px-2' : 'px-1'}`}>
              <h3 className={`text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3 ${!isSidebarOpen && 'hidden'}`}>
                Support
              </h3>
            </div>
            {bottomNavItems.map((item) => {
              const IconComponent = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    activeItem === item.id
                      ? 'bg-white text-blue-700 shadow-lg transform scale-105'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }`}
                >
                  <IconComponent size={20} className={`${isSidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                  {isSidebarOpen && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${isSidebarOpen ? 'ml-50' : 'ml-20'} transition-all duration-300 ease-in-out main-content`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 header">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800 capitalize">
              {activeItem.replace('-', ' ')}
            </h2>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <BiBell size={20} />
              </button>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <BiUser size={16} />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
    </>
  )
}

export default DashboardPage
