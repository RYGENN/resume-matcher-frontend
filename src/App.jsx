import React, { useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

function App() {
  const [jobFile, setJobFile] = useState(null);
  const [resumeFiles, setResumeFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingJD, setIsUploadingJD] = useState(false);
  const [isUploadingResumes, setIsUploadingResumes] = useState(false);
 
  const uploadJobDescription = async () => {
    try {
      setIsUploadingJD(true);
      const formData = new FormData();
      formData.append('pdf', jobFile);
      await axios.post('http://localhost:5000/upload_job_description', formData);
      alert('Job Description Uploaded!');
    } catch (error) {
      alert('Failed to upload job description!');
    } finally {
      setIsUploadingJD(false);
    }
  };

  const uploadResumes = async () => {
    try {
      setIsUploadingResumes(true);
      const formData = new FormData();
      resumeFiles.forEach(file => formData.append('pdfs', file));
      await axios.post('http://localhost:5000/upload_candidate_resumes', formData);
      alert('Resumes Uploaded!');
    } catch (error) {
      alert('Failed to upload resumes!');
    } finally {
      setIsUploadingResumes(false);
    }
  };

  const calculateRanks = async () => {
    setIsLoading(true);
    const res = await axios.get('http://localhost:5000/calculate_ranks');
    setResults(res.data);
    setIsLoading(false);
  };

  // sorting function 
  const sortedResults = [...results].sort((a, b) =>{
    return  parseFloat(b.score) - parseFloat(a.score);
  });

  return (
    <div className="root w-full min-h-screen p-6 font-sans flex flex-row">
      <div className="section1 w-1/2  bg-white shadow-md rounded-xl p-7 space-y-8">
        <h1 className="text-2xl font-bold text-center text-amber-500">Resume Matcher Tool</h1>

        {/* Upload JD */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Upload Job Description</h2>
          <input 
            type="file" 
            className="cursor-pointer bg-gray-200  rounded mr-4 shadow-inner hover:bg-gray-300 transition duration-200 file:mr-2 file:p-2 file:text-amber-50 file:bg-black" 
            accept="application/pdf" 
            onChange={(e) => setJobFile(e.target.files[0])}
            disabled={isUploadingJD} 
          />

          <button
            onClick={uploadJobDescription}
            disabled={isUploadingJD || !jobFile}
            className={`cursor-pointer px-4 py-2 rounded transition-colors duration-200
              ${isUploadingJD 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'} 
              text-white`}
          >
            {isUploadingJD ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              'Upload JD'
            )}
          </button>
        </div>

        {/* Upload Resumes */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Upload Candidate Resumes</h2>
          <input
            type="file"
            multiple
            accept="application/pdf"
            className='cursor-pointer bg-gray-200 text-gray-800 rounded  mr-4 shadow-inner hover:bg-gray-300 transition duration-200 file:mr-2 file:bg-black file:p-2 file:text-amber-50'
            onChange={(e) => setResumeFiles([...e.target.files])}
            disabled={isUploadingResumes}
          />
          <button
            onClick={uploadResumes}
            disabled={isUploadingResumes || resumeFiles.length === 0}
            className={`cursor-pointer px-4 py-2 rounded transition-colors duration-200
              ${isUploadingResumes 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'} 
              text-white`}
          >
            {isUploadingResumes ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              'Upload Resumes'
            )}
          </button>
        </div>

        {/* Calculate */}
        <div className="text-center">
          <button
            onClick={calculateRanks}
            disabled={isLoading}
            className={`w-full cursor-pointer py-3 px-4 rounded-lg font-medium transition-colors duration-200 
              ${isLoading 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-amber-500 hover:bg-amber-300'} 
              text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
          >
            {isLoading ? 'Calculating...' : 'Calculate Rankings'}
          </button>
        </div>

      
      </div>

      {/* Right Section - Results Display */}
        <div className="w-1/2 ml-2">
          <div className="bg-white p-6 rounded-lg shadow-sm h-[calc(100vh-2rem)]">
            <h2 className="text-2xl font-bold mb-6 text-amber-500">Resume Rankings based on score</h2>
            
            <div className="overflow-y-auto h-[calc(100%-4rem)] pr-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                  <p className="text-indigo-600 font-medium">Calculating Rankings...</p>
                  <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
                </div>
              ) : sortedResults.length > 0 ? (
                <div className="space-y-4 animate-fade-in">
                  {sortedResults.map((res, index) => (
                    <div 
                      key={res.filename}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-gray-500">#{index + 1}</span>
                          <span className="font-medium truncate">{res.filename}</span>
                        </div>
                        <span className={`font-bold whitespace-nowrap px-3 py-1 rounded-full ${
                          parseFloat(res.score) >= 50 
                            ? 'bg-green-100 text-green-700' 
                            : parseFloat(res.score) >= 30 
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {Number(res.score).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium">No results available yet</p>
                  <p className="text-sm">Upload files and calculate rankings to see results</p>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}

export default App;
