
import { useState } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceInterfaceProps {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
}

const VoiceInterface = ({ isActive, setIsActive }: VoiceInterfaceProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  
  const questions = [
    "Tell me about your gaming style. Are you more of a competitive player or do you prefer casual fun?",
    "What's your experience level with Marvel Rivals? Are you new to the game or have you been playing for a while?",
    "How do you prefer to communicate during games? Do you like voice chat or are you more comfortable with text?",
    "What type of gaming partner are you looking for? Someone to learn with, compete with, or just have fun?",
    "When do you usually play? Are you a weekend warrior or do you game during weeknights too?"
  ];

  const handleStartInterview = () => {
    setIsActive(true);
    setCurrentQuestion(0);
    // TODO: Integrate with Gossip Goblin API
    console.log('Starting voice interview with Gossip Goblin');
  };

  const handleStopInterview = () => {
    setIsActive(false);
    console.log('Stopping voice interview');
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsActive(false);
      console.log('Interview completed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        {!isActive ? (
          <Button
            onClick={handleStartInterview}
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3"
          >
            <Mic className="mr-2 h-5 w-5" />
            Start Voice Interview
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <Volume2 className="h-6 w-6 text-teal-400 mr-2" />
                <span className="text-gray-300">Question {currentQuestion + 1} of {questions.length}</span>
              </div>
              <p className="text-white text-lg text-center mb-6">
                {questions[currentQuestion]}
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={handleStopInterview}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <MicOff className="mr-2 h-4 w-4" />
                  Stop Interview
                </Button>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-300">Listening...</span>
                </div>
                <Button
                  onClick={handleNextQuestion}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Next Question
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-400 text-center">
        <p>Powered by Gossip Goblin AI - Your responses help us find better matches</p>
      </div>
    </div>
  );
};

export default VoiceInterface;
