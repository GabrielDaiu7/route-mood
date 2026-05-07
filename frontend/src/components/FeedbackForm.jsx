import { useState } from "react";

function FeedbackForm({ rating, comment, busy, onRatingChange, onCommentChange, onSubmit }) {
  const [open, setOpen] = useState(true);

  return (
    <section className="panel small feedback" aria-labelledby="feedback-title">
      <button
        type="button"
        id="feedback-title"
        className="panel-toggle"
        aria-expanded={open}
        aria-controls="feedback-content"
        onClick={() => setOpen((v) => !v)}
      >
        <span>Feedback</span>
        <span>{open ? "-" : "+"}</span>
      </button>

      <div id="feedback-content" hidden={!open}>
        <form onSubmit={onSubmit} className="stack">
          <label htmlFor="feedback-rating">
            Rating (1-5)
            <input id="feedback-rating" type="number" min="1" max="5" value={rating} onChange={(e) => onRatingChange(e.target.value)} required />
          </label>
          <label htmlFor="feedback-comment">
            Comment
            <textarea id="feedback-comment" rows="4" value={comment} onChange={(e) => onCommentChange(e.target.value)} placeholder="Tell us what worked" />
          </label>
          <button className="btn" disabled={busy}>{busy ? "Sending..." : "Submit Feedback"}</button>
        </form>
      </div>
    </section>
  );
}

export default FeedbackForm;
