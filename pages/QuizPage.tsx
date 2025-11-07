
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Quiz, User, Question, UserAnswer, QuestionType } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { shuffleArray, formatTime } from '../utils/helpers';

interface QuizPageProps {
  quiz: Quiz;
  user: User;
  onFinish: (attempt: any) => void;
  onBackToHome: () => void;
}

const QuestionDisplay: React.FC<{ question: Question; userAnswer: string | string[] | null; onAnswer: (answer: string | string[]) => void }> = ({ question, userAnswer, onAnswer }) => {
    switch(question.type) {
        case QuestionType.MultipleChoice:
            return (
                <div className="space-y-3">
                    {question.options?.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => onAnswer(option)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${userAnswer === option ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-primary-100 dark:hover:bg-gray-600'}`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            );
        case QuestionType.TrueFalse:
            return (
                <div className="flex space-x-4">
                    {['True', 'False'].map(option => (
                        <button
                            key={option}
                            onClick={() => onAnswer(option)}
                            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${userAnswer === option ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-primary-100 dark:hover:bg-gray-600'}`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            );
        case QuestionType.FillInTheBlank:
            return (
                <input
                    type="text"
                    value={typeof userAnswer === 'string' ? userAnswer : ''}
                    onChange={(e) => onAnswer(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Type your answer here"
                />
            );
        default:
            return <p>Unsupported question type.</p>;
    }
};

export const QuizPage: React.FC<QuizPageProps> = ({ quiz, user, onFinish, onBackToHome }) => {
  const [questions] = useState(() => shuffleArray(quiz.questions).slice(0, quiz.questionsToSelect));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [quizState, setQuizState] = useLocalStorage(`quiz-state-${user.name}-${quiz.id}`, {
      answers: Array(questions.length).fill(null).map((_, i) => ({ questionId: questions[i].id, answer: null })),
      timeLeft: quiz.timer.type === 'total' ? quiz.timer.duration : quiz.timer.duration,
  });
  
  const { answers, timeLeft } = quizState;

  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = answers[currentQuestionIndex]?.answer;
  
  const handleAnswer = (answer: string | string[]) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = { questionId: currentQuestion.id, answer };
    setQuizState(prev => ({ ...prev, answers: newAnswers }));
  };

  const submitQuiz = useCallback(() => {
    let correctCount = 0;
    let wrongCount = 0;
    
    questions.forEach((q, index) => {
        const userAnswer = answers[index].answer;
        if (userAnswer) {
             if (Array.isArray(q.correctAnswer)) {
                if (Array.isArray(userAnswer) && q.correctAnswer.length === userAnswer.length && q.correctAnswer.every(val => userAnswer.includes(val))) {
                    correctCount++;
                } else {
                    wrongCount++;
                }
            } else {
                if (String(userAnswer).toLowerCase() === String(q.correctAnswer).toLowerCase()) {
                    correctCount++;
                } else {
                    wrongCount++;
                }
            }
        }
    });

    const unansweredCount = answers.filter(a => a.answer === null).length;

    const attempt: any = {
      id: `${quiz.id}-${user.name}-${Date.now()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      userName: user.name,
      ipAddress: user.ip,
      score: Math.round((correctCount / questions.length) * 100),
      totalCorrect: correctCount,
      totalWrong: wrongCount + (unansweredCount),
      totalUnanswered: unansweredCount,
      timestamp: Date.now(),
      answers,
      questions, // Add questions to attempt for review
    };
    
    const allAttempts = JSON.parse(localStorage.getItem('quiz-attempts') || '[]');
    localStorage.setItem('quiz-attempts', JSON.stringify([...allAttempts, attempt]));
    localStorage.removeItem(`quiz-state-${user.name}-${quiz.id}`);

    onFinish(attempt);
  }, [questions, answers, quiz.id, quiz.title, user.name, user.ip, onFinish]);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      if (quiz.timer.type === 'total') {
        submitQuiz();
      } else {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setQuizState(prev => ({ ...prev, timeLeft: quiz.timer.duration }));
        } else {
          submitQuiz();
        }
      }
      return;
    }

    const timerId = setInterval(() => {
      setQuizState(prev => ({...prev, timeLeft: prev.timeLeft - 1}));
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, quiz.timer, currentQuestionIndex, questions.length, setQuizState, submitQuiz]);

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      if(quiz.timer.type === 'per-question') setQuizState(prev => ({...prev, timeLeft: quiz.timer.duration}));
    }
  };

  const goToPrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{quiz.title}</h2>
        <div className="text-lg font-semibold bg-red-500 text-white px-4 py-1 rounded-md">
          {formatTime(timeLeft)}
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-6">
        <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Question {currentQuestionIndex + 1} of {questions.length}</h3>
        <p className="text-xl mb-6">{currentQuestion.questionText}</p>
        <QuestionDisplay question={currentQuestion} userAnswer={userAnswer} onAnswer={handleAnswer} />
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={goToPrev} disabled={currentQuestionIndex === 0} className="px-6 py-2 bg-gray-300 dark:bg-gray-600 rounded-md disabled:opacity-50">Previous</button>
        {currentQuestionIndex === questions.length - 1 ? (
          <button onClick={submitQuiz} className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Submit Quiz</button>
        ) : (
          <button onClick={goToNext} className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Next</button>
        )}
      </div>

      <div className="mt-8 text-center">
          <button onClick={onBackToHome} className="text-sm text-gray-500 hover:underline">Exit Quiz</button>
      </div>
    </div>
  );
};
