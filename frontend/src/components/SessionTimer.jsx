import useTokenTimer from "../hooks/useTokenTimer";

function SessionTimer() {
    const timeLeft = useTokenTimer();

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="fixed top-2 right-2 bg-white border border-gray-300 rounded px-3 py-1 text-sm shadow">
            Logout in: {minutes}:{seconds < 10 ? "0" + seconds : seconds}
        </div>
    );
}

export default SessionTimer;