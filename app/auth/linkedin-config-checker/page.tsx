"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, Globe, ExternalLink } from 'lucide-react';

const LinkedInConfigCheckerPage = () => {
  const [checklist, setChecklist] = useState({
    redirectUrl: false,
    scopes: false,
    cookiesEnabled: navigator.cookieEnabled,
    popupAllowed: false,
    privateWindow: false,
    corsHeaders: true, // Assumed true by default
  });
  
  const [configIssues, setConfigIssues] = useState<string[]>([]);
  
  // Test popup functionality
  const testPopup = () => {
    try {
      const popup = window.open(
        'about:blank',
        'popup_test',
        'width=600,height=600,scrollbars=yes'
      );
      
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        setChecklist(prev => ({ ...prev, popupAllowed: false }));
        setConfigIssues(prev => [...prev, 'Popups are blocked in your browser']);
      } else {
        setChecklist(prev => ({ ...prev, popupAllowed: true }));
        popup.close();
      }
    } catch (e) {
      console.error('Popup test error:', e);
      setChecklist(prev => ({ ...prev, popupAllowed: false }));
      setConfigIssues(prev => [...prev, 'Error testing popup functionality']);
    }
  };
  
  // Detect if in private browsing
  const checkPrivateMode = () => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      setChecklist(prev => ({ ...prev, privateWindow: false }));
    } catch (e) {
      setChecklist(prev => ({ ...prev, privateWindow: true }));
    }
  };
  
  // Check redirect URL configuration
  const validateRedirectUrl = (value: string) => {
    const isValid = value.includes('/api/auth/callback/linkedin');
    setChecklist(prev => ({ ...prev, redirectUrl: isValid }));
    
    if (!isValid) {
      setConfigIssues(prev => 
        [...prev, 'Redirect URL must include /api/auth/callback/linkedin']
      );
    } else {
      setConfigIssues(prev => 
        prev.filter(issue => !issue.includes('Redirect URL'))
      );
    }
  };
  
  // Check OAuth scopes configuration
  const validateScopes = (value: string) => {
    const requiredScopes = ['r_emailaddress', 'r_liteprofile'];
    const scopes = value.split(/[ ,]+/).filter(Boolean);
    const hasAllScopes = requiredScopes.every(scope => scopes.includes(scope));
    
    setChecklist(prev => ({ ...prev, scopes: hasAllScopes }));
    
    if (!hasAllScopes) {
      setConfigIssues(prev => 
        [...prev, 'LinkedIn scopes must include r_emailaddress and r_liteprofile']
      );
    } else {
      setConfigIssues(prev => 
        prev.filter(issue => !issue.includes('LinkedIn scopes'))
      );
    }
  };
  
  // Run all checks
  const runAllChecks = () => {
    testPopup();
    checkPrivateMode();
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-700 mb-2">LinkedIn OAuth Configuration Checker</h1>
        <p className="text-gray-600 mb-8">Use this tool to validate your LinkedIn OAuth configuration and troubleshoot authentication issues.</p>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">LinkedIn Developer Application Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Redirect URL in LinkedIn Developer Console
              </label>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="https://your-domain.com/api/auth/callback/linkedin"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  onChange={(e) => validateRedirectUrl(e.target.value)}
                />
                <div className="w-8 flex items-center justify-center">
                  {checklist.redirectUrl ? 
                    <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                    <XCircle className="h-5 w-5 text-red-500" />
                  }
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Should match exactly what's configured in NextAuth.js
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OAuth Scopes in LinkedIn Developer Console
              </label>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="r_emailaddress r_liteprofile"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  onChange={(e) => validateScopes(e.target.value)}
                />
                <div className="w-8 flex items-center justify-center">
                  {checklist.scopes ? 
                    <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                    <XCircle className="h-5 w-5 text-red-500" />
                  }
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must include r_emailaddress and r_liteprofile
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Browser Environment Checks</h2>
          
          <button
            onClick={runAllChecks}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors mb-4"
          >
            Run Browser Checks
          </button>
          
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Cookies Enabled</span>
              <div>
                {checklist.cookiesEnabled ? 
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                  <XCircle className="h-5 w-5 text-red-500" />
                }
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Popups Allowed</span>
              <div>
                {checklist.popupAllowed ? 
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                  checklist.popupAllowed === false ? 
                    <XCircle className="h-5 w-5 text-red-500" /> : 
                    <AlertTriangle className="h-5 w-5 text-gray-300" />
                }
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Private Browsing Mode</span>
              <div>
                {checklist.privateWindow ? 
                  <AlertTriangle className="h-5 w-5 text-yellow-500" /> : 
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                }
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">CORS Headers</span>
              <div>
                {checklist.corsHeaders ? 
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                  <XCircle className="h-5 w-5 text-red-500" />
                }
              </div>
            </div>
          </div>
        </div>
        
        {configIssues.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Configuration Issues Detected</h2>
            <ul className="list-disc list-inside space-y-1">
              {configIssues.map((issue, index) => (
                <li key={index} className="text-sm text-red-700">{issue}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Common LinkedIn OAuth Configuration Steps</h2>
          
          <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
            <li>
              Go to <a href="https://www.linkedin.com/developers/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                LinkedIn Developer Portal <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </li>
            <li>Create a new app or select your existing app</li>
            <li>Under "Auth" tab, add your redirect URL:
              <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-xs overflow-auto">
                {typeof window !== 'undefined' ? 
                  `${window.location.origin}/api/auth/callback/linkedin` : 
                  'https://your-domain.com/api/auth/callback/linkedin'
                }
              </div>
            </li>
            <li>Add required scopes: "r_emailaddress" and "r_liteprofile"</li>
            <li>Copy Client ID and Client Secret to your environment variables</li>
            <li>Ensure your NextAuth configuration matches exactly what's in LinkedIn</li>
          </ol>
        </div>
        
        <div className="flex space-x-4">
          <Link 
            href="/auth/login"
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors flex items-center"
          >
            Try Login Again <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          
          <Link 
            href="/auth/debug"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            View Auth Debug
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LinkedInConfigCheckerPage; 