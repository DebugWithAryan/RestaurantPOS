'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, MessageSquare, ThumbsUp, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface FeedbackData {
  overallRating: number;
  categories: {
    food: number;
    service: number;
    ambiance: number;
    value: number;
  };
  comments: string;
  wouldRecommend: boolean;
}

export default function FeedbackPage() {
  const router = useRouter();
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    overallRating: 0,
    categories: {
      food: 0,
      service: 0,
      ambiance: 0,
      value: 0,
    },
    comments: '',
    wouldRecommend: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRatingChange = (category: keyof FeedbackData['categories'], rating: number) => {
    setFeedbackData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: rating,
      },
    }));
  };

  const handleOverallRatingChange = (rating: number) => {
    setFeedbackData(prev => ({
      ...prev,
      overallRating: rating,
    }));
  };

  const handleSubmit = async () => {
    if (feedbackData.overallRating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSubmitted(true);
      toast.success('Thank you for your feedback!');

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/scan');
      }, 3000);

    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ 
    rating, 
    onRatingChange, 
    size = 'default' 
  }: { 
    rating: number; 
    onRatingChange: (rating: number) => void;
    size?: 'small' | 'default' | 'large';
  }) => {
    const sizeClasses = {
      small: 'w-4 h-4',
      default: 'w-6 h-6',
      large: 'w-8 h-8',
    };

    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onRatingChange(star)}
            className={`transition-colors ${
              star <= rating 
                ? 'text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            <Star className={`${sizeClasses[size]} fill-current`} />
          </button>
        ))}
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="card p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Thank You!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Your feedback has been submitted successfully. We appreciate your time and input!
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                You've earned 10 loyalty points for sharing your feedback!
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/scan')}
                className="w-full btn btn-primary"
              >
                Start New Order
              </button>
              
              <button
                onClick={() => window.open('https://maps.google.com', '_blank')}
                className="w-full btn btn-outline"
              >
                Rate on Google Maps
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-app py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              How was your experience?
            </h1>
            <p className="text-gray-600">
              Your feedback helps us improve our service
            </p>
          </div>

          <div className="space-y-8">
            {/* Overall Rating */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Overall Rating
              </h2>
              
              <div className="flex items-center justify-center mb-4">
                <StarRating
                  rating={feedbackData.overallRating}
                  onRatingChange={handleOverallRatingChange}
                  size="large"
                />
              </div>
              
              <p className="text-center text-gray-600">
                {feedbackData.overallRating === 0 && 'Tap to rate'}
                {feedbackData.overallRating === 1 && 'Poor'}
                {feedbackData.overallRating === 2 && 'Fair'}
                {feedbackData.overallRating === 3 && 'Good'}
                {feedbackData.overallRating === 4 && 'Very Good'}
                {feedbackData.overallRating === 5 && 'Excellent'}
              </p>
            </div>

            {/* Category Ratings */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Rate Individual Aspects
              </h2>
              
              <div className="space-y-6">
                {Object.entries(feedbackData.categories).map(([category, rating]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">
                        {category}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {category === 'food' && 'Quality and taste of food'}
                        {category === 'service' && 'Staff service and attentiveness'}
                        {category === 'ambiance' && 'Restaurant atmosphere and cleanliness'}
                        {category === 'value' && 'Value for money'}
                      </p>
                    </div>
                    
                    <StarRating
                      rating={rating}
                      onRatingChange={(newRating) => handleRatingChange(category as keyof FeedbackData['categories'], newRating)}
                      size="default"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Additional Comments
              </h2>
              
              <textarea
                value={feedbackData.comments}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="Tell us more about your experience (optional)"
                className="w-full h-32 input resize-none"
              />
            </div>

            {/* Recommendation */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Would you recommend us?
              </h2>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setFeedbackData(prev => ({ ...prev, wouldRecommend: true }))}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                    feedbackData.wouldRecommend
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span>Yes</span>
                </button>
                
                <button
                  onClick={() => setFeedbackData(prev => ({ ...prev, wouldRecommend: false }))}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                    !feedbackData.wouldRecommend && feedbackData.wouldRecommend !== undefined
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>No</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/scan')}
                className="flex-1 btn btn-outline"
              >
                Skip Feedback
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || feedbackData.overallRating === 0}
                className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner w-4 h-4 mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>Submit Feedback</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
