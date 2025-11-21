'use client';

import { useState } from 'react';

export default function TournamentBracket() {
  const [roomCode, setRoomCode] = useState('PONG-2847');
  const [copied, setCopied] = useState(false);
  
  // Tournament state
  const [tournament, setTournament] = useState({
    semifinals: [
      { id: 1, player1: 'Player 1', player2: 'Player 2', winner: null },
      { id: 2, player1: 'Player 3', player2: 'Player 4', winner: null }
    ],
    final: { player1: null, player2: null, winner: null }
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = () => {
    // Placeholder for invite functionality
    alert('Invite functionality - connect to your backend later!');
  };

  const selectWinner = (round, matchId, winner) => {
    if (round === 'semifinal') {
      const newSemifinals = [...tournament.semifinals];
      const matchIndex = newSemifinals.findIndex(m => m.id === matchId);
      newSemifinals[matchIndex].winner = winner;
      
      const newFinal = { ...tournament.final };
      if (matchIndex === 0) {
        newFinal.player1 = winner;
      } else {
        newFinal.player2 = winner;
      }
      
      setTournament({ ...tournament, semifinals: newSemifinals, final: newFinal });
    } else if (round === 'final') {
      setTournament({
        ...tournament,
        final: { ...tournament.final, winner }
      });
    }
  };

  // Simple SVG Icons
  const TrophyIcon = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
  );

  const UserIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );

  const CopyIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );

  const ShareIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
  );

  const SmallTrophyIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-purple-500/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-yellow-400">
                  <TrophyIcon />
                </span>
                Pong Tournament
              </h1>
              <p className="text-purple-300">4 Players • Single Elimination</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-3 rounded-lg border border-purple-500/30">
                <span className="text-purple-300 text-sm font-medium">Room Code:</span>
                <span className="text-white font-mono font-bold text-lg">{roomCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="ml-2 p-1 hover:bg-purple-500/20 rounded transition-colors text-purple-400"
                  title="Copy code"
                >
                  <CopyIcon />
                </button>
              </div>
              
              <button
                onClick={handleInvite}
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <ShareIcon />
                Invite Players
              </button>
            </div>
          </div>
          
          {copied && (
            <div className="mt-3 text-green-400 text-sm font-medium">
              ✓ Room code copied to clipboard!
            </div>
          )}
        </div>

        {/* Bracket */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-4 lg:items-center">
          {/* Semifinals */}
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-purple-300">Semifinals</h2>
            </div>
            
            {tournament.semifinals.map((match, idx) => (
              <div key={match.id} className="relative">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 overflow-hidden">
                  <div className="bg-purple-900/30 px-4 py-2 border-b border-purple-500/20">
                    <p className="text-purple-300 text-sm font-medium">Match {idx + 1}</p>
                  </div>
                  
                  <div className="p-2 space-y-2">
                    <button
                      onClick={() => selectWinner('semifinal', match.id, match.player1)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        match.winner === match.player1
                          ? 'bg-green-500/20 border-2 border-green-500'
                          : 'bg-slate-700/50 hover:bg-slate-700 border-2 border-transparent'
                      }`}
                    >
                      <span className={match.winner === match.player1 ? 'text-green-400' : 'text-purple-400'}>
                        <UserIcon />
                      </span>
                      <span className={`font-medium ${match.winner === match.player1 ? 'text-green-300' : 'text-white'}`}>
                        {match.player1}
                      </span>
                      {match.winner === match.player1 && (
                        <span className="ml-auto text-green-400 font-bold">✓</span>
                      )}
                    </button>
                    
                    <button
                      onClick={() => selectWinner('semifinal', match.id, match.player2)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        match.winner === match.player2
                          ? 'bg-green-500/20 border-2 border-green-500'
                          : 'bg-slate-700/50 hover:bg-slate-700 border-2 border-transparent'
                      }`}
                    >
                      <span className={match.winner === match.player2 ? 'text-green-400' : 'text-purple-400'}>
                        <UserIcon />
                      </span>
                      <span className={`font-medium ${match.winner === match.player2 ? 'text-green-300' : 'text-white'}`}>
                        {match.player2}
                      </span>
                      {match.winner === match.player2 && (
                        <span className="ml-auto text-green-400 font-bold">✓</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Connector Lines - Hidden on mobile */}
          <div className="hidden lg:flex items-center justify-center">
            <svg className="w-full h-full max-h-96" viewBox="0 0 100 200" preserveAspectRatio="none">
              <path d="M 0 50 L 40 50 L 50 100 L 40 150 L 0 150" fill="none" stroke="rgb(168 85 247 / 0.3)" strokeWidth="2"/>
            </svg>
          </div>

          {/* Final */}
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-yellow-300 flex items-center justify-center gap-2">
                <span className="text-yellow-400">
                  <SmallTrophyIcon />
                </span>
                Final
              </h2>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border-2 border-yellow-500/30 overflow-hidden">
              <div className="bg-yellow-900/30 px-4 py-2 border-b border-yellow-500/20">
                <p className="text-yellow-300 text-sm font-medium">Championship Match</p>
              </div>
              
              <div className="p-2 space-y-2">
                <button
                  onClick={() => tournament.final.player1 && selectWinner('final', null, tournament.final.player1)}
                  disabled={!tournament.final.player1}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    tournament.final.winner === tournament.final.player1
                      ? 'bg-yellow-500/20 border-2 border-yellow-500'
                      : tournament.final.player1
                      ? 'bg-slate-700/50 hover:bg-slate-700 border-2 border-transparent'
                      : 'bg-slate-900/50 border-2 border-dashed border-slate-600'
                  }`}
                >
                  <span className={tournament.final.winner === tournament.final.player1 ? 'text-yellow-400' : tournament.final.player1 ? 'text-purple-400' : 'text-slate-600'}>
                    <UserIcon />
                  </span>
                  <span className={`font-medium ${tournament.final.winner === tournament.final.player1 ? 'text-yellow-300' : tournament.final.player1 ? 'text-white' : 'text-slate-500'}`}>
                    {tournament.final.player1 || 'Waiting...'}
                  </span>
                  {tournament.final.winner === tournament.final.player1 && (
                    <span className="ml-auto text-yellow-400">
                      <SmallTrophyIcon />
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => tournament.final.player2 && selectWinner('final', null, tournament.final.player2)}
                  disabled={!tournament.final.player2}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    tournament.final.winner === tournament.final.player2
                      ? 'bg-yellow-500/20 border-2 border-yellow-500'
                      : tournament.final.player2
                      ? 'bg-slate-700/50 hover:bg-slate-700 border-2 border-transparent'
                      : 'bg-slate-900/50 border-2 border-dashed border-slate-600'
                  }`}
                >
                  <span className={tournament.final.winner === tournament.final.player2 ? 'text-yellow-400' : tournament.final.player2 ? 'text-purple-400' : 'text-slate-600'}>
                    <UserIcon />
                  </span>
                  <span className={`font-medium ${tournament.final.winner === tournament.final.player2 ? 'text-yellow-300' : tournament.final.player2 ? 'text-white' : 'text-slate-500'}`}>
                    {tournament.final.player2 || 'Waiting...'}
                  </span>
                  {tournament.final.winner === tournament.final.player2 && (
                    <span className="ml-auto text-yellow-400">
                      <SmallTrophyIcon />
                    </span>
                  )}
                </button>
              </div>
            </div>

            {tournament.final.winner && (
              <div className="mt-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-xl p-6 text-center">
                <div className="text-yellow-400 mx-auto mb-2 flex justify-center">
                  <TrophyIcon />
                </div>
                <h3 className="text-2xl font-bold text-yellow-300 mb-1">Champion!</h3>
                <p className="text-white text-lg font-medium">{tournament.final.winner}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}