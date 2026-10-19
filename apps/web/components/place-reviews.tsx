'use client';

import { useState } from 'react';
import { ReviewResponse } from '@guia/contracts';
import { useAuth } from '../lib/auth-context';
import { ApiClient } from '../lib/api-client';
import { Star, MessageSquare, Send, Reply, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface PlaceReviewsProps {
  placeId: string;
  initialReviews: ReviewResponse[];
  isOwner?: boolean;
}

export function PlaceReviews({ placeId, initialReviews, isOwner }: PlaceReviewsProps) {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState<ReviewResponse[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State for merchant reply
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyComment, setReplyComment] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      const created = await ApiClient.createReview(
        placeId,
        {
          rating,
          comment: comment.trim() || undefined,
        },
        token
      );
      setReviews([created, ...reviews]);
      setComment('');
      setFeedback('Sua avaliação foi enviada com sucesso! Obrigado.');
    } catch (err: any) {
      setError(err.message || 'Falha ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (reviewId: string) => {
    if (!token || !replyComment.trim()) return;

    setSubmittingReply(true);
    try {
      const reply = await ApiClient.replyReview(
        reviewId,
        { comment: replyComment.trim() },
        token
      );
      setReviews(
        reviews.map((r) =>
          r.id === reviewId
            ? { ...r, reply: { id: reply.id, comment: reply.comment, createdAt: new Date().toISOString() } }
            : r
        )
      );
      setReplyingReviewId(null);
      setReplyComment('');
    } catch (err: any) {
      alert(err.message || 'Erro ao responder avaliação');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            Avaliações e Opiniões
          </h2>
          <p className="text-xs text-slate-400">
            {reviews.length} {reviews.length === 1 ? 'avaliação registrada' : 'avaliações registradas'}
          </p>
        </div>
      </div>

      {/* Review Submission Box Dark Luxury */}
      <div className="bg-[#0a0a14]/90 border border-white/[0.08] rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <h3 className="text-sm font-bold text-white mb-3">Deixe sua experiência</h3>
        {user ? (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Sua nota (1 a 5 estrelas)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                          : 'fill-transparent text-slate-700 hover:text-slate-500'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold text-purple-300 ml-2">
                  {rating} {rating === 1 ? 'estrela' : 'estrelas'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Comentário (opcional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conte o que achou do atendimento, pratos, ambiente, diferenciais..."
                rows={3}
                className="w-full p-3.5 bg-white/[0.03] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition"
              />
            </div>

            {feedback && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-2xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#faf6ee] hover:bg-white disabled:opacity-50 text-[#0b0a17] font-bold text-xs px-6 py-3 rounded-2xl transition shadow-[0_0_20px_rgba(242,166,90,0.35)] flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Enviando...' : 'Publicar Avaliação'}
            </button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
            <p className="text-xs text-slate-400">
              Faça login para compartilhar sua avaliação e nota deste local.
            </p>
            <Link
              href="/login"
              className="inline-block px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl hover:from-purple-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(242,166,90,0.3)] transition"
            >
              Fazer Login para Avaliar
            </Link>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-10 bg-[#0a0a14]/60 border border-white/[0.08] rounded-3xl text-slate-500 text-xs sm:text-sm">
            Nenhuma avaliação ainda. Seja o primeiro a avaliar este local!
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="bg-[#0a0a14]/90 border border-white/[0.08] hover:border-purple-500/30 rounded-3xl p-5 space-y-3 shadow-[0_0_25px_rgba(0,0,0,0.5)] transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-[0_0_10px_rgba(242,166,90,0.4)]">
                    {r.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{r.user.name}</h4>
                    <span className="text-[11px] text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= r.rating
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                          : 'fill-slate-800 text-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {r.comment && <p className="text-xs text-slate-300 leading-relaxed font-normal">{r.comment}</p>}

              {/* Merchant Reply Display Dark Luxury */}
              {r.reply && (
                <div className="mt-3 pl-4 border-l-2 border-purple-500 bg-purple-950/20 border-r border-t border-b border-purple-500/20 p-3.5 rounded-r-2xl space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-300">Resposta do Estabelecimento</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(r.reply.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{r.reply.comment}</p>
                </div>
              )}

              {/* Merchant Reply Form (if merchant is owner) */}
              {isOwner && !r.reply && (
                <div className="pt-2">
                  {replyingReviewId === r.id ? (
                    <div className="space-y-2 mt-2">
                      <textarea
                        value={replyComment}
                        onChange={(e) => setReplyComment(e.target.value)}
                        placeholder="Escreva sua resposta como proprietário..."
                        rows={2}
                        className="w-full p-3 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500/60"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSendReply(r.id)}
                          disabled={submittingReply}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-[0_0_15px_rgba(242,166,90,0.4)]"
                        >
                          {submittingReply ? 'Enviando...' : 'Responder'}
                        </button>
                        <button
                          onClick={() => {
                            setReplyingReviewId(null);
                            setReplyComment('');
                          }}
                          className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-medium transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setReplyingReviewId(r.id);
                        setReplyComment('');
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1.5 transition"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      Responder esta avaliação
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
