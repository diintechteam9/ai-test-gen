import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import EditPage from './EditPage';
import MDEditor from '@uiw/react-md-editor';

const ObjectiveQuestion = ({ testData, onBack }) => {
  const [questions, setQuestions] = useState([])
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [questionForms, setQuestionForms] = useState([
    {
      id: Date.now(),
      questionText: '',
      options: ['', '', '', ''],
      solution: '',
      level: 'Easy',
      positiveMarks: 1,
      negativeMarks: 0
    }
  ])
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [aiQuestionCount, setAiQuestionCount] = useState(1)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiSubject, setAiSubject] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const [questionOrder, setQuestionOrder] = useState({})
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [generatedStories, setGeneratedStories] = useState({})
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [generatedAudios, setGeneratedAudios] = useState({})
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false)
  const [generatedPrompts, setGeneratedPrompts] = useState({})

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown-container')) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleGenerateQuestion = () => {
    setShowQuestionForm(true)
    // Add a new form when generating question
    const newForm = {
      id: Date.now(),
      questionText: '',
      options: ['', '', '', ''],
      solution: '',
      level: 'Easy',
      positiveMarks: 1,
      negativeMarks: 0
    }
    setQuestionForms([newForm])
  }

  const handleBackToQuestions = () => {
    setShowQuestionForm(false)
    // Add the form data to questions when done
    if (questionForms.length > 0 && questionForms[0].questionText.trim()) {
      const newQuestion = {
        id: Date.now(),
        questionText: questionForms[0].questionText,
        options: questionForms[0].options,
        solution: questionForms[0].solution,
        level: questionForms[0].level,
        positiveMarks: questionForms[0].positiveMarks,
        negativeMarks: questionForms[0].negativeMarks
      }
      setQuestions(prev => [newQuestion, ...prev])
      
      // Set default order number for the new question
      const newOrderNumber = questions.length + 1;
      setQuestionOrder(prev => ({
        ...prev,
        [newQuestion.id]: newOrderNumber
      }));
    }
  }

  const handleOptionChange = (formId, index, value) => {
    setQuestionForms(prev => prev.map(form => 
      form.id === formId 
        ? { ...form, options: form.options.map((opt, i) => i === index ? value : opt) }
        : form
    ))
  }

  const handleInputChange = (formId, e) => {
    const { name, value } = e.target
    setQuestionForms(prev => prev.map(form => 
      form.id === formId 
        ? { ...form, [name]: value }
        : form
    ))
  }

  const handleAIGenerateClick = () => {
    setIsAIModalOpen(true)
  }

  const handleAIGenerateSubmit = async () => {
    try {
      setIsGenerating(true);

      const response = await fetch(`${API_BASE_URL}/api/question/generate-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          questionCount: aiQuestionCount,
          subject: aiSubject
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      
      if (data.success && data.questions) {
        // Add generated questions to the questions list
        const newQuestions = data.questions.map((question, index) => ({
          id: Date.now() + index,
          questionText: question.questionText,
          options: question.options,
          solution: question.solution
        }));
        
        setQuestions(prev => [...prev, ...newQuestions]);
        
        // Set default order numbers for generated questions
        const currentQuestionCount = questions.length;
        const newOrderNumbers = {};
        newQuestions.forEach((question, index) => {
          newOrderNumbers[question.id] = currentQuestionCount + index + 1;
        });
        setQuestionOrder(prev => ({
          ...prev,
          ...newOrderNumbers
        }));
        
        // Remove the success alert
        // alert(`Successfully generated ${data.count} questions!`);
      } else {
        throw new Error('No questions generated');
      }
      
      setIsAIModalOpen(false);
      setAiQuestionCount(1);
      setAiPrompt('');
      setAiSubject('');
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  const handleAIModalClose = () => {
    setIsAIModalOpen(false)
    setAiQuestionCount(1)
    setAiPrompt('')
    setAiSubject('')
  }

  const handleEditClick = (question) => {
    setEditingQuestion(question)
    setIsEditMode(true)
  }

  const handleBackFromEdit = (updatedQuestionForms) => {
    setIsEditMode(false)
    
    // If updated forms are provided, update the question in the list
    if (updatedQuestionForms && updatedQuestionForms.length > 0 && editingQuestion) {
      const updatedForm = updatedQuestionForms[0]
      
      // Check if any changes were made
      const hasChanges = 
        updatedForm.questionText !== editingQuestion.questionText ||
        JSON.stringify(updatedForm.options) !== JSON.stringify(editingQuestion.options) ||
        updatedForm.solution !== editingQuestion.solution ||
        updatedForm.level !== editingQuestion.level ||
        updatedForm.positiveMarks !== editingQuestion.positiveMarks ||
        updatedForm.negativeMarks !== editingQuestion.negativeMarks
      
      if (hasChanges) {
        setQuestions(prev => prev.map(question => 
          question.id === editingQuestion.id 
            ? {
                ...question,
                questionText: updatedForm.questionText,
                options: updatedForm.options,
                solution: updatedForm.solution,
                level: updatedForm.level,
                positiveMarks: updatedForm.positiveMarks,
                negativeMarks: updatedForm.negativeMarks
              }
            : question
        ))
      }
    }
    
    setEditingQuestion(null)
  }

  const handlePrintClick = () => {
    if (questions.length === 0) {
      alert('No questions to print. Please add some questions first.');
      return;
    }
    
    // Initialize all questions as selected
    setSelectedQuestions(questions.map(q => q.id));
    setIsPrintModalOpen(true);
  }

  const handlePrintModalClose = () => {
    setIsPrintModalOpen(false);
    setSelectedQuestions([]);
  }

  const handleQuestionSelection = (questionId, isSelected) => {
    if (isSelected) {
      setSelectedQuestions(prev => [...prev, questionId]);
    } else {
      setSelectedQuestions(prev => prev.filter(id => id !== questionId));
    }
  }

  const handleSelectAll = () => {
    setSelectedQuestions(questions.map(q => q.id));
  }

  const handleDeselectAll = () => {
    setSelectedQuestions([]);
  }

  const handleGeneratePDF = () => {
    if (selectedQuestions.length === 0) {
      alert('Please select at least one question to print.');
      return;
    }

    // Show preview page
    setIsPreviewOpen(true);
    setIsPrintModalOpen(false);
  }

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  }

  const handleOrderChange = (questionId, newOrder) => {
    setQuestionOrder(prev => ({
      ...prev,
      [questionId]: newOrder
    }));
  }

  const handleGenerateStory = async (question) => {
    try {
      setIsGeneratingStory(true);
      
      const response = await fetch(`${API_BASE_URL}/api/story/generate-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.questionText,
          options: question.options,
          solution: question.solution
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate story');
      }

      const data = await response.json();
      
      if (data.storyScript) {
        setGeneratedStories(prev => ({
          ...prev,
          [question.id]: data.storyScript
        }));
      } else {
        throw new Error('No story generated');
      }
      
    } catch (error) {
      console.error('Error generating story:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setIsGeneratingStory(false);
    }
  }

  const handleGenerateAudio = async (questionId, storyText) => {
    try {
      setIsGeneratingAudio(true);
      
      const response = await fetch(`${API_BASE_URL}/api/tts/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: storyText,
          format: 'base64'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const data = await response.json();
      
      if (data.success && data.audio) {
        setGeneratedAudios(prev => ({
          ...prev,
          [questionId]: data.audio
        }));
      } else {
        throw new Error('No audio generated');
      }
      
    } catch (error) {
      console.error('Error generating audio:', error);
      alert('Failed to generate audio. Please try again.');
    } finally {
      setIsGeneratingAudio(false);
    }
  }

  const handleGeneratePrompts = async (questionId, storyText) => {
    try {
      setIsGeneratingPrompts(true);
      
      const response = await fetch(`${API_BASE_URL}/api/prompt/generate-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyScript: storyText
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompts');
      }

      const prompts = await response.json();
      
      if (Array.isArray(prompts) && prompts.length > 0) {
        setGeneratedPrompts(prev => ({
          ...prev,
          [questionId]: prompts
        }));
      } else {
        throw new Error('No prompts generated');
      }
      
    } catch (error) {
      console.error('Error generating prompts:', error);
      alert('Failed to generate prompts. Please try again.');
    } finally {
      setIsGeneratingPrompts(false);
    }
  }

  const handlePlayAudio = (audioBase64) => {
    try {
      // Convert base64 to audio blob (browser-compatible method)
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play audio
      const audio = new Audio(audioUrl);
      audio.play();
      
      // Clean up URL after playing
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error('Error playing audio:', error);
      alert('Failed to play audio. Please try again.');
    }
  }

  const getSortedQuestions = () => {
    return questions.sort((a, b) => {
      const orderA = questionOrder[a.id] || 0;
      const orderB = questionOrder[b.id] || 0;
      return orderA - orderB;
    });
  }

  // If preview is open, show the preview page
  if (isPreviewOpen) {
    const selectedQuestionsData = getSortedQuestions().filter(q => selectedQuestions.includes(q.id));
    
    return (
      <div className="min-h-screen bg-gray-50">
        <style jsx global>{`
          @media print {
            @page {
              margin: 0;
              size: A4;
            }
            
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            /* Hide any browser-added content */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* Hide dropdown menu and 3 dots button during printing */
            .no-print {
              display: none !important;
            }
            
            /* Hide order input during printing */
            .order-input {
              display: none !important;
            }
          }
        `}</style>
        {/* Header */}
        <div className=" px-6 py-1 print-header">
          <div className="flex justify-between items-center">
            <button 
              onClick={handleClosePreview}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Back to Questions
            </button>
            <div className="flex-1 flex justify-center">
              <div>
                <p className="text-gray-600 text-2xl">Preview your question paper</p>
              </div>
            </div>
            <div className="w-32"></div> {/* Spacer to balance the layout */}
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 print-content">
              <style jsx>{`
                @media print {
                  .print-header { display: none !important; }
                  .print-content { 
                    padding: 0 !important; 
                    margin: 0 !important;
                    box-shadow: none !important;
                    border-radius: 0 !important;
                  }
                  body { 
                    margin: 0 !important; 
                    padding: 0 !important;
                  }
                  .print-button { display: none !important; }
                  
                  /* Hide question card styling when printing */
                  .print-question-card {
                    border: none !important;
                    border-radius: 0 !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    background: none !important;
                    box-shadow: none !important;
                  }
                  
                  /* Reduce font sizes for printing */
                  .print-question-card .text-gray-700 {
                    font-size: 12px !important;
                  }
                  
                  .print-question-card .text-gray-600 {
                    font-size: 11px !important;
                  }
                  
                  .print-question-card .text-green-800 {
                    font-size: 11px !important;
                  }
                  
                  .print-question-card .text-sm {
                    font-size: 10px !important;
                  }
                  
                  .print-question-card .text-xs {
                    font-size: 9px !important;
                  }
                  
                  /* Hide browser default headers and footers */
                  @page {
                    margin: 0;
                    size: A4;
                  }
                  
                  /* Hide any browser-added content */
                  html, body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                  
                  /* Ensure no browser headers/footers */
                  @media print {
                    * {
                      -webkit-print-color-adjust: exact !important;
                      print-color-adjust: exact !important;
                    }
                  }
                }
              `}</style>
              {/* Paper Header */}
              <div className="text-center mb-4">
                <h2 className="text-3xl font-bold text-gray-900 mb-5">{testData?.name || 'Question Paper'}</h2>
              </div>

              {/* Questions in 2 columns */}
              <div className="grid grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-3">
                  {selectedQuestionsData.slice(0, 4).map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4 print-question-card">
                      <div className="flex items-start space-x-3 mb-3">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                          {questionOrder[question.id] || (index + 1)}
                        </span>
                        <div className="flex-1">
                          <div className="text-gray-700 mb-3">
                            <div data-color-mode="light">
                              <MDEditor.Markdown 
                                source={question.questionText} 
                                style={{ backgroundColor: 'transparent' }}
                              />
                            </div>
                          </div>
                          
                          {/* Options */}
                          <div className="space-y-2 mb-3">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-2">
                                <span className="w-5 h-5 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                                <span className="text-gray-600 text-sm">{option}</span>
                              </div>
                            ))}
                          </div>

                          {/* Solution */}
                          {question.solution && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 w-full">
                              <div className="flex items-center">
                                <span className="text-sm font-semibold text-green-800 mr-2 flex-shrink-0">Solution:</span>
                                <div className="flex-1" data-color-mode="light">
                                  <MDEditor.Markdown 
                                    source={question.solution} 
                                    style={{ backgroundColor: 'transparent' }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {selectedQuestionsData.slice(4, 8).map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4 print-question-card">
                      <div className="flex items-start space-x-3 mb-3">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                          {questionOrder[question.id] || (index + 5)}
                        </span>
                        <div className="flex-1">
                          <div className="text-gray-700 mb-3">
                            <div data-color-mode="light">
                              <MDEditor.Markdown 
                                source={question.questionText} 
                                style={{ backgroundColor: 'transparent' }}
                              />
                            </div>
                          </div>
                          
                          {/* Options */}
                          <div className="space-y-2 mb-3">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-2">
                                <span className="w-5 h-5 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                                <span className="text-gray-600 text-sm">{option}</span>
                              </div>
                            ))}
                          </div>

                          {/* Solution */}
                          {question.solution && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 w-full">
                              <div className="flex items-center">
                                <span className="text-sm font-semibold text-green-800 mr-2 flex-shrink-0">Solution:</span>
                                <div className="flex-1" data-color-mode="light">
                                  <MDEditor.Markdown 
                                    source={question.solution} 
                                    style={{ backgroundColor: 'transparent' }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Print Button */}
              <div className="flex justify-center mt-8 print-button">
                <button
                  onClick={() => window.print()}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print Question Paper</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If in edit mode, show GeneratePage with the question data
  if (isEditMode && editingQuestion) {
    const questionForm = {
      id: editingQuestion.id,
      questionText: editingQuestion.questionText,
      options: editingQuestion.options,
      solution: editingQuestion.solution,
      level: editingQuestion.level || 'Easy',
      positiveMarks: editingQuestion.positiveMarks || 1,
      negativeMarks: editingQuestion.negativeMarks || 0
    }
    
    return (
      <EditPage 
        testData={testData} 
        onBack={handleBackFromEdit}
        initialQuestionForms={[questionForm]}
      />
    )
  }

  // If question form is open, show the form
  if (showQuestionForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="px-6 py-1">
          <div className="flex justify-between items-center">
            <button 
              onClick={handleBackToQuestions}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Back to Questions
            </button>
            <div className="flex-1 flex justify-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{testData?.name || 'Add Question'}</h1>
              
              </div>
            </div>
            <div className="w-32"></div> {/* Spacer to balance the layout */}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-80px)]">
          {/* Question Form Section */}
          <div className="w-full bg-white p-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                {/* Form Header */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Add Question</h2>
                </div>
                
                {questionForms.map((form, formIndex) => (
                  <div key={form.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-base font-medium text-gray-900">Question {formIndex + 1}</h3>
                    </div>
                    
                    <form id={`questionForm${form.id}`} className="space-y-3">
                      {/* Question Text */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Text *
                        </label>
                        <textarea
                          value={form.questionText}
                          onChange={(e) => handleInputChange(form.id, { target: { name: 'questionText', value: e.target.value } })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                          rows={2}
                          placeholder="Enter your question here..."
                        />
                      </div>

                      {/* Options */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Options *
                        </label>
                        <div className="space-y-2">
                          {form.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(form.id, index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Solution */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Solution
                        </label>
                        <textarea
                          value={form.solution}
                          onChange={(e) => handleInputChange(form.id, { target: { name: 'solution', value: e.target.value } })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                          rows={1}
                          placeholder="Enter the solution or explanation..."
                        />
                      </div>

                      {/* Metadata Fields */}
                      <div className="grid grid-cols-3 gap-3">
                        {/* Level */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Level
                          </label>
                          <select
                            value={form.level}
                            onChange={(e) => handleInputChange(form.id, { target: { name: 'level', value: e.target.value } })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>

                        {/* Positive Marks */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Positive Marks
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={form.positiveMarks}
                            onChange={(e) => handleInputChange(form.id, { target: { name: 'positiveMarks', value: parseInt(e.target.value) || 0 } })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="1"
                          />
                        </div>

                        {/* Negative Marks */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Negative Marks
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={form.negativeMarks}
                            onChange={(e) => handleInputChange(form.id, { target: { name: 'negativeMarks', value: parseInt(e.target.value) || 0 } })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                ))}
                
                {/* Done Button */}
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={handleBackToQuestions}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Done</span>
                  </button>
                </div>
              </div>
            </div>
                  </div>
      </div>
    </div>
  )
}

  return (
    <div className="min-h-screen bg-gray-50">
            {/* Header */}
      <div className=" px-6 py-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Back to Tests
            </button>
            
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handlePrintClick}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print</span>
            </button>
            <button
              onClick={handleAIGenerateClick}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>AI Generate</span>
            </button>
            <button
              onClick={handleGenerateQuestion}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>
                Add Question</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {questions.length === 0 ? (
            // No questions state
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="mb-6">
                <svg className="w-24 h-24 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">No Questions Yet</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                You haven't added any questions to this test yet. Click the "Generate Question" button to get started.
              </p>
              <button
                onClick={handleGenerateQuestion}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center space-x-2 mx-auto"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Generate Your First Question</span>
              </button>
            </div>
          ) : (
            // Questions list (when there are questions)
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Questions</h2>
              {getSortedQuestions().map((question, index) => (
                <div key={question.id} className="flex items-start space-x-4">
                  {/* Question Card */}
                  <div className="bg-white rounded-lg shadow-sm p-4 max-w-2xl flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <label className="text-xs font-medium text-gray-700">Order:</label>
                          <input
                            type="number"
                            min="1"
                            value={questionOrder[question.id] || (index + 1)}
                            onChange={(e) => handleOrderChange(question.id, parseInt(e.target.value) || 1)}
                            className="w-12 px-1 py-0.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 order-input"
                          />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900">Question {index + 1}</h3>
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleEditClick(question)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800 font-medium text-xs transition-colors duration-200">
                          Delete
                        </button>
                        <div className="relative dropdown-container">
                          <button
                            onClick={() => setDropdownOpen(dropdownOpen === question.id ? null : question.id)}
                            className="text-gray-600 hover:text-gray-800 font-medium text-xs transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          
                          {/* Dropdown Menu */}
                          {dropdownOpen === question.id && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10 no-print">
                              <div className="p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Question Metadata</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Level:</span>
                                    <span className="text-sm font-medium text-gray-900">{question.level || 'Easy'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Positive Marks:</span>
                                    <span className="text-sm font-medium text-gray-900">{question.positiveMarks || 1}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Negative Marks:</span>
                                    <span className="text-sm font-medium text-gray-900">{question.negativeMarks || 0}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-700 mb-3 text-sm">
                      <div data-color-mode="light">
                        <MDEditor.Markdown 
                          source={question.questionText} 
                          style={{ backgroundColor: 'transparent' }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1 mb-3">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2">
                          <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span className="text-gray-700 text-sm">{option}</span>
                        </div>
                      ))}
                    </div>
                    {question.solution && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <h4 className="text-xs font-semibold text-green-800 mb-1">Solution:</h4>
                        <div data-color-mode="light">
                          <MDEditor.Markdown 
                            source={question.solution} 
                            style={{ backgroundColor: 'transparent' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Story Button - Outside the card */}
                  <div className="flex flex-col space-y-2 no-print">
                    <button
                      onClick={() => handleGenerateStory(question)}
                      disabled={isGeneratingStory}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md flex items-center space-x-2 ${
                        isGeneratingStory 
                          ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {isGeneratingStory ? (
                        <>
                          <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span>Story</span>
                        </>
                      )}
                    </button>
                    
                    {/* Generate Audio Button - Next to Story button */}
                    {generatedStories[question.id] && (
                      <button
                        onClick={() => handleGenerateAudio(question.id, generatedStories[question.id])}
                        disabled={isGeneratingAudio}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md flex items-center space-x-2 ${
                          isGeneratingAudio 
                            ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isGeneratingAudio ? (
                          <>
                            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                            <span>Audio</span>
                          </>
                        )}
                      </button>
                    )}
                    
                    {/* Play Audio Button - Appears after audio is generated */}
                    {generatedAudios[question.id] && (
                      <button
                        onClick={() => handlePlayAudio(generatedAudios[question.id])}
                        className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Play</span>
                      </button>
                    )}
                    
                    {/* Generate Prompts Button - Next to Audio button */}
                    {generatedStories[question.id] && (
                      <button
                        onClick={() => handleGeneratePrompts(question.id, generatedStories[question.id])}
                        disabled={isGeneratingPrompts}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md flex items-center space-x-2 ${
                          isGeneratingPrompts
                            ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                            : 'bg-orange-600 hover:bg-orange-700 text-white'
                        }`}
                      >
                        {isGeneratingPrompts ? (
                          <>
                            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Prompts</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Generated Story Display */}
                  {generatedStories[question.id] && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md no-print">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">Generated Story:</h4>
                      <p className="text-sm text-blue-700 leading-relaxed">
                        {generatedStories[question.id]}
                      </p>
                    </div>
                  )}
                  
                  {/* Generated Prompts Display */}
                  {generatedPrompts[question.id] && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-md no-print">
                      <h4 className="text-sm font-semibold text-orange-800 mb-2">Generated Image Prompts:</h4>
                      <div className="space-y-2">
                        {generatedPrompts[question.id].map((prompt, index) => (
                          <div key={index} className="text-sm text-orange-700">
                            <span className="font-medium">Prompt {prompt.number}:</span>
                            <p className="mt-1 leading-relaxed">{prompt.prompt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Generate Modal */}
      {isAIModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Generate Questions with AI</h3>
              <button
                onClick={handleAIModalClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What type of questions do you want?
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 resize-none"
                  rows={4}
                  placeholder="Describe the type of questions you want to generate (e.g., math problems, history facts, science concepts, etc.)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={aiSubject}
                  onChange={(e) => setAiSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                  placeholder="Enter the subject (e.g., Mathematics, Science, History, English, etc.)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions to Generate
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={aiQuestionCount}
                  onChange={(e) => setAiQuestionCount(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                  placeholder="Enter number of questions"
                  disabled={isGenerating}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAIGenerateSubmit}
                disabled={isGenerating || !aiPrompt.trim()}
                className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg ${
                  isGenerating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generating...</span>
                  </div>
                ) : (
                  'Generate'
                )}
              </button>
              <button
                onClick={handleAIModalClose}
                disabled={isGenerating}
                className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                  isGenerating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Select Questions to Print</h3>
              <button
                onClick={handlePrintModalClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Selection Controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600">
                {selectedQuestions.length} of {questions.length} questions selected
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  Select All
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  Deselect All
                </button>
              </div>
            </div>
            
            {/* Questions List */}
            <div className="space-y-4 mb-6">
              {questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(question.id)}
                      onChange={(e) => handleQuestionSelection(question.id, e.target.checked)}
                      className="mt-1 w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">Question {index + 1}</h4>
                      </div>
                      <div className="text-gray-700 mb-3">
                        <div data-color-mode="light">
                          <MDEditor.Markdown 
                            source={question.questionText} 
                            style={{ backgroundColor: 'transparent' }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1 mb-3">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-3 text-sm">
                            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className="text-gray-600">{option}</span>
                          </div>
                        ))}
                      </div>
                      {question.solution && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <h5 className="text-sm font-semibold text-green-800 mb-1">Solution:</h5>
                          <div data-color-mode="light">
                            <MDEditor.Markdown 
                              source={question.solution} 
                              style={{ backgroundColor: 'transparent'  }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleGeneratePDF}
                disabled={selectedQuestions.length === 0}
                className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg ${
                  selectedQuestions.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                Generate PDF
              </button>
              <button
                onClick={handlePrintModalClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ObjectiveQuestion
