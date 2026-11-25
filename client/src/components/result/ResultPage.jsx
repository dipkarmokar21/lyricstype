// ═══════════════════════════════════════════════════════════════
// ResultPage — Post-race stats, NitChat funnel, chat panel
// ═══════════════════════════════════════════════════════════════
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useGameStore from '@/stores/gameStore';
import { AVATARS } from '@/utils/constants';
import { calcWpm, formatTime } from '@/utils/helpers';
import './ResultPage.css';

export default function ResultPage() {
  const navigate = useNavigate();
  const store = useGameStore();
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);

  const {
    correctKeystrokes, totalKeystrokes, maxCombo, score, startTime,
    handle, avatarIdx, opponent, mode, personalBest, getSelectedTrack,
    prepareRace, chatMessages, addChatMessage,
  } = store;

  const track = getSelectedTrack();
  const finalWpm = calcWpm(correctKeystrokes, startTime);
  const finalAcc = totalKeystrokes === 0 ? 100 : Math.round((correctKeystrokes / totalKeystrokes) * 100);
  const elapsedSec = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  const isWinner = !opponent?.finished || finalWpm >= (opponent?.wpm || 0);
  const isPB = finalWpm >= personalBest;

  const handlePlayAgain = () => {
    prepareRace();
    navigate('/race');
  };

  const handleBackToLobby = () => {
    store.resetToLobby();
    navigate('/');
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    addChatMessage({ text: chatInput.trim(), who: 'me' });
    setChatInput('');

    if (opponent) {
      const replies = [
        'haha nice speed! wanna run another track?',
        'love the vibe on this one honestly ✨',
        'my fingers almost slipped on the last line 😂',
        'cool matching with you on NitChat!',
      ];
      setTimeout(() => {
        addChatMessage({ text: replies[Math.floor(Math.random() * replies.length)], who: 'them' });
      }, 750);
    }
  };

  return (
    <div className="result-page animate-fadeUp">
      <div className="glass-card result-card">
        <div className="result-header">
          <span className={`result-badge ${mode !== 'solo' && !isWinner ? 'lost' : ''}`}>
            {mode === 'solo' ? 'SOLO CHILL COMPLETE' : isWinner ? '🏆 VICTORY!' : 'YOU LOST'}
          </span>
          <h2 className="result-title">
            {mode === 'solo'
              ? isPB ? 'New Personal Best!' : 'Smooth Session!'
              : isWinner
              ? 'You Won the Match!'
              : 'You Lost the Match'}
          </h2>
          <p className="result-subtitle">
            {mode !== 'solo' && !isWinner
              ? `Try again next time! You finished "${track?.title}" at ${finalWpm} WPM with ${finalAcc}% accuracy.`
              : `Finished "${track?.title}" at ${finalWpm} WPM with ${finalAcc}% accuracy`}
          </p>
        </div>

        <div className={`result-grid ${mode === 'solo' ? 'solo-only' : ''}`}>
          <div className="stat-card player-card">
            {isWinner && mode !== 'solo' && <div className="winner-crown">Winner</div>}
            <div className="stat-card-header">
              <div className="stat-avatar" dangerouslySetInnerHTML={{ __html: AVATARS[avatarIdx] }} />
              <div>
                <div className="stat-name">{handle} <span className="you-tag">YOU</span></div>
                <div className="stat-time">Time: {formatTime(elapsedSec)}</div>
              </div>
            </div>
            <div className="stat-grid">
              <div className="stat-box"><div className="stat-val wpm-color">{finalWpm}</div><div className="stat-label">WPM</div></div>
              <div className="stat-box"><div className="stat-val">{finalAcc}%</div><div className="stat-label">ACC</div></div>
              <div className="stat-box"><div className="stat-val combo-color">{maxCombo}x</div><div className="stat-label">MAX CMB</div></div>
              <div className="stat-box"><div className="stat-val">{score}</div><div className="stat-label">SCORE</div></div>
            </div>
          </div>

          {opponent && (
            <div className="stat-card opp-card">
              {!isWinner && <div className="winner-crown">Winner</div>}
              <div className="stat-card-header">
                <div className="stat-avatar" dangerouslySetInnerHTML={{ __html: AVATARS[opponent.avatarIdx || 1] }} />
                <div>
                  <div className="stat-name">
                  {opponent.name} <span className="opp-tag">{mode === 'friend' ? 'FRIEND' : 'STRANGER'}</span>
                </div>
                  <div className="stat-time">Opponent</div>
                </div>
              </div>
              <div className="stat-grid">
                <div className="stat-box"><div className="stat-val opp-wpm-color">{opponent.wpm || 0}</div><div className="stat-label">WPM</div></div>
                <div className="stat-box"><div className="stat-val">97%</div><div className="stat-label">ACC</div></div>
                <div className="stat-box"><div className="stat-val combo-color">12x</div><div className="stat-label">MAX CMB</div></div>
                <div className="stat-box"><div className="stat-val">420</div><div className="stat-label">SCORE</div></div>
              </div>
            </div>
          )}
        </div>

        {/* NitChat Bridge Funnel */}
        <div className="nitchat-funnel">
          <div className="funnel-left">
            <div className="funnel-pill"><span className="online-dot" /> NitChat Instant Match</div>
            <h3>{opponent ? 'Same music taste — skip the awkward intro!' : 'Ready to meet people who love the same music?'}</h3>
            <p>
              {opponent
                ? <>{opponent.name} is still in the room with shared tags: <span className="tag-highlight">{track?.tag}, Night Owl</span></>
                : <>Jump into <span className="tag-highlight">nitchat.com</span> to chat anonymously with music lovers!</>}
            </p>
          </div>
          {opponent ? (
            <button className="btn-primary funnel-btn" onClick={() => setShowChat(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Vibe Check — Start Anonymous Chat
            </button>
          ) : (
            <a href="https://nitchat.com" className="btn-primary funnel-btn">
              Open NitChat →
            </a>
          )}
        </div>

        <div className="result-actions">
          <button className="btn-primary" style={{ flex: 1 }} onClick={handlePlayAgain}>Rematch Same Track</button>
          <button className="btn-secondary" onClick={handleBackToLobby}>Back to Songs</button>
        </div>
      </div>

      {opponent && showChat && (
        <div className="glass-card chat-panel">
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-avatars">
                <span className="chat-av" dangerouslySetInnerHTML={{ __html: AVATARS[avatarIdx] }} />
                <span className="chat-av opp-av" dangerouslySetInnerHTML={{ __html: AVATARS[opponent.avatarIdx || 1] }} />
              </div>
              <div>
                <div className="chat-opp-name">{opponent.name}</div>
                <div className="chat-status"><span className="online-dot-sm" /> Online</div>
              </div>
            </div>
            <a href="https://nitchat.com" className="pill-btn">Continue on NitChat →</a>
          </div>

          <div className="chat-messages">
            <div className="chat-msg sys">You and {opponent.name} both vibed to "{track?.title}".</div>
            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.who}`}>{msg.text}</div>
            ))}
          </div>

          <form className="chat-form" onSubmit={handleSendChat}>
            <input
              className="field"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Say hi or talk about this track..."
              autoComplete="off"
            />
            <button className="btn-secondary" type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

