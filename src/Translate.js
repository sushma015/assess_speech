import React, { useEffect, useState } from "react";
import countries from "./languages";
const Translate = () => {
  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');
  const [fromLanguage, setFromLanguage] = useState('en-GB');
  const [toLanguage, setToLanguage] = useState('hi-IN');
  const [languages, setLanguages] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLanguages(countries);

    const exchageIcon = document.querySelector(".exchange");
    exchageIcon.addEventListener("click", handleExchange);

    return () => {
      exchageIcon.removeEventListener("click", handleExchange);
    };
  }, []);

  const handleExchange = () => {
    let tempText = fromText;
    let tempLang = fromLanguage;
    setFromText(toText);
    setToText(tempText);
    setFromLanguage(toLanguage);
    setToLanguage(tempLang);
  };

  const handleTranslate = () => {
    if (!fromText.trim()) return;
    setLoading(true);
    let apiUrl = `https://api.mymemory.translated.net/get?q=${fromText}&langpair=${fromLanguage}|${toLanguage}`;
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        console.log(data); // Log the API response for debugging
        setToText(data.responseData.translatedText);
        data.matches.forEach((data) => {
          if (data.id === 0) {
            setToText(data.translation);
          }
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  const handleIconClick = (target, id) => {
    if (!fromText || !toText) return;

    if (target.classList.contains('fa-copy')) {
      if (id === 'from') {
        navigator.clipboard.writeText(fromText);
      } else {
        navigator.clipboard.writeText(toText);
      }
    } else {
      let utterance;
      if (id === "from") {
        utterance = new SpeechSynthesisUtterance(fromText);
        utterance.lang = fromLanguage;
      } else {
        utterance = new SpeechSynthesisUtterance(toText);
        utterance.lang = toLanguage;
      }
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="container">
      <div className="wrapper">
        <div className="text-input">
          <textarea
            spellCheck="false"
            className="from-text"
            placeholder="Enter text"
            value={fromText}
            onChange={(e) => setFromText(e.target.value)}
          ></textarea>
          <textarea
            spellCheck="false"
            readOnly
            disabled
            className="to-text"
            placeholder="Translation"
            value={toText}
          ></textarea>
        </div>
        <ul className="controls">
          <li className="row from">
            <div className="icons">
              <i id="from" className="fa-solid fa-volume-high" onClick={(e) => handleIconClick(e.target, 'from')}></i>
              <i id="from" className="fa-solid fa-copy" onClick={(e) => handleIconClick(e.target, 'from')}></i>
            </div>
            <select value={fromLanguage} onChange={(e) => setFromLanguage(e.target.value)}>
              {Object.entries(languages).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </li>
          <li className="exchange" onClick={handleExchange}>
            <i className="fa-solid fa-arrow-right-arrow-left"></i>
          </li>
          <li className="row to">
            <select value={toLanguage} onChange={(e) => setToLanguage(e.target.value)}>
              {Object.entries(languages).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
            <div className="icons">
              <i id="to" className="fa-solid fa-copy" onClick={(e) => handleIconClick(e.target, 'to')}></i>
              <i id="to" className="fa-solid fa-volume-high" onClick={(e) => handleIconClick(e.target, 'to')}></i>
            </div>
          </li>
        </ul>
      </div>
      <button onClick={handleTranslate} disabled={loading}>
        {loading ? 'Translating...' : 'Translate Text'}
      </button>
    </div>
  );
};

export default Translate;
