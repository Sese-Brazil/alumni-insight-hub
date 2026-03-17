import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Save, CheckCircle2, Loader2, Edit2, Bell, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

// API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Question {
  id: number;
  category_id: number;
  text: string;
  type: 'text' | 'select' | 'dropdown' | 'checkbox' | 'scale' | 'number' | 'radio';
  required: boolean;
  options?: string[];
  scale_min?: number;
  scale_max?: number;
  order_index: number;
  version: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  order_index: number;
  questions: Question[];
}

interface SurveyResponse {
  question_id: number;
  answer_text?: string;
  answer_options?: string[];
  answer_number?: number;
}

interface PreviousSubmission {
  id: number;
  survey_version: number;
  completed_at: string;
  answers: {
    question_id: number;
    question_text: string;
    question_type: string;
    answer_text?: string;
    answer_options?: string[];
    answer_number?: number;
  }[];
}

export default function AlumniSurvey() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showReview, setShowReview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [notifyOnNewVersion, setNotifyOnNewVersion] = useState(false);
  const [previousSubmission, setPreviousSubmission] = useState<PreviousSubmission | null>(null);
  const [showPreviousDialog, setShowPreviousDialog] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [surveyVersion, setSurveyVersion] = useState<number>(1);
  const [collegeId, setCollegeId] = useState<number | null>(null);

  // Get token from storage
  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Check if user has already submitted
  const checkPreviousSubmission = async () => {
    if (!user?.username) return;
    
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/alumni/survey/status/${user.username}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.completed) {
          setSubmitted(true);
          // Fetch the previous submission details
          const submissionsResponse = await fetch(`${API_URL}/alumni/survey/responses/${user.username}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (submissionsResponse.ok) {
            const submissions = await submissionsResponse.json();
            if (submissions.length > 0) {
              setPreviousSubmission(submissions[0]);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking submission status:', error);
    }
  };

  // Fetch user's college and survey
  useEffect(() => {
    const fetchUserCollege = async () => {
      if (!user?.username) return;
      
      try {
        const token = getToken();
        
        // Check if already submitted
        await checkPreviousSubmission();
        
        // If already submitted, we don't need to fetch the survey
        if (submitted) {
          setLoading(false);
          return;
        }
        
        // First get user's program to determine college
        const profileResponse = await fetch(`${API_URL}/alumni/profile/${user.username}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          const userCollegeId = profileData.college_id;
          setCollegeId(userCollegeId);

          // Then fetch the active survey for this college
          if (userCollegeId) {
            const surveyResponse = await fetch(`${API_URL}/alumni/survey/college/${userCollegeId}`);
            
            if (surveyResponse.ok) {
              const surveyData = await surveyResponse.json();
              setCategories(surveyData.survey || []);
              setSurveyVersion(surveyData.version || 1);
            } else {
              toast({
                title: 'No Active Survey',
                description: 'There is no active survey available for your college at this time.',
                variant: 'destructive'
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching survey:', error);
        toast({
          title: 'Error',
          description: 'Failed to load survey',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserCollege();
  }, [user]);

  const setAnswer = (qId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

const handleSubmit = async () => {
  if (!user?.username) return;
  
  setSubmitting(true);
  try {
    const token = getToken();
    
    // Format answers for submission
    const formattedAnswers: SurveyResponse[] = [];
    
    categories.forEach(category => {
      category.questions.forEach(question => {
        const answer = answers[String(question.id)];
        if (answer !== undefined && answer !== '') {
          const response: SurveyResponse = {
            question_id: question.id
          };
          
          if (question.type === 'number' || question.type === 'scale') {
            response.answer_number = Number(answer);
          } else if (question.type === 'checkbox' && Array.isArray(answer)) {
            response.answer_options = answer;
          } else {
            response.answer_text = String(answer);
          }
          
          formattedAnswers.push(response);
        }
      });
    });

    const response = await fetch(`${API_URL}/alumni/survey/submit/${user.username}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: surveyVersion,
        answers: formattedAnswers,
        notify: notifyOnNewVersion
      })
    });

    if (response.ok) {
      setShowReview(false);
      setEditMode(false); // Turn off edit mode
      setSubmitted(true);
      
      // Immediately fetch the updated submission details
      const submissionsResponse = await fetch(`${API_URL}/alumni/survey/responses/${user.username}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (submissionsResponse.ok) {
        const submissions = await submissionsResponse.json();
        if (submissions.length > 0) {
          setPreviousSubmission(submissions[0]);
        }
      }
      
      // Store notification preference in localStorage
      if (notifyOnNewVersion) {
        localStorage.setItem(`survey_notify_${user.username}`, 'true');
      }
      
      toast({ 
        title: 'Survey Submitted!', 
        description: 'Thank you for completing the tracer survey.' 
      });
    } else {
      throw new Error('Failed to submit survey');
    }
  } catch (error) {
    console.error('Error submitting survey:', error);
    toast({
      title: 'Error',
      description: 'Failed to submit survey',
      variant: 'destructive'
    });
  } finally {
    setSubmitting(false);
  }
};

  const handleEdit = () => {
    setEditMode(true);
    setSubmitted(false);
    setCurrentSection(0);
  };

  const loadPreviousAnswers = () => {
    if (!previousSubmission) return;
    
    const loadedAnswers: Record<string, any> = {};
    previousSubmission.answers.forEach(ans => {
      if (ans.answer_options) {
        loadedAnswers[String(ans.question_id)] = ans.answer_options;
      } else if (ans.answer_number !== undefined && ans.answer_number !== null) {
        loadedAnswers[String(ans.question_id)] = ans.answer_number;
      } else if (ans.answer_text) {
        loadedAnswers[String(ans.question_id)] = ans.answer_text;
      }
    });
    setAnswers(loadedAnswers);
    setEditMode(true);
    setSubmitted(false);
    setShowPreviousDialog(false);
    setCurrentSection(0);
    toast({
      title: 'Previous Answers Loaded',
      description: 'You can now edit your previous responses.'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (submitted && !editMode) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ type: 'spring' }}
        >
          <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
        </motion.div>
        <h2 className="text-2xl font-display font-bold mb-2">Survey Submitted!</h2>
        <p className="text-muted-foreground mb-2">
          Your responses have been recorded. Thank you for your participation!
        </p>
        {previousSubmission && (
          <p className="text-sm text-muted-foreground mb-4">
            Submitted on: {new Date(previousSubmission.completed_at).toLocaleDateString()} at {new Date(previousSubmission.completed_at).toLocaleTimeString()}
          </p>
        )}
        
        <div className="bg-muted/30 p-4 rounded-lg mb-6 text-left">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Bell className="h-4 w-4" /> Stay Updated
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Would you like to receive an email notification when a new survey version is available?
          </p>
          <div className="flex items-center gap-2">
            <Switch 
              id="notify"
              checked={notifyOnNewVersion}
              onCheckedChange={setNotifyOnNewVersion}
            />
            <Label htmlFor="notify">Notify me about new survey versions</Label>
          </div>
          {notifyOnNewVersion && (
            <p className="text-xs text-primary mt-2">
              ✓ We'll send you an email at {user?.email} when a new survey is published.
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => setShowPreviousDialog(true)}>
            <Eye className="h-4 w-4 mr-2" /> View My Responses
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <Edit2 className="h-4 w-4 mr-2" /> Edit My Responses
          </Button>
          <Button onClick={() => window.location.href = '/app/alumni/dashboard'}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h2 className="text-2xl font-display font-bold mb-2">No Survey Available</h2>
        <p className="text-muted-foreground mb-6">
          There is no active survey available for your college at this time.
        </p>
        <Button onClick={() => window.location.href = '/app/alumni/dashboard'}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const section = categories[currentSection];
  const progress = ((currentSection + 1) / categories.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Tracer Survey</h1>
        <p className="text-muted-foreground text-sm">
          {editMode ? 'Editing your previous responses' : 'Complete all sections to submit your survey'} • Version {surveyVersion}
        </p>
      </div>

      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Section {currentSection + 1} of {categories.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <motion.div 
        key={currentSection} 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        className="glass-card p-6"
      >
        <h3 className="font-display font-semibold text-lg mb-6">{section.name}</h3>
        {section.description && (
          <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
        )}
        
        <div className="space-y-6">
          {section.questions.map((q, index) => (
            <div key={q.id} className="space-y-2">
              <Label className="text-base">
                {index + 1}. {q.text} 
                {q.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              
              {/* Text Input */}
              {q.type === 'text' && (
                <Input 
                  value={answers[String(q.id)] || ''} 
                  onChange={e => setAnswer(String(q.id), e.target.value)}
                  placeholder="Your answer"
                  className="mt-1"
                />
              )}

              {/* Number Input */}
              {q.type === 'number' && (
                <Input 
                  type="number"
                  value={answers[String(q.id)] || ''} 
                  onChange={e => setAnswer(String(q.id), e.target.value)}
                  placeholder="Enter a number"
                  className="mt-1"
                />
              )}

              {/* Select/Dropdown */}
              {(q.type === 'select' || q.type === 'dropdown') && q.options && (
                <Select 
                  value={answers[String(q.id)] || ''} 
                  onValueChange={v => setAnswer(String(q.id), v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {q.options.map((opt: string) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Radio Group (for single choice) */}
              {q.type === 'radio' && q.options && (
                <RadioGroup 
                  value={answers[String(q.id)] || ''} 
                  onValueChange={v => setAnswer(String(q.id), v)}
                  className="mt-2 space-y-2"
                >
                  {q.options.map((opt: string) => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                      <Label htmlFor={`${q.id}-${opt}`}>{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Checkbox Group (multiple choice) */}
              {q.type === 'checkbox' && q.options && (
                <div className="mt-2 space-y-2">
                  {q.options.map((opt: string) => {
                    const currentValues = answers[String(q.id)] || [];
                    return (
                      <div key={opt} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`${q.id}-${opt}`}
                          checked={currentValues.includes(opt)}
                          onCheckedChange={(checked) => {
                            const newValues = checked 
                              ? [...currentValues, opt]
                              : currentValues.filter((v: string) => v !== opt);
                            setAnswer(String(q.id), newValues);
                          }}
                        />
                        <Label htmlFor={`${q.id}-${opt}`}>{opt}</Label>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Scale/Slider */}
              {q.type === 'scale' && (
                <div className="mt-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground min-w-[20px]">
                      {q.scale_min || 1}
                    </span>
                    <Slider 
                      value={[answers[String(q.id)] || Math.floor(((q.scale_max || 10) - (q.scale_min || 1)) / 2) + (q.scale_min || 1)]} 
                      onValueChange={v => setAnswer(String(q.id), String(v[0]))} 
                      min={q.scale_min || 1} 
                      max={q.scale_max || 10} 
                      step={1} 
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground min-w-[20px]">
                      {q.scale_max || 10}
                    </span>
                    <span className="text-sm font-bold w-8 text-center">
                      {answers[String(q.id)] || Math.floor(((q.scale_max || 10) - (q.scale_min || 1)) / 2) + (q.scale_min || 1)}
                    </span>
                  </div>
                  {q.scale_min !== undefined && q.scale_max !== undefined && (
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>Lowest</span>
                      <span>Highest</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            disabled={currentSection === 0} 
            onClick={() => setCurrentSection(p => p - 1)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          
          {currentSection < categories.length - 1 ? (
            <Button onClick={() => setCurrentSection(p => p + 1)}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={() => setShowReview(true)}>
              Review & Submit
            </Button>
          )}
        </div>
      </motion.div>

      {/* Review Dialog */}
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Review Your Answers</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {categories.map((section, idx) => {
              const hasAnswers = section.questions.some(q => answers[String(q.id)] !== undefined && answers[String(q.id)] !== '');
              if (!hasAnswers) return null;
              
              return (
                <div key={section.id} className="space-y-2">
                  <h4 className="font-semibold text-sm text-primary border-b pb-1">
                    Section {idx + 1}: {section.name}
                  </h4>
                  {section.questions.map(q => {
                    const answer = answers[String(q.id)];
                    if (answer === undefined || answer === '') return null;
                    
                    let displayAnswer = '';
                    if (Array.isArray(answer)) {
                      displayAnswer = answer.join(', ');
                    } else {
                      displayAnswer = String(answer);
                    }
                    
                    return (
                      <div key={q.id} className="flex justify-between py-1 text-sm border-b last:border-0">
                        <span className="text-muted-foreground pr-4">{q.text}</span>
                        <span className="font-medium text-right">{displayAnswer || '—'}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            
            {Object.keys(answers).length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No answers provided yet.
              </p>
            )}
          </div>

          <div className="bg-muted/30 p-3 rounded-lg mb-2">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Get notified about new surveys</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="notify-review"
                checked={notifyOnNewVersion}
                onCheckedChange={setNotifyOnNewVersion}
              />
              <Label htmlFor="notify-review" className="text-xs text-muted-foreground">
                Send me an email when a new survey version is available
              </Label>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowReview(false)}>
              Edit
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              {submitting ? 'Submitting...' : 'Submit Survey'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Previous Responses Dialog */}
      <Dialog open={showPreviousDialog} onOpenChange={setShowPreviousDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Your Previous Responses</DialogTitle>
          </DialogHeader>
          
          {previousSubmission && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Submitted on: {new Date(previousSubmission.completed_at).toLocaleDateString()} at {new Date(previousSubmission.completed_at).toLocaleTimeString()}
                <br />
                Survey Version: {previousSubmission.survey_version}
              </p>
              
              <div className="space-y-4">
                {categories.map((section, idx) => {
                  const sectionAnswers = previousSubmission.answers.filter(a => 
                    section.questions.some(q => q.id === a.question_id)
                  );
                  if (sectionAnswers.length === 0) return null;
                  
                  return (
                    <div key={section.id} className="space-y-2">
                      <h4 className="font-semibold text-sm text-primary border-b pb-1">
                        Section {idx + 1}: {section.name}
                      </h4>
                      {sectionAnswers.map(ans => {
                        const question = section.questions.find(q => q.id === ans.question_id);
                        if (!question) return null;
                        
                        let displayAnswer = '';
                        if (ans.answer_options) {
                          displayAnswer = ans.answer_options.join(', ');
                        } else if (ans.answer_number !== undefined && ans.answer_number !== null) {
                          displayAnswer = String(ans.answer_number);
                        } else if (ans.answer_text) {
                          displayAnswer = ans.answer_text;
                        }
                        
                        return (
                          <div key={ans.question_id} className="flex justify-between py-1 text-sm border-b last:border-0">
                            <span className="text-muted-foreground pr-4">{question.text}</span>
                            <span className="font-medium text-right">{displayAnswer}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 gap-2">
            <Button variant="outline" onClick={() => setShowPreviousDialog(false)}>
              Close
            </Button>
            <Button onClick={loadPreviousAnswers}>
              <Edit2 className="h-4 w-4 mr-2" /> Edit These Responses
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}