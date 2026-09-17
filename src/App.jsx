import { useMemo, useRef, useState } from 'react';
import './App.css';

const stages = [
  {
    title: 'Stage 1',
    name: 'Paint the key',
    prompt: 'Make orange to open the lab door.',
    prizeCards: ['How', 'What', 'Who'],
    answer: 'What',
  },
  {
    title: 'Stage 2',
    name: 'Marker mystery',
    prompt: 'Draw on the round paper, then choose the liquid that spreads color.',
    prizeCards: ['Color', 'Sound', 'Shape'],
    answer: 'Color',
  },
  {
    title: 'Stage 3',
    name: 'Pond explorer',
    prompt: 'Use Liquid A and B to discover every pond color.',
    prizeCards: ['Next', 'Now', 'Maybe'],
    answer: 'Next',
  },
];

const paintColors = {
  red: '#f04438',
  blue: '#2f80ed',
  yellow: '#f6c945',
};

const colorRecipes = {
  red: '#f04438',
  blue: '#2f80ed',
  yellow: '#f6c945',
  'red-yellow': '#f97316',
  'blue-red': '#7c3aed',
  'blue-yellow': '#2fbf71',
  'blue-red-yellow': '#68523c',
};

const colorNames = {
  '': 'white',
  red: 'red',
  blue: 'blue',
  yellow: 'yellow',
  'red-yellow': 'orange',
  'blue-red': 'purple',
  'blue-yellow': 'green',
  'blue-red-yellow': 'muddy brown',
};

const pondTargets = [
  { name: 'Red', color: '#e53935', value: -3 },
  { name: 'Orange', color: '#fb8c00', value: -2 },
  { name: 'Yellow', color: '#fdd835', value: -1 },
  { name: 'Green', color: '#43a047', value: 1 },
  { name: 'Blue', color: '#1e88e5', value: 2 },
  { name: 'Indigo', color: '#3949ab', value: 3 },
  { name: 'Purple', color: '#8e24aa', value: 0 },
  { name: 'Pink', color: '#ec407a', value: -4 },
];

const pondByValue = new Map(pondTargets.map((target) => [target.value, target]));

function recipeKey(colors) {
  return [...colors].sort().join('-');
}

function App() {
  const [stageIndex, setStageIndex] = useState(0);
  const [message, setMessage] = useState('Welcome, junior scientist.');
  const [showPrize, setShowPrize] = useState(false);
  const [collectedWords, setCollectedWords] = useState([]);

  const [keyPaints, setKeyPaints] = useState([]);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [chromatography, setChromatography] = useState(false);
  const [pondLevel, setPondLevel] = useState(0);
  const [foundPondValues, setFoundPondValues] = useState([0]);

  const drawingRef = useRef(null);
  const isDrawing = useRef(false);

  const stage = stages[stageIndex];
  const keyRecipe = recipeKey(keyPaints);
  const keyColor = colorRecipes[keyRecipe] ?? '#f7f3e8';
  const keyMixName = colorNames[keyRecipe] ?? 'mystery color';
  const pond = pondByValue.get(pondLevel) ?? pondByValue.get(0);
  const foundAllPondColors = pondTargets.every((target) =>
    foundPondValues.includes(target.value),
  );

  const progressLabel = useMemo(
    () => `${collectedWords.length} / ${stages.length} words collected`,
    [collectedWords.length],
  );

  function addPaint(color) {
    setShowPrize(false);
    setKeyPaints((current) => {
      const nextPaints = current.includes(color) ? current : [...current, color];
      const nextMixName = colorNames[recipeKey(nextPaints)] ?? 'mystery color';

      setMessage(`The key has ${nextMixName}. What happens if we mix more?`);
      return nextPaints;
    });
  }

  function resetKey() {
    setKeyPaints([]);
    setMessage('Clean water washed the key white again.');
  }

  function tryDoor() {
    if (recipeKey(keyPaints) === 'red-yellow') {
      setMessage('Orange key unlocked the door.');
      setShowPrize(true);
      return;
    }

    setMessage('Try again. Red and yellow make the orange key.');
  }

  function getCanvasPoint(event) {
    const canvas = drawingRef.current;
    const rect = canvas.getBoundingClientRect();
    const pointer = event.touches?.[0] ?? event;

    return {
      x: ((pointer.clientX - rect.left) / rect.width) * canvas.width,
      y: ((pointer.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function startDrawing(event) {
    const canvas = drawingRef.current;
    const context = canvas.getContext('2d');
    const point = getCanvasPoint(event);

    isDrawing.current = true;
    context.lineWidth = 10;
    context.lineCap = 'round';
    context.strokeStyle = '#374151';
    context.beginPath();
    context.moveTo(point.x, point.y);
    setHasDrawing(true);
  }

  function draw(event) {
    if (!isDrawing.current) return;
    event.preventDefault();
    const context = drawingRef.current.getContext('2d');
    const point = getCanvasPoint(event);

    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function stopDrawing() {
    isDrawing.current = false;
  }

  function clearDrawing() {
    const canvas = drawingRef.current;
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
    setChromatography(false);
    setMessage('Fresh paper is ready.');
  }

  function chooseLiquid(liquid) {
    if (liquid === 'oil') {
      setChromatography(false);
      setMessage('Try again. Oil keeps the marker color from spreading.');
      return;
    }

    if (!hasDrawing) {
      setMessage('Add marker lines first, then test the water.');
      return;
    }

    setChromatography(true);
    setMessage('Water carried the marker colors across the paper.');
    setShowPrize(true);
  }

  function changePond(delta) {
    setShowPrize(false);
    setPondLevel((current) => {
      const next = Math.max(-4, Math.min(3, current + delta));
      setFoundPondValues((found) =>
        found.includes(next) ? found : [...found, next],
      );
      setMessage(
        delta < 0
          ? 'Liquid A nudged the pond toward warm colors.'
          : 'Liquid B nudged the pond toward cool colors.',
      );
      return next;
    });
  }

  function checkPond() {
    if (foundAllPondColors) {
      setMessage('Every pond color is in your science notebook.');
      setShowPrize(true);
      return;
    }

    setMessage('Try again. Find every color chip around the pond.');
  }

  function resetPond() {
    setPondLevel(0);
    setFoundPondValues((found) => (found.includes(0) ? found : [...found, 0]));
    setMessage('The pond is purple again.');
  }

  function collectWord(word) {
    if (word !== stage.answer) {
      setMessage(`Try again. This stage is looking for "${stage.answer}".`);
      return;
    }

    const nextWords = [...collectedWords, word];
    setCollectedWords(nextWords);
    setShowPrize(false);

    if (stageIndex === stages.length - 1) {
      setMessage('You built the secret question.');
      return;
    }

    setStageIndex((current) => current + 1);
    setMessage(`${word} card collected. Step into the next experiment.`);
  }

  function restartLab() {
    setStageIndex(0);
    setMessage('Welcome back, junior scientist.');
    setShowPrize(false);
    setCollectedWords([]);
    setKeyPaints([]);
    setHasDrawing(false);
    setChromatography(false);
    setPondLevel(0);
    setFoundPondValues([0]);
  }

  function renderStage() {
    if (collectedWords.length === stages.length) {
      return (
        <section className="lab-finale" aria-label="final word cards">
          <div>
            <p className="eyebrow">Final discovery</p>
            <h2>Read the science question.</h2>
          </div>
          <div className="final-cards">
            {collectedWords.map((word) => (
              <span className="word-card final-word" key={word}>
                {word}
              </span>
            ))}
          </div>
          <button className="primary-action" onClick={restartLab}>
            Start a new lab
          </button>
        </section>
      );
    }

    if (showPrize) {
      return (
        <section className="prize-panel" aria-label="word card choices">
          <p className="eyebrow">Word cards unlocked</p>
          <h2>Pick the card for this stage.</h2>
          <div className="word-grid">
            {stage.prizeCards.map((word) => (
              <button
                className="word-card"
                key={word}
                onClick={() => collectWord(word)}
                type="button"
              >
                {word}
              </button>
            ))}
          </div>
        </section>
      );
    }

    if (stageIndex === 0) {
      return (
        <section className="experiment stage-one" aria-label="color mixing stage">
          <div className="tool-shelf">
            {Object.entries(paintColors).map(([name, color]) => (
              <button
                className="paint-pot"
                key={name}
                onClick={() => addPaint(name)}
                style={{ '--paint': color }}
                type="button"
              >
                <span />
                {name}
              </button>
            ))}
            <button className="water-bucket" onClick={resetKey} type="button">
              Water reset
            </button>
          </div>
          <div className="key-station">
            <div className="key-shine" />
            <div className="mix-equation" aria-label={`color mix makes ${keyMixName}`}>
              {keyPaints.length === 0 ? (
                <span className="empty-mix">Pick paint colors</span>
              ) : (
                <>
                  {keyPaints.map((color, index) => (
                    <span className="mix-piece" key={color}>
                      {index > 0 && <strong>+</strong>}
                      <i style={{ '--swatch': paintColors[color] }} />
                      <em>{color}</em>
                    </span>
                  ))}
                  <strong>=</strong>
                  <span className="mix-piece result">
                    <i style={{ '--swatch': keyColor }} />
                    <em>{keyMixName}</em>
                  </span>
                </>
              )}
            </div>
            <div
              className="science-key"
              style={{ '--key-color': keyColor }}
              aria-label="painted key"
            >
              <span />
            </div>
          </div>
          <button className="primary-action" onClick={tryDoor} type="button">
            Open door
          </button>
        </section>
      );
    }

    if (stageIndex === 1) {
      return (
        <section className="experiment stage-two" aria-label="chromatography stage">
          <div className="paper-lab">
            <canvas
              aria-label="round chromatography paper"
              className="paper-canvas"
              height="360"
              onMouseDown={startDrawing}
              onMouseLeave={stopDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
              onTouchStart={startDrawing}
              ref={drawingRef}
              width="360"
            />
            {chromatography && <div className="color-bloom" />}
          </div>
          <div className="liquid-tray">
            <button onClick={() => chooseLiquid('water')} type="button">
              Water
            </button>
            <button onClick={() => chooseLiquid('oil')} type="button">
              Oil
            </button>
            <button onClick={clearDrawing} type="button">
              New paper
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="experiment stage-three" aria-label="pond color stage">
        <div className="liquid-toolbar">
          <button
            draggable
            onClick={() => changePond(-1)}
            onDragEnd={() => changePond(-1)}
            type="button"
          >
            Liquid A
          </button>
          <button
            draggable
            onClick={() => changePond(1)}
            onDragEnd={() => changePond(1)}
            type="button"
          >
            Liquid B
          </button>
          <button onClick={resetPond} type="button">
            Purple reset
          </button>
        </div>
        <div
          className="pond"
          style={{ '--pond-color': pond.color }}
          aria-label={`${pond.name} pond`}
        >
          <span>{pond.name}</span>
        </div>
        <div className="color-checklist" aria-label="found pond colors">
          {pondTargets.map((target) => (
            <span
              className={foundPondValues.includes(target.value) ? 'found' : ''}
              key={target.name}
              style={{ '--chip': target.color }}
            >
              {target.name}
            </span>
          ))}
        </div>
        <button className="primary-action" onClick={checkPond} type="button">
          Check colors
        </button>
      </section>
    );
  }

  return (
    <main className="App">
      <section className="lab-shell">
        <header className="lab-header">
          <div>
            <p className="eyebrow">Virtual Science Lab</p>
            <h1>What Color Next</h1>
          </div>
          <div className="progress-pill">{progressLabel}</div>
        </header>

        <div className="stage-banner">
          <div>
            <p>{stage?.title ?? 'Finale'}</p>
            <h2>{stage?.name ?? 'Question built'}</h2>
          </div>
          <span>{stage?.prompt ?? 'You collected every word card.'}</span>
        </div>

        {renderStage()}

        <p className="lab-message" role="status">
          {message}
        </p>
      </section>
    </main>
  );
}

export default App;
