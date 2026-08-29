import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { serverUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Notification from '../components/Notification';
import Loader from '../components/Loader';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const [feedback, setFeedback] = useState({
    rating: 5,
    comment: '',
  });

  const load = async () => {
    try {
      setLoading(true);
      setMessage('');

      // Load event
      const eventResponse = await api.get(`/events/${id}`);
      setEvent(eventResponse.data);

      // Load comments
      try {
        const commentsResponse = await api.get(`/comments/${id}`);
        setComments(commentsResponse.data);
      } catch (error) {
        console.error('Comments could not be loaded:', error);
        setComments([]);
      }
    } catch (error) {
      console.error('Event could not be loaded:', error);
      setMessage(
        error.response?.data?.message ||
        'Unable to load this event.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) {
    return <Loader />;
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl bg-white p-7 shadow">
          <h1 className="text-2xl font-bold text-red-600">
            Event not found
          </h1>

          <p className="mt-2 text-slate-600">
            We could not load this event.
          </p>

          <Notification error={message} />
        </div>
      </div>
    );
  }

  const register = async () => {
    try {
      setMessage('');

      await api.post(`/registrations/${id}`);

      setMessage(
        'You are registered. A confirmation was added to your notifications.'
      );
    } catch (error) {
      console.error('Registration failed:', error);

      setMessage(
        error.response?.data?.message ||
        'Registration failed. Please try again.'
      );
    }
  };

  const comment = async (item) => {
    item.preventDefault();

    if (!text.trim()) {
      return;
    }

    try {
      setMessage('');

      await api.post(`/comments/${id}`, {
        text: text.trim(),
      });

      setText('');
      await load();
    } catch (error) {
      console.error('Comment failed:', error);

      setMessage(
        error.response?.data?.message ||
        'Could not post your comment.'
      );
    }
  };

  const sendFeedback = async (item) => {
    item.preventDefault();

    try {
      setMessage('');

      await api.post(`/feedback/${id}`, feedback);

      setMessage('Thank you for your private feedback.');

      setFeedback({
        rating: 5,
        comment: '',
      });
    } catch (error) {
      console.error('Feedback failed:', error);

      setMessage(
        error.response?.data?.message ||
        'Feedback could not be submitted.'
      );
    }
  };

  const eventEnded =
    event.date <= new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-3xl">

      {/* EVENT CARD */}
      <div className="overflow-hidden rounded-xl bg-white shadow">

        {/* EVENT IMAGE */}
        {event.image && (
          <img
            className="h-64 w-full object-cover"
            src={serverUrl(event.image)}
            alt={event.title}
          />
        )}

        <div className="p-7">

          {/* CATEGORY */}
          <p className="text-indigo-700">
            {event.category}
          </p>

          {/* TITLE */}
          <h1 className="text-3xl font-bold">
            {event.title}
          </h1>

          {/* DATE / TIME / LOCATION */}
          <p className="mt-3 text-slate-600">
            {event.date} at {event.time} · {event.location}
          </p>

          {/* DESCRIPTION */}
          <p className="mt-5 whitespace-pre-wrap">
            {event.description}
          </p>

          {/* ORGANIZER */}
          <p className="mt-4 text-sm text-slate-500">
            Hosted by {event.organizer} ·{' '}
            {event.registrationCount}/{event.capacity || '∞'} registered
          </p>

          {/* BUTTONS */}
          <div className="mt-6 flex gap-3">

            {/* REGISTER */}
            {user?.role === 'student' && (
              <button
                className="btn"
                onClick={register}
              >
                Register
              </button>
            )}

            {/* CALENDAR */}
            <a
              className="btn-secondary"
              href={`${serverUrl()}/events/${id}/calendar`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Add to calendar
            </a>

          </div>

          {/* MESSAGE */}
          <Notification error={message} />

        </div>
      </div>

      {/* FEEDBACK */}
      {user?.role === 'student' && eventEnded && (
        <section className="mt-8 rounded-xl bg-white p-6 shadow">

          <h2 className="text-xl font-bold">
            How was the event?
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your feedback is private and visible only to the organizer.
          </p>

          <form
            className="mt-4"
            onSubmit={sendFeedback}
          >

            <label>
              Rating

              <select
                className="input mt-1"
                value={feedback.rating}
                onChange={(item) =>
                  setFeedback({
                    ...feedback,
                    rating: Number(item.target.value),
                  })
                }
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option
                    key={rating}
                    value={rating}
                  >
                    {rating} star{rating !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-3 block">
              Comment (optional)

              <textarea
                className="input mt-1 min-h-24"
                value={feedback.comment}
                onChange={(item) =>
                  setFeedback({
                    ...feedback,
                    comment: item.target.value,
                  })
                }
              />
            </label>

            <button className="btn mt-4">
              Submit feedback
            </button>

          </form>
        </section>
      )}

      {/* DISCUSSION */}
      <section className="mt-8">

        <h2 className="text-xl font-bold">
          Discussion
        </h2>

        {/* COMMENT FORM */}
        {user && (
          <form
            onSubmit={comment}
            className="mt-3 flex gap-2"
          >
            <input
              className="input"
              value={text}
              onChange={(item) =>
                setText(item.target.value)
              }
              placeholder="Ask a question or leave a comment"
            />

            <button className="btn">
              Post
            </button>
          </form>
        )}

        {/* COMMENTS */}
        <div className="mt-4 space-y-3">

          {comments.map((item) => (
            <div
              className="rounded bg-white p-3 shadow-sm"
              key={item.id}
            >
              <b>{item.author}</b>

              <p>{item.text}</p>
            </div>
          ))}

          {!comments.length && (
            <p className="text-slate-500">
              No comments yet.
            </p>
          )}

        </div>

      </section>

    </div>
  );
}