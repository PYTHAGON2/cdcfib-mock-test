
import React, { useState, useEffect, useCallback } from 'react';
import { HomePage } from './pages/HomePage';
import { QuizPage } from './pages/QuizPage';
import { ResultPage } from './pages/ResultPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { User, Quiz, QuizAttempt } from './types';
import { DarkModeToggle } from './components/DarkModeToggle';

export type View = 'home' | 'quiz' | 'result' | 'admin';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [user, setUser] = useState<User | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (user.name.toLowerCase() === 'admin') {
      setView('admin');
    } else {
      setView('home');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    setView('home');
  };

  const handleAdminLogin = (password: string) => {
    if (password === 'FUTURE') {
      const adminUser = { name: 'Admin', ip: 'local' };
      setUser(adminUser);
      setView('admin');
    } else {
      alert('Incorrect admin password.');
    }
  };

  const startQuiz = useCallback((quiz: Quiz) => {
    setActiveQuiz(quiz);
    setView('quiz');
  }, []);

  const finishQuiz = useCallback((attempt: QuizAttempt) => {
    setLastAttempt(attempt);
    setView('result');
  }, []);

  const backToHome = useCallback(() => {
    setActiveQuiz(null);
    setLastAttempt(null);
    setView('home');
  }, []);

  const renderView = () => {
    switch (view) {
      case 'quiz':
        return activeQuiz && user ? (
          <QuizPage quiz={activeQuiz} user={user} onFinish={finishQuiz} onBackToHome={backToHome} />
        ) : null;
      case 'result':
        return lastAttempt && user ? (
          <ResultPage attempt={lastAttempt} onRestart={startQuiz} onBackToHome={backToHome} />
        ) : null;
      case 'admin':
        return <AdminDashboard onLogout={handleLogout} />;
      case 'home':
      default:
        return <HomePage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onStartQuiz={startQuiz} user={user} onLogout={handleLogout}/>;
    }
  };

  return (
    <div className="min-h-screen container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-primary-600 dark:text-primary-400 cursor-pointer" onClick={backToHome}>
          CDCFIB MOCK ONLINE TEST
        </h1>
        <DarkModeToggle />
      </header>
      <main>
        {renderView()}
      </main>
       <footer className="text-center mt-12 text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} CDCFIB Mock Test Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
