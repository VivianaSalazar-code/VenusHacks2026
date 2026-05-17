import React from 'react';

export default function PreconceptionAssessment() {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Preconception Medical Assessment</h2>
      <p className="text-sm text-gray-500 mb-4">
        Interactive questionnaire developed by the Office of the California Surgeon General.
      </p>
      
      {/* Responsive iframe container */}
      <div className="w-full h-[650px] rounded-lg overflow-hidden border border-gray-200">
        <iframe 
          src="https://delfinacare.github.io/preconception-medical-assessment/embed.html" 
          style={{ border: 'none' }} 
          width="100%" 
          height="100%"
          title="Preconception Medical Assessment Quiz"
        />
      </div>
      
      <p className="text-[10px] text-gray-400 mt-3 italic leading-tight">
        Disclaimer: Provided by Delfina Care Inc. Not medical advice. Accessing this does not create a physician-patient relationship.
      </p>
    </div>
  );
}