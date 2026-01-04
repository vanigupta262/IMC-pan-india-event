'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useSubmissionStore } from '@/lib/stores/submission-store';
import { CodeEditor } from '@/components/modules/CodeEditor';
import { SubmissionHistory } from '@/components/modules/SubmissionHistory';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const DEFAULT_CODE = `#include <iostream>
using namespace std;


class TradingStrategy {
public:
    void execute() {
        
        cout << "Trading strategy executed!" << endl;
    }
};

int main() {
    TradingStrategy strategy;
    strategy.execute();
    return 0;
}
`;

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { 
    submissions, 
    activeSubmission, 
    isLoading, 
    fetchSubmissions, 
    createSubmission, 
    activateSubmission 
  } = useSubmissionStore();

  const [currentCode, setCurrentCode] = useState(DEFAULT_CODE);

  useEffect(() => {
    
    if (!user) {
      router.push('/login');
      return;
    }

    
    fetchSubmissions();
  }, [user, router]);

  
  useEffect(() => {
    if (activeSubmission?.code) {
      setCurrentCode(activeSubmission.code);
    }
  }, [activeSubmission]);

  const handleSave = async (code) => {
    const result = await createSubmission(code);
    if (result.success) {
      
      console.log('Submission created successfully');
    }
  };

  const handleSwap = async (submissionId) => {
    const result = await activateSubmission(submissionId);
    if (result.success) {
      
      console.log('Submission activated successfully');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TS</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Trade Simulation</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{user.username}</span>
              </div>
              
              {user.role === 'admin' && (
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin')}
                >
                  Admin Panel
                </Button>
              )}
              
              <Button
                variant="ghost"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          {/* Code Editor - Takes 2 columns */}
          <div className="lg:col-span-2 h-full">
            <CodeEditor
              initialCode={currentCode}
              onSave={handleSave}
              isLoading={isLoading}
            />
          </div>

          {/* Submission History - Takes 1 column */}
          <div className="h-full">
            <SubmissionHistory
              submissions={submissions}
              activeSubmissionId={activeSubmission?.id}
              onSwap={handleSwap}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
