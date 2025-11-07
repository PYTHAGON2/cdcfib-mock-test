
import React, { useState, useCallback } from 'react';
import { Quiz, QuizAttempt } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { UploadIcon, TrashIcon } from '../components/Icons';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [quizzes, setQuizzes] = useLocalStorage<Quiz[]>('quizzes', []);
  const [attempts, setAttempts] = useLocalStorage<QuizAttempt[]>('quiz-attempts', []);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const newQuizzes = JSON.parse(e.target?.result as string) as Quiz[];
          // simple validation
          if (Array.isArray(newQuizzes) && newQuizzes.every(q => q.title && q.questions)) {
             setQuizzes(prev => [...prev, ...newQuizzes.map(q => ({...q, id: q.id || `${q.title.replace(/\s+/g, '-')}-${Date.now()}`}))]);
             alert(`${newQuizzes.length} quiz(zes) uploaded successfully!`);
          } else {
             alert('Invalid JSON format. Expected an array of quizzes.');
          }
        } catch (error) {
          alert('Failed to parse JSON file.');
          console.error(error);
        }
      };
      reader.readAsText(file);
    }
  };

  const deleteQuiz = useCallback((quizId: string) => {
    if (window.confirm('Are you sure you want to delete this quiz and all its attempts?')) {
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
      setAttempts(prev => prev.filter(a => a.quizId !== quizId));
      if (selectedQuizId === quizId) {
        setSelectedQuizId(null);
      }
    }
  }, [setQuizzes, setAttempts, selectedQuizId]);

  const filteredAttempts = attempts.filter(a => a.quizId === selectedQuizId);

  const getSuspiciousIPs = () => {
      const ipCounts: { [ip: string]: { count: number, names: Set<string> }} = {};
      attempts.forEach(attempt => {
          if (!ipCounts[attempt.ipAddress]) {
              ipCounts[attempt.ipAddress] = { count: 0, names: new Set() };
          }
          ipCounts[attempt.ipAddress].count++;
          ipCounts[attempt.ipAddress].names.add(attempt.userName);
      });
      return Object.entries(ipCounts).filter(([_, data]) => data.count > 3 || data.names.size > 1);
  }

  const suspiciousIPs = getSuspiciousIPs();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <button onClick={onLogout} className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors">
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quiz Management */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Manage Quizzes</h3>
          <label className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-md cursor-pointer hover:bg-primary-700 transition-colors">
            <UploadIcon />
            <span>Upload Quizzes (JSON)</span>
            <input type="file" className="hidden" accept=".json" onChange={handleFileUpload} />
          </label>
          <div className="mt-6 space-y-2 max-h-96 overflow-y-auto">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                <span>{quiz.title}</span>
                <button onClick={() => deleteQuiz(quiz.id)} className="text-red-500 hover:text-red-700">
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* User Attempts */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">View User Attempts</h3>
          <select 
            onChange={e => setSelectedQuizId(e.target.value)} 
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 mb-4"
            value={selectedQuizId || ""}
          >
            <option value="" disabled>Select a quiz to see attempts</option>
            {quizzes.map(quiz => <option key={quiz.id} value={quiz.id}>{quiz.title}</option>)}
          </select>
          <div className="max-h-96 overflow-y-auto">
            {selectedQuizId ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b dark:border-gray-600">
                    <th className="p-2">User</th>
                    <th className="p-2">IP</th>
                    <th className="p-2">Score</th>
                    <th className="p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttempts.map(attempt => (
                    <tr key={attempt.id} className="border-b dark:border-gray-700">
                      <td className="p-2">{attempt.userName}</td>
                      <td className="p-2">{attempt.ipAddress}</td>
                      <td className="p-2">{attempt.score}%</td>
                      <td className="p-2 text-sm">{new Date(attempt.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-center text-gray-500">Please select a quiz.</p>}
          </div>
        </div>
      </div>
      
      {/* Suspicious Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-yellow-500">Suspicious Activity</h3>
             <div className="max-h-64 overflow-y-auto">
                 {suspiciousIPs.length > 0 ? (
                      <ul className="space-y-2">
                         {suspiciousIPs.map(([ip, data]) => (
                             <li key={ip} className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-md">
                                 <p className="font-bold">IP: {ip}</p>
                                 <p>Attempts: {data.count}</p>
                                 <p>Usernames: {Array.from(data.names).join(', ')}</p>
                             </li>
                         ))}
                     </ul>
                 ) : (
                     <p className="text-center text-gray-500">No suspicious activity detected.</p>
                 )}
            </div>
        </div>
    </div>
  );
};
