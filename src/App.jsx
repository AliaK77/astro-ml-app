import React, { useState } from 'react';
import { Sparkles, Brain, Star, Globe, Clock, MapPin, Loader2 } from 'lucide-react';

const AstroMLExperience = () => {
  const [step, setStep] = useState('input');
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: ''
  });
  const [chartData, setChartData] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [dailyHoroscope, setDailyHoroscope] = useState('');
  const [loading, setLoading] = useState(false);

  const calculatePlanetaryPositions = (date, time) => {
    const datetime = new Date(`${date}T${time}`);
    const dayOfYear = Math.floor((datetime - new Date(datetime.getFullYear(), 0, 0)) / 86400000);
    
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    const sunSign = signs[Math.floor(((dayOfYear + 80) % 365) / 30.4)];
    
    const positions = {
      Sun: { sign: sunSign, degree: (dayOfYear * 0.986) % 30 },
      Moon: { sign: signs[(dayOfYear * 13) % 12], degree: (dayOfYear * 13.176) % 30 },
      Mercury: { sign: signs[(dayOfYear + 20) % 12], degree: (dayOfYear * 1.6) % 30 },
      Venus: { sign: signs[(dayOfYear + 40) % 12], degree: (dayOfYear * 1.2) % 30 },
      Mars: { sign: signs[(dayOfYear + 60) % 12], degree: (dayOfYear * 0.5) % 30 },
      Jupiter: { sign: signs[Math.floor(dayOfYear / 30) % 12], degree: (dayOfYear * 0.08) % 30 }
    };
    
    return positions;
  };

  const generateMLPrompt = (positions) => {
    const positionText = Object.entries(positions)
      .map(([planet, data]) => `${planet} in ${data.sign} at ${data.degree.toFixed(1)}°`)
      .join(', ');
    
    return `You are an AI system trained on astrological interpretation patterns. Given this birth chart data: ${positionText}, generate a brief, evocative prediction that blends traditional astrological themes with computational pattern recognition language. 

The prediction should:
- Reference 2-3 specific planetary positions and their symbolic meanings
- Use language that bridges mystical and analytical (e.g., "pattern convergence", "celestial algorithms", "cosmic data points")
- Be 3-4 sentences, poetic yet precise
- Avoid generic horoscope clichés

Focus on life themes, personality patterns, or upcoming cycles. Make it feel like both an ancient oracle and a neural network speaking simultaneously.`;
  };

  const generateDailyHoroscopePrompt = (birthChart, todayChart) => {
    const birthText = Object.entries(birthChart)
      .map(([planet, data]) => `${planet} in ${data.sign} at ${data.degree.toFixed(1)}°`)
      .join(', ');
    
    const todayText = Object.entries(todayChart)
      .map(([planet, data]) => `${planet} in ${data.sign} at ${data.degree.toFixed(1)}°`)
      .join(', ');
    
    return `You are an AI system trained on astrological interpretation patterns. Given:
    
NATAL CHART: ${birthText}
TODAY'S TRANSITS (${new Date().toLocaleDateString()}): ${todayText}

Generate a personalized daily horoscope by analyzing how today's planetary positions interact with this person's birth chart. 

The horoscope should:
- Reference 2-3 key transits or aspects between natal planets and current positions
- Use language that bridges mystical and analytical (e.g., "transit convergence", "algorithmic alignment", "pattern resonance")
- Be 3-4 sentences focusing on today's themes, opportunities, or challenges
- Avoid generic horoscope clichés

Make it feel like both an ancient oracle reading celestial omens and a neural network detecting pattern correlations.`;
  };

  const handleGenerateDailyHoroscope = async () => {
    setLoading(true);
    
    // Calculate today's planetary positions
    const today = new Date();
    const todayDateStr = today.toISOString().split('T')[0];
    const todayTimeStr = '12:00'; // Use noon for daily transits
    const todayChart = calculatePlanetaryPositions(todayDateStr, todayTimeStr);
    
    console.log('Generating daily horoscope...');
    console.log('Birth chart:', chartData);
    console.log('Today chart:', todayChart);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: generateDailyHoroscopePrompt(chartData, todayChart)
          }]
        })
      });
      
      const responseText = await response.text();
      console.log('Daily horoscope raw response:', responseText);
      
      const data = JSON.parse(responseText);
      console.log('Daily horoscope parsed data:', data);
      
      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.error?.message || 'API request failed');
      }
      
      const horoscopeText = data.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('');
      
      setDailyHoroscope(horoscopeText);
    } catch (error) {
      console.error('Error generating daily horoscope:', error);
      setDailyHoroscope('The daily celestial patterns are currently realigning. Please try again.');
    }
    
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.date || !formData.time || !formData.location) {
      alert('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setStep('processing');
    
    const positions = calculatePlanetaryPositions(formData.date, formData.time);
    setChartData(positions);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: generateMLPrompt(positions)
          }]
        })
      });
      
      const data = await response.json();
      const predictionText = data.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('');
      
      setPrediction(predictionText);
      setStep('result');
    } catch (error) {
      console.error('Error generating prediction:', error);
      setPrediction('The celestial algorithms are currently realigning. Please try again.');
      setStep('result');
    }
    
    setLoading(false);
  };

  const reset = () => {
    setStep('input');
    setFormData({ date: '', time: '', location: '' });
    setChartData(null);
    setPrediction('');
    setDailyHoroscope('');
  };

  const handlePrint = () => {
    console.log('Print button clicked');
    if (!chartData || !prediction) {
      console.log('No data to print');
      return;
    }
    
    console.log('Attempting to print...');
    
    // Try multiple methods
    // Method 1: Direct window.print
    setTimeout(() => {
      window.print();
    }, 100);
    
    // Method 2: Try execCommand (legacy but sometimes works)
    try {
      document.execCommand('print', false, null);
    } catch (e) {
      console.log('execCommand failed:', e);
    }
    
    // Method 3: Dispatch keyboard event (Ctrl+P)
    const printEvent = new KeyboardEvent('keydown', {
      key: 'p',
      code: 'KeyP',
      ctrlKey: true,
      metaKey: true,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(printEvent);
    
    console.log('Print attempts completed');
  };

  const handleSaveJSON = () => {
    if (!chartData || !prediction) return;
    
    // Create JSON content
    const jsonContent = {
      metadata: {
        generatedDate: new Date().toISOString(),
        birthData: {
          date: formData.date,
          time: formData.time,
          location: formData.location
        }
      },
      celestialConfiguration: chartData,
      prediction: prediction,
      dailyHoroscope: dailyHoroscope || null,
      dailyHoroscopeDate: dailyHoroscope ? new Date().toISOString() : null

    };
    
    // Create blob and download
    const blob = new Blob([JSON.stringify(jsonContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `astro-ml-reading-${formData.date}-${formData.time.replace(/:/g, '')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white p-8">
      <style>{`
        @media print {
          body { 
            background: white !important; 
            color: black !important;
          }
          .no-print { 
            display: none !important; 
          }
          .print-content { 
            color: black !important;
            background: white !important;
            border: none !important;
          }
          .print-hide {
            display: none !important;
          }
          .print-prediction {
            page-break-inside: avoid;
          }
        }
      `}</style>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 no-print">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="w-8 h-8 text-yellow-300" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Astro ML
            </h1>
            <Brain className="w-8 h-8 text-cyan-300" />
          </div>
          <p className="text-purple-200 text-sm">
            Celestial Pattern Recognition ::: Neural Divination System ::: For artistic exploration
          </p>
        </div>

        {step === 'input' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-300/20 no-print">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              Enter Your Cosmic Coordinates
            </h2>
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 mb-2 text-purple-200">
                  <Globe className="w-4 h-4" />
                  Birth Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2 mb-2 text-purple-200">
                  <Clock className="w-4 h-4" />
                  Birth Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2 mb-2 text-purple-200">
                  <MapPin className="w-4 h-4" />
                  Birth Location
                </label>
                <input
                  type="text"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white placeholder-purple-300/50"
                />
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Brain className="w-5 h-5" />
                Generate Prediction
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-purple-300/20 text-center no-print">
            <Loader2 className="w-16 h-16 mx-auto mb-6 animate-spin text-purple-300" />
            <h2 className="text-2xl font-semibold mb-2">Analyzing Celestial Patterns</h2>
            <p className="text-purple-200">Computing planetary positions ::: Training neural pathways ::: Divining patterns</p>
          </div>
        )}

        {step === 'result' && chartData && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-300/20 print-content print-hide">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-300" />
                Celestial Configuration
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(chartData).map(([planet, data]) => (
                  <div key={planet} className="bg-white/5 rounded-lg p-4 border border-purple-300/20">
                    <div className="font-semibold text-purple-200 text-sm mb-1">{planet}</div>
                    <div className="text-lg">{data.sign}</div>
                    <div className="text-xs text-purple-300">{data.degree.toFixed(1)}°</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-cyan-300/20 print-content print-hide">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Brain className="w-6 h-6 text-cyan-300" />
                Neural Pattern Analysis
              </h2>
              
              <div className="flex items-center justify-center gap-4 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
                    <div className="w-px h-12 bg-gradient-to-b from-purple-400 to-cyan-400"></div>
                    <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" style={{animationDelay: `${i * 0.15}s`}}></div>
                  </div>
                ))}
              </div>
              
              <div className="text-center text-sm text-cyan-200">
                Pattern convergence detected ::: Cosmic algorithms aligned
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg rounded-2xl p-8 border border-pink-300/20 print-content print-prediction">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-300" />
                Generated Interpretation
              </h2>
              
              <p className="text-lg leading-relaxed text-purple-50 mb-6">
                {prediction}
              </p>
              
              <div className="text-xs text-purple-300 italic">
                Generated by AI trained on astrological pattern recognition ::: For artistic exploration
              </div>
            </div>

            {dailyHoroscope && (
              <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 backdrop-blur-lg rounded-2xl p-8 border border-cyan-300/20 print-content print-prediction">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <Star className="w-6 h-6 text-cyan-300" />
                  Daily Horoscope - {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h2>
                
                <p className="text-lg leading-relaxed text-cyan-50 mb-6">
                  {dailyHoroscope}
                </p>
                
                <div className="text-xs text-cyan-300 italic">
                  Personalized transit analysis ::: Generated by AI pattern recognition ::: Artistic interpretation
                </div>
              </div>
            )}

            <div className="flex gap-4 no-print">
              <button
                onClick={reset}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-purple-300/30"
              >
                Generate New Reading
              </button>
              {!dailyHoroscope && (
                <button
                  onClick={handleGenerateDailyHoroscope}
                  disabled={loading}
                  className="flex-1 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg transition-all border border-cyan-300/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <span>📅</span> Daily Horoscope
                    </>
                  )}
                </button>
              )}
              <button
                onClick={handlePrint}
                className="flex-1 py-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-all border border-purple-300/30 flex items-center justify-center gap-2"
              >
                <span>🖨️</span> Print
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 text-center text-xs text-purple-300/70 no-print">
          An artistic exploration of prediction systems ::: Blending ancient divination with machine learning ::: Birth details are sent to our AI / machine for analysis - they are not saved after your predictions have been generated
        </div>

        <div className="text-xs text-center text-purple-300/70">
          Created by <a href="https://kathodonnell.art">Kath O'Donnell</a> vibecoding with <a href="https://claude.ai">Claude</a> ::: All Rights Reserved
        </div>
      
      </div>
    </div>
  );
};

export default AstroMLExperience;
