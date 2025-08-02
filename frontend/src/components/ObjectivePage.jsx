import React, { useState, useEffect } from 'react'
import PrintPage from './PrintPage'
import { API_BASE_URL } from '../config'

const FirstPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingTest, setEditingTest] = useState(null)
  const [selectedTest, setSelectedTest] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTests, setIsLoadingTests] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    coverimage: '',
    tags: '',
    category: ''
  })
  const [submittedTests, setSubmittedTests] = useState([])

  // Helper function to format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Fetch all tests from backend when component mounts
  useEffect(() => {
    fetchAllTests()
  }, [])

  const fetchAllTests = async () => {
    try {
      setIsLoadingTests(true)
      const response = await fetch(`${API_BASE_URL}/api/test/all-test`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch tests')
      }
      
      const tests = await response.json()
      
      // Transform the data to match our frontend structure
      const transformedTests = tests.map(test => ({
        ...test,
        id: test._id,
        createdAt: test.createdAt ? formatDateTime(test.createdAt) : formatDateTime(new Date()),
        time: test.duration ? test.duration.replace(' minutes', '') : '30' // Extract minutes for display
      }))
      
      setSubmittedTests(transformedTests)
    } catch (err) {
      console.error('Error fetching tests:', err)
      setError('Failed to load tests. Please refresh the page.')
    } finally {
      setIsLoadingTests(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Prepare the data for the backend
      const testData = {
        name: formData.name,
        duration: `${formData.duration} minutes`,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        coverimage: formData.coverimage || 'https://via.placeholder.com/300x200?text=Test+Cover'
      }

      const response = await fetch(`${API_BASE_URL}/api/test/generate-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create test')
      }

      const createdTest = await response.json()
      
      // Add the created test to the local state
    const newTest = {
        ...createdTest,
        id: createdTest._id,
        createdAt: formatDateTime(new Date()),
        time: formData.duration // Keep the original time format for display
      }
      
    setSubmittedTests(prev => [newTest, ...prev])
      
      // Reset form and close modal
    setIsFormOpen(false)
    setFormData({
      name: '',
        duration: '',
        coverimage: '',
      tags: '',
      category: ''
    })
      
      console.log('Test created successfully:', createdTest)
    } catch (err) {
      console.error('Error creating test:', err)
      setError(err.message || 'Failed to create test. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setIsFormOpen(false)
    setError('')
    setFormData({
      name: '',
      duration: '',
      coverimage: '',
      tags: '',
      category: ''
    })
  }

  const handleTestClick = (test) => {
    setSelectedTest(test)
  }

  const handleBackToTests = () => {
    setSelectedTest(null)
  }

  // Delete test function
  const deleteTest = async (testId, testName) => {
    if (!window.confirm(`Are you sure you want to delete "${testName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/test/delete-test/${testId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete test')
      }

      // Remove the test from local state
      setSubmittedTests(prev => prev.filter(test => test.id !== testId))
      
      console.log('Test deleted successfully')
    } catch (err) {
      console.error('Error deleting test:', err)
      setError(err.message || 'Failed to delete test. Please try again.')
    }
  }

  // Edit test function
  const handleEditClick = (test, e) => {
    e.stopPropagation(); // Prevent card click
    setEditingTest(test)
    setFormData({
      name: test.name,
      duration: test.time || test.duration?.replace(' minutes', '') || '',
      coverimage: test.coverimage || '',
      tags: test.tags ? test.tags.join(', ') : '',
      category: test.category || ''
    })
    setIsEditOpen(true)
  }

  const updateTest = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Prepare the data for the backend
      const testData = {
        name: formData.name,
        duration: `${formData.duration} minutes`,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        coverimage: formData.coverimage || 'https://via.placeholder.com/300x200?text=Test+Cover'
      }

      const response = await fetch(`${API_BASE_URL}/api/test/update-test/${editingTest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update test')
      }

      const updatedTest = await response.json()
      
      // Update the test in local state
      setSubmittedTests(prev => prev.map(test => 
        test.id === editingTest.id 
          ? {
              ...updatedTest,
              id: updatedTest._id,
              createdAt: formatDateTime(updatedTest.createdAt),
              time: formData.duration
            }
          : test
      ))
      
      // Close edit modal and reset
      setIsEditOpen(false)
      setEditingTest(null)
      setFormData({
        name: '',
        duration: '',
        coverimage: '',
        tags: '',
        category: ''
      })
      
      console.log('Test updated successfully:', updatedTest)
    } catch (err) {
      console.error('Error updating test:', err)
      setError(err.message || 'Failed to update test. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseEdit = () => {
    setIsEditOpen(false)
    setEditingTest(null)
    setError('')
    setFormData({
      name: '',
      duration: '',
      coverimage: '',
      tags: '',
      category: ''
    })
  }

  // If a test is selected, show the ObjectiveQuestion page
  if (selectedTest) {
    return <PrintPage testData={selectedTest} onBack={handleBackToTests} />
  }

  return (
          <div className="min-h-screen bg-gray-50 relative">
        {/* Header with Create Test Button */}
        <div className=" px-6 py-2">
          <div className="flex justify-end">
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Create Test
            </button>
          </div>
        </div>
  
        {/* Main Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Loading State */}
          {isLoadingTests && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <svg className="animate-spin w-16 h-16 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Tests...</h3>
                <p className="text-gray-600">Please wait while we fetch your tests.</p>
              </div>
            </div>
          )}
          
          {/* Error State */}
          {!isLoadingTests && error && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Tests</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={fetchAllTests}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          {/* Submitted Tests Cards */}
          {!isLoadingTests && !error && submittedTests.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Your Tests ({submittedTests.length})</h3>
                <button
                  onClick={fetchAllTests}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                >
                  Refresh
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {submittedTests.map((test) => (
                  <div 
                    key={test.id} 
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    onClick={() => handleTestClick(test)}
                  >
                    {/* Card Header with Image */}
                    <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600">
                      {test.coverimage ? (
                        <img 
                          src={test.coverimage} 
                          alt={test.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="bg-white/90 text-gray-800 px-1.5 py-0.5 rounded-full text-xs font-medium">
                          {test.time || test.duration} min
                        </span>
                      </div>
                    </div>
                    
                    {/* Card Body */}
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{test.name}</h4>
                      
                      <div className="flex items-center mb-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {test.category}
                        </span>
                      </div>
                      
                      {test.tags && test.tags.length > 0 && (
                        <div className="mb-2">
                          <div className="flex flex-wrap gap-1">
                            {test.tags.slice(0, 2).map((tag, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                              >
                                {tag}
                              </span>
                            ))}
                            {test.tags.length > 2 && (
                              <span className="text-xs text-gray-500">+{test.tags.length - 2} more</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        <span>{test.createdAt}</span>
                        </div>
                        <div className="flex space-x-1">
                          <button 
                            onClick={(e) => handleEditClick(test, e)}
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              deleteTest(test.id, test.name);
                            }}
                            className="text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingTests && !error && submittedTests.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tests Found</h3>
                <p className="text-gray-600 mb-6">You haven't created any tests yet. Click the "Create Test" button to get started.</p>
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Create Your First Test
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Test</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Test Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Test Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter test name"
                />
              </div>

              {/* Time Duration and Category Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (min) *
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select category</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="science">Science</option>
                    <option value="english">English</option>
                    <option value="history">History</option>
                    <option value="geography">Geography</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="general-knowledge">General Knowledge</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label htmlFor="coverimage" className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image
                </label>
                <div className="space-y-2">
                  {/* File Upload Option */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Upload from device:</label>
                  <input
                    type="file"
                      id="coverImageFile"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setFormData(prev => ({
                            ...prev,
                              coverimage: e.target.result
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  </div>
                  
                  {/* Image Preview */}
                  {formData.coverimage && (
                    <div className="mt-2">
                      <img 
                        src={formData.coverimage} 
                        alt="Cover preview" 
                        className="w-24 h-24 object-cover rounded-md border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Test'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal Overlay */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Test</h2>
              <button
                onClick={handleCloseEdit}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Modal Body */}
            <form onSubmit={updateTest} className="p-4 space-y-4">
              {/* Test Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Test Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter test name"
                />
              </div>

              {/* Time Duration and Category Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (min) *
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select category</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="science">Science</option>
                    <option value="english">English</option>
                    <option value="history">History</option>
                    <option value="geography">Geography</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="general-knowledge">General Knowledge</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label htmlFor="coverimage" className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image
                </label>
                <div className="space-y-2">
                  {/* File Upload Option */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Upload from device:</label>
                    <input
                      type="file"
                      id="coverImageFile"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setFormData(prev => ({
                              ...prev,
                              coverimage: e.target.result
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  
                  {/* Image Preview */}
                  {formData.coverimage && (
                    <div className="mt-2">
                      <img 
                        src={formData.coverimage} 
                        alt="Cover preview" 
                        className="w-24 h-24 object-cover rounded-md border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update Test'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FirstPage
