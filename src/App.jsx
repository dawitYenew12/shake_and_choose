import { useState, useEffect } from "react";

function App() {
  const [shakeCount, setShakeCount] = useState(0);
  const [progressBarWidth, setProgressBarWidth] = useState(0); // New state for progress bar width
  const [isDetectingShake, setIsDetectingShake] = useState(false);
  const [lastAcceleration, setLastAcceleration] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [timer, setTimer] = useState(10);

  const shakeSpeedThreshold = 45; // Acceleration threshold (speed) for detecting a shake
  const directionChangeThreshold = 20; // Direction change threshold for detecting a shake
  const maxShakeCount = 50; // Maximum shakes for progress bar calculation (this can be higher than real shake count)

  useEffect(() => {
    if (isDetectingShake) {
      window.addEventListener("devicemotion", handleMotion);
    } else {
      window.removeEventListener("devicemotion", handleMotion);
    }

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [isDetectingShake, lastAcceleration]);

  const startShakeDetection = () => {
    setIsDetectingShake(true);
    setShakeCount(0);
    setProgressBarWidth(0);
    setLastAcceleration({ x: 0, y: 0, z: 0 });

    setTimeout(() => {
      setIsDetectingShake(false);
      setTimer((prevTimer) => prevTimer - 1);
    }, 10000);
  };

  const handleMotion = (event) => {
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
      setShakeCount((prevCount) => prevCount + 1);
    }

    setLastAcceleration(acceleration);

    const updatedWidth = (shakeCount / maxShakeCount) * 100;
    setProgressBarWidth(updatedWidth);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Shake your phone!</h1>
      <p className="mb-4 text-xl">
        Timer: <span className="font-bold">{timer}</span>
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-xs">
        <div className="w-full bg-gray-200 rounded-md h-8 mb-6 relative">
          <div
            className="bg-blue-600 h-8 rounded-full"
            style={{ width: `${progressBarWidth}%` }}
          />
          <span className="absolute left-1/2 top-0 text-green-800 font-semibold text-xl">
            {shakeCount}
          </span>
        </div>
      </div>

      <button
        onClick={startShakeDetection}
        className={`px-4 py-2 text-white rounded-lg ${
          isDetectingShake ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
        }`}
        disabled={isDetectingShake}
      >
        {isDetectingShake ? "Detecting..." : "Start Shake Detection"}
      </button>
    </div>
  );
}

export default App;
