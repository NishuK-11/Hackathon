import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hospitalApi } from '../../api/hospitalApi';
import { Star, MessageSquare, User, Edit2, Send } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { showToast } from '../../redux/slices/uiSlice';

export const HospitalReviews = ({ hospitalId }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const { data: reviewData, isLoading } = useQuery({
    queryKey: ['hospital-reviews', hospitalId],
    queryFn: () => hospitalApi.getReviews(hospitalId),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (reviewData?.userReview) {
        await hospitalApi.editReview(hospitalId, rating, feedback);
      } else {
        await hospitalApi.addReview(hospitalId, rating, feedback);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospital-reviews', hospitalId] });
      dispatch(showToast({ message: 'Review submitted successfully!', type: 'success' }));
      setIsEditing(false);
      setFeedback('');
    },
    onError: () => {
      dispatch(showToast({ message: 'Failed to submit review', type: 'error' }));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    mutation.mutate();
  };

  const handleStartEdit = () => {
    if (reviewData?.userReview) {
      setRating(reviewData.userReview.rating);
      setFeedback(reviewData.userReview.feedback);
      setIsEditing(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <span>Patient Reviews & Ratings</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified patient feedback and hospital experience
          </p>
        </div>

        {reviewData?.averageRating && (
          <div className="flex items-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-extrabold text-amber-400">
              {reviewData.averageRating}
            </span>
            <span className="text-xs text-slate-400">
              ({reviewData.totalReviews} reviews)
            </span>
          </div>
        )}
      </div>

      {/* Review Submission Form */}
      <div className="medical-card p-5 border-blue-500/20">
        <h4 className="text-sm font-bold text-white mb-2">
          {reviewData?.userReview && !isEditing ? 'Your Submitted Review' : 'Write a Review'}
        </h4>

        {reviewData?.userReview && !isEditing ? (
          <div className="rounded-xl bg-slate-900/60 p-4 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= reviewData.userReview.rating ? 'fill-amber-400' : 'text-slate-600'}`}
                  />
                ))}
              </div>
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
            <p className="text-xs text-slate-300 italic">"{reviewData.userReview.feedback}"</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 mr-2">Rate:</span>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your consultation or hospital experience..."
              rows={3}
              required
              className="w-full rounded-xl bg-slate-900/90 border border-white/10 p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
            />

            <div className="flex items-center gap-2 justify-end">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl glow-btn-primary text-xs font-bold shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{mutation.isPending ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="medical-card p-4 h-20 animate-pulse bg-slate-900/40" />
            ))}
          </div>
        ) : reviewData?.reviews && reviewData.reviews.length > 0 ? (
          reviewData.reviews.map((rev) => (
            <div key={rev.id} className="medical-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{rev.patientName}</h5>
                    <p className="text-[10px] text-slate-500">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400' : 'text-slate-700'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-300 pl-10 leading-relaxed">
                {rev.feedback}
              </p>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500 italic text-center py-4">
            No patient reviews yet. Be the first to review!
          </p>
        )}
      </div>
    </div>
  );
};

export default HospitalReviews;
