import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [shakeCount, setShakeCount] = useState(0);
  const [progressBarWidth, setProgressBarWidth] = useState(0); // State for progress bar width
  const [isDetectingShake, setIsDetectingShake] = useState(false);
  const [lastAcceleration, setLastAcceleration] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [timeLeft, setTimeLeft] = useState(10);
  const [isCountingDown, setIsCountingDown] = useState(false);

  const shakeSpeedThreshold = 60; // Acceleration threshold for detecting a shake
  const directionChangeThreshold = 35; // Direction change threshold for detecting a shake
  const targetShake = 100; // Maximum shake count

  // Effect for countdown timer
  useEffect(() => {
    if (isCountingDown) {
      const intervalId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      if (timeLeft <= 0) {
        setIsDetectingShake(false); // Stop detection when time is up
        setIsCountingDown(false);
        sendShakeCount();
      }

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [timeLeft, isCountingDown]);

  // Effect for detecting shake motion
  useEffect(() => {
    if (isDetectingShake) {
      window.addEventListener("devicemotion", handleMotion);
    } else {
      window.removeEventListener("devicemotion", handleMotion);
    }

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [isDetectingShake]);

  // Update the progress bar width whenever shakeCount changes
  useEffect(() => {
    const updatedWidth = (shakeCount / targetShake) * 100;
    setProgressBarWidth(updatedWidth);
  }, [shakeCount]);

  const startShakeDetection = () => {
    setIsDetectingShake(true);
    setIsCountingDown(true);
    setShakeCount(0);
    setProgressBarWidth(0);
    setLastAcceleration({ x: 0, y: 0, z: 0 });
    setTimeLeft(10); // Reset the timer to 10 seconds
  };

  const handleMotion = (event) => {
    if (!isDetectingShake) return; // Prevent unnecessary shake detection

    const acceleration =
      event.accelerationIncludingGravity || event.acceleration;

    // Calculate speed (magnitude of acceleration)
    const currentSpeed = Math.sqrt(
      acceleration.x * acceleration.x +
        acceleration.y * acceleration.y +
        acceleration.z * acceleration.z
    );

    const deltaX = Math.abs(lastAcceleration.x - acceleration.x);
    const deltaY = Math.abs(lastAcceleration.y - acceleration.y);
    const deltaZ = Math.abs(lastAcceleration.z - acceleration.z);
    const totalDirectionChange = deltaX + deltaY + deltaZ;

    if (
      currentSpeed > shakeSpeedThreshold &&
      totalDirectionChange > directionChangeThreshold
    ) {
      setShakeCount((prevCount) => Math.min(prevCount + 1, targetShake));
    }

    setLastAcceleration(acceleration);
  };

  const sendShakeCount = async () => {
    try {
      await axios.post("http://localhost:7000/shakeResult", { shakeCount });
    } catch (error) {
      console.error("Error sending shake count to server:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Shake your phone!</h1>
      <p className="mb-4 text-xl">
        Timer:{" "}
        <span className="font-bold">
          {timeLeft > 1 ? timeLeft : "Time's up!"}
        </span>
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-xs">
        <div className="w-full bg-gray-200 rounded-md h-8 mb-6 relative">
          <div
            className="bg-blue-300 h-8 rounded-md"
            style={{ width: `${progressBarWidth}%` }}
          />
          <span className="absolute left-1/2 top-0 text-green-600 font-semibold text-xl">
            {shakeCount}
          </span>
        </div>
      </div>

      <button
        onClick={startShakeDetection}
        className={`px-4 py-2 w-48 text-white rounded-lg ${
          isDetectingShake ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
        }`}
        disabled={isDetectingShake}
      >
        {isDetectingShake ? "Detecting..." : "Start Shake Detection"}
      </button>
      <button
        className="w-48 px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg mt-4"
        onClick={() => window.location.reload()}
      >
        Refresh
      </button>
    </div>
  );
}

export default App;
