export default function Notification({error}) { return error ? <div className="mb-4 rounded bg-red-50 p-3 text-red-700">{error}</div> : null; }
