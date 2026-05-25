type ActivityFeedbackProps = {
    message?: string;
};

export function ActivityFeedback({ message }: ActivityFeedbackProps) {
    if (!message) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            {message}
        </div>
    );
}