import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle, Lightbulb, Zap } from 'lucide-react';

const DoubleSlitLab = ({ onComplete }) => {
  const [wavelength, setWavelength] = useState(500); // nm
  const [slitSeparation, setSlitSeparation] = useState(0.1); // mm
  const [screenDistance, setScreenDistance] = useState(1); // m
  const [slitWidth, setSlitWidth] = useState(0.02); // mm
  const [isAnimating, setIsAnimating] = useState(false);
  const [interferencePattern, setInterferencePattern] = useState([]);
  const [maximaPositions, setMaximaPositions] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [fringeSpacing, setFringeSpacing] = useState(0);
  const startTimeRef = useRef();

  // Calculate double slit interference pattern
  useEffect(() => {
    const pattern = [];
    const maxima = [];
    const intensity = [];
    
    // Screen width in mm
    const screenWidth = 20; // mm
    const points = 200;
    
    for (let i = 0; i < points; i++) {
      const y = (i - points / 2) * (screenWidth / points); // Position on screen in mm
      
      // Convert to meters
      const y_m = y / 1000;
      const d_m = slitSeparation / 1000;
      const D_m = screenDistance;
      const lambda_m = wavelength / 1e9;
      const a_m = slitWidth / 1000;
      
      // Path difference
      const delta = (d_m * y_m) / D_m;
      
      // Phase difference
      const phi = (2 * Math.PI * delta) / lambda_m;
      
      // Single slit diffraction factor
      const beta = (Math.PI * a_m * y_m) / (lambda_m * D_m);
      const singleSlitFactor = Math.pow(Math.sin(beta) / beta, 2);
      
      // Double slit interference factor
      const interferenceFactor = Math.pow(Math.cos(phi / 2), 2);
      
      // Total intensity
      const totalIntensity = singleSlitFactor * interferenceFactor;
      
      pattern.push({ y, intensity: totalIntensity });
      intensity.push(totalIntensity);
      
      // Find maxima (bright fringes)
      if (i > 0 && i < points - 1) {
        const prevIntensity = intensity[i - 1];
        const nextIntensity = intensity[i + 1];
        if (totalIntensity > prevIntensity && totalIntensity > nextIntensity && totalIntensity > 0.1) {
          maxima.push({ y, intensity: totalIntensity, order: Math.round(phi / (2 * Math.PI)) });
        }
      }
    }
    
    setInterferencePattern(pattern);
    setMaximaPositions(maxima);
    
    // Calculate fringe spacing
    const calculatedFringeSpacing = (wavelength * screenDistance * 1000) / (slitSeparation * 1000);
    setFringeSpacing(calculatedFringeSpacing);
  }, [wavelength, slitSeparation, screenDistance, slitWidth]);

  // Animation effect
  useEffect(() => {
    if (isAnimating) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
      
      const interval = setInterval(() => {
        setTimeElapsed((Date.now() - startTimeRef.current) / 1000);
      }, 100);
      
      return () => clearInterval(interval);
    } else {
      startTimeRef.current = null;
      setTimeElapsed(0);
    }
  }, [isAnimating]);

  const startAnimation = () => {
    setIsAnimating(true);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
  };

  const resetLab = () => {
    setWavelength(500);
    setSlitSeparation(0.1);
    setScreenDistance(1);
    setSlitWidth(0.02);
    setIsAnimating(false);
    setCompleted(false);
    setTimeElapsed(0);
    startTimeRef.current = null;
  };

  const handleComplete = () => {
    setCompleted(true);
    onComplete({
      score: 95,
      timeSpent: '25 minutes',
      experimentsCompleted: ['Interference Pattern Analysis', 'Fringe Spacing Measurement', 'Wavelength Calculation'],
      dataPoints: 15
    });
  };

  const SliderControl = ({ label, value, onChange, min, max, step, unit }) => (
    <div className="space-y-2">
      <label className="slider-label">
        {label}: {value}{unit}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider-input slider-thumb"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="lab-container p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Double Slit Experiment
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Explore wave interference and diffraction with interactive double slit simulation
          </p>
        </div>

        {/* Instructions */}
        <div className="lab-card mb-8">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-6 h-6 text-yellow-500 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Adjust the wavelength of light using the slider</li>
                <li>Modify the slit separation distance</li>
                <li>Change the screen distance to observe pattern changes</li>
                <li>Adjust slit width to see diffraction effects</li>
                <li>Click play to start the wave animation</li>
                <li>Observe the interference pattern and complete the lab</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="lab-card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Controls</h2>
            
            <div className="slider-container space-y-6">
              <SliderControl
                label="Wavelength"
                value={wavelength}
                onChange={setWavelength}
                min={400}
                max={700}
                step={10}
                unit="nm"
              />
              
              <SliderControl
                label="Slit Separation"
                value={slitSeparation}
                onChange={setSlitSeparation}
                min={0.05}
                max={0.5}
                step={0.01}
                unit="mm"
              />
              
              <SliderControl
                label="Screen Distance"
                value={screenDistance}
                onChange={setScreenDistance}
                min={0.5}
                max={3}
                step={0.1}
                unit="m"
              />

              <SliderControl
                label="Slit Width"
                value={slitWidth}
                onChange={setSlitWidth}
                min={0.01}
                max={0.1}
                step={0.005}
                unit="mm"
              />
            </div>

            {/* Animation Controls */}
            <div className="mt-8 space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={isAnimating ? stopAnimation : startAnimation}
                  className={`btn ${isAnimating ? 'btn-warning' : 'btn-success'} flex-1`}
                >
                  {isAnimating ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </>
                  )}
                </button>
                
                <button
                  onClick={resetLab}
                  className="btn btn-secondary"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </button>
              </div>

              {!completed && (
                <button
                  onClick={handleComplete}
                  className="btn btn-primary w-full"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Lab
                </button>
              )}
              
              {completed && (
                <div className="flex items-center justify-center space-x-2 text-success-600 p-4 bg-success-50 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Lab Completed!</span>
                </div>
              )}
            </div>
          </div>

          {/* Double Slit Visualization */}
          <div className="lab-card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Double Slit Interference Pattern</h2>
            
            <div className="double-slit-container relative overflow-hidden bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 border-4 border-gray-700 shadow-2xl" style={{ height: '384px' }}>
              {/* Light Source */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <div className="w-8 h-8 bg-yellow-400 rounded-full shadow-lg animate-pulse">
                  <div className="w-full h-full bg-yellow-300 rounded-full animate-ping"></div>
                </div>
                <p className="text-xs text-white mt-2 text-center">Light Source</p>
              </div>

              {/* Double Slit Barrier */}
              <div className="absolute left-1/3 top-1/2 transform -translate-y-1/2 w-2 h-32 bg-gray-600 rounded-lg shadow-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-24 bg-gray-800 rounded"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-24 bg-gray-800 rounded translate-x-2"></div>
                <p className="text-xs text-white mt-2 text-center -ml-4">Double Slit</p>
              </div>

              {/* Interference Pattern Screen */}
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-1 h-64 bg-gray-300 rounded shadow-lg">
                <p className="text-xs text-white mt-2 text-center -ml-4">Screen</p>
              </div>

              {/* Wave Animation */}
              {isAnimating && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-60"
                      style={{
                        left: '10%',
                        top: `${45 + i * 2}%`
                      }}
                      animate={{
                        x: ['0%', '100%'],
                        opacity: [0.6, 0.2, 0.6]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Interference Pattern Visualization */}
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2 w-32 h-64 bg-gray-800 rounded-lg border border-gray-600 overflow-hidden">
                <svg width="100%" height="100%" className="absolute inset-0">
                  {interferencePattern.map((point, index) => {
                    const intensity = Math.max(0, Math.min(1, point.intensity));
                    const y = (point.y + 10) * 3; // Scale and center
                    const opacity = intensity * 0.8;
                    const color = `hsl(${200 + intensity * 160}, 70%, ${50 + intensity * 30}%)`;
                    
                    return (
                      <line
                        key={index}
                        x1="0"
                        y1={y}
                        x2="100%"
                        y2={y}
                        stroke={color}
                        strokeWidth="2"
                        opacity={opacity}
                      />
                    );
                  })}
                </svg>
                
                {/* Maxima Markers */}
                {maximaPositions.map((maxima, index) => {
                  const y = (maxima.y + 10) * 3;
                  return (
                    <motion.div
                      key={index}
                      className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                      style={{
                        left: '90%',
                        top: `${y}px`,
                        transform: 'translateY(-50%)'
                      }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.8, 1, 0.8]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: index * 0.1
                      }}
                    />
                  );
                })}
              </div>

              {/* Physics Data Display */}
              <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-2">
                <div className="bg-gray-700 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400">Wavelength</div>
                  <div className="text-sm font-bold text-blue-400">{wavelength}nm</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400">Slit Separation</div>
                  <div className="text-sm font-bold text-green-400">{slitSeparation}mm</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400">Screen Distance</div>
                  <div className="text-sm font-bold text-purple-400">{screenDistance}m</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400">Fringe Spacing</div>
                  <div className="text-sm font-bold text-yellow-400">
                    {fringeSpacing.toFixed(2)}mm
                  </div>
                </div>
              </div>
            </div>

            {/* Physics Data */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-blue-700">Fringe Spacing</span>
                <span className="text-lg font-bold text-blue-900">
                  {fringeSpacing.toFixed(2)}mm
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                <span className="text-sm font-medium text-green-700">Maxima Count</span>
                <span className="text-lg font-bold text-green-900">
                  {maximaPositions.length}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <span className="text-sm font-medium text-purple-700">Time Elapsed</span>
                <span className="text-lg font-bold text-purple-900">
                  {timeElapsed.toFixed(1)}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Analysis */}
        <div className="lab-card mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Data Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Interference Pattern</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  The fringe spacing is determined by the wavelength, slit separation, and screen distance.
                </p>
                <div className="text-center">
                  <span className="text-lg font-mono">Δy = λD/d</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Wave Interference</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  Constructive interference occurs when waves are in phase, destructive when out of phase.
                </p>
                <div className="text-center">
                  <span className="text-lg font-mono">I = I₀cos²(πd sin θ/λ)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoubleSlitLab;

