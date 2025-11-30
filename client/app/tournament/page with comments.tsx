import React from 'react';

/**
 * ============================================================================
 * TYPESCRIPT INTERFACES
 * ============================================================================
 * Interfaces define the "shape" of data objects. This helps catch errors
 * while coding. If you try to access a property that doesn't exist,
 * TypeScript will warn you.
 */

// 1. Interface for a single Match
// This defines what data a single game contains.
interface Match {
  id: number;              // Unique identifier for the match
  player1: string | null;  // Name of Player 1 (null if not determined yet)
  player2: string | null;  // Name of Player 2 (null if not determined yet)
  winner: 'player1' | 'player2' | null; // The result: 'player1', 'player2', or null if pending
}

// 2. Interface for the Tournament Data
// This groups all the matches together.
interface TournamentData {
  semiFinals: Match[]; // An array of Match objects for the semi-finals
  final: Match;        // A single Match object for the final
}

/**
 * ============================================================================
 * MAIN COMPONENT: PongTournament
 * ============================================================================
 * This is the functional component that renders the page.
 */
export default function PongTournament() {
  
  // A constant string for the tournament ID (displayed at the top)
  const tournamentCode: string = "PONG-2024-XYZ";
  
  /**
   * MOCK DATA
   * In a real application, you would fetch this from a database or API.
   * Here, we hardcode it to simulate a specific state of the tournament.
   */
  const tournament: TournamentData = {
    // Round 1: Semi-Finals
    semiFinals: [
      {
        id: 1,
        player1: "Alice",
        player2: "Bob",
        winner: 'player1' // Result: Alice won
      },
      {
        id: 2,
        player1: "Charlie",
        player2: "Diana",
        winner: null // Result: Not played yet (Pending)
      }
    ],
    // Round 2: Final
    final: {
      id: 3,
      player1: "Alice", // Alice advanced from Match 1
      player2: "Charlie", // Let's pretend Charlie advanced from Match 2
      winner: "player1" // Alice wins the whole tournament
    }
  };

  /**
   * ==========================================================================
   * HELPER FUNCTION: getPlayerClass
   * ==========================================================================
   * This function returns the CSS class string for a player's box.
   * Logic:
   * 1. If match isn't over -> Return GRAY (Neutral)
   * 2. If this player won -> Return GREEN (Success)
   * 3. If this player lost -> Return RED (Failure/Faded)
   * * @param match - The match object to analyze
   * @param playerKey - Are we checking 'player1' or 'player2'?
   */
  const getPlayerClass = (match: Match, playerKey: 'player1' | 'player2'): string => {
    // Check if the match has a winner yet
    if (!match.winner) {
      // No winner: Return neutral styles
      // bg-white: White background
      // border-gray-200: Light gray border
      // text-gray-800: Dark gray text
      return "bg-white border-gray-200 text-gray-800";
    }
    
    // Check if THIS specific player is the winner
    if (match.winner === playerKey) {
      // Winner: Return success styles
      // bg-green-50: Very light green background
      // border-green-500: Medium green border
      // text-green-700: Dark green text
      // font-bold: Thick text
      return "bg-green-50 border-green-500 text-green-700 font-bold shadow-sm";
    }
    
    // If there is a winner, but it's not this player, they lost.
    // Loser: Return failure styles
    // bg-red-50: Very light red background
    // border-red-300: Light red border
    // text-red-400: Faded red text
    // opacity-60: Make the whole box slightly transparent (faded out)
    return "bg-red-50 border-red-300 text-red-400 opacity-60";
  };

  /**
   * ==========================================================================
   * HELPER FUNCTION: getWinnerText
   * ==========================================================================
   * Returns the actual name of the winner string.
   */
  const getWinnerText = (match: Match): string => {
    if (!match.winner) return "TBD"; // Return "TBD" if pending
    
    // Dynamic property access:
    // If match.winner is 'player1', this returns match.player1 ("Alice")
    return match[match.winner] || "Unknown";
  };

  // ==========================================================================
  // RENDER (JSX)
  // ==========================================================================
  return (
    // Main Wrapper
    // min-h-screen: Ensures the background covers at least the whole screen height
    // bg-gray-50: Sets a subtle light gray background for the whole page
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      
      {/* Container to center content and limit width */}
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <div className="mb-8">
          {/* Card Component */}
          {/* flex: Enables flexbox layout (items side-by-side) */}
          {/* justify-between: Pushes items to far left and far right */}
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
            
            {/* Left Side: Code */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Tournament Code</p>
              <p className="text-2xl font-bold text-gray-800 font-mono">
                {tournamentCode}
              </p>
            </div>

            {/* Middle: Status */}
            <p className="text-2xl font-bold text-gray-800 font-mono">Status: In Progress</p>
            
            {/* Right Side: Button */}
            {/* transition: Smoothly animates hover effects */}
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition">
              Invite Players
            </button>
          </div>
        </div>

        {/* --- TITLE --- */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Tournament Bracket
        </h1>

        {/* --- BRACKET GRID LAYOUT --- */}
        {/* grid: Turns on Grid layout */}
        {/* grid-cols-3: Creates 3 equal columns */}
        {/* gap-8: Adds 2rem (32px) of space between columns */}
        <div className="grid grid-cols-3 gap-8 items-center">
          
          {/* COLUMN 1: SEMI-FINALS 
             Contains two matches stacked vertically
          */}
          <div className="space-y-16"> {/* Adds vertical space between matches */}
            
            {/* --- MATCH 1 --- */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-xs text-gray-500 uppercase mb-4 text-center">
                Semi-Final 1
              </div>
              
              <div className="space-y-3">
                {/* Player 1 Box */}
                {/* We insert the dynamic class string from getPlayerClass() here */}
                <div className={`p-3 border-2 rounded text-center transition-all ${getPlayerClass(tournament.semiFinals[0], 'player1')}`}>
                  {tournament.semiFinals[0].player1}
                </div>
                
                <div className="text-center text-sm text-gray-400 font-semibold">VS</div>
                
                {/* Player 2 Box */}
                <div className={`p-3 border-2 rounded text-center transition-all ${getPlayerClass(tournament.semiFinals[0], 'player2')}`}>
                  {tournament.semiFinals[0].player2}
                </div>
              </div>
              {/* NOTE: Winner section removed from semi-finals as requested */}
            </div>

            {/* --- MATCH 2 --- */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-xs text-gray-500 uppercase mb-4 text-center">
                Semi-Final 2
              </div>
              
              <div className="space-y-3">
                {/* Player 1 Box */}
                <div className={`p-3 border-2 rounded text-center transition-all ${getPlayerClass(tournament.semiFinals[1], 'player1')}`}>
                  {tournament.semiFinals[1].player1}
                </div>
                
                <div className="text-center text-sm text-gray-400 font-semibold">VS</div>
                
                {/* Player 2 Box */}
                <div className={`p-3 border-2 rounded text-center transition-all ${getPlayerClass(tournament.semiFinals[1], 'player2')}`}>
                  {tournament.semiFinals[1].player2}
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: VISUAL CONNECTOR
             This is just a line to visually link the left column to the right column.
          */}
          <div className="flex justify-center items-center">
            {/* border-l-2/border-r-2: Creates the vertical lines */}
            <div className="h-full border-l-2 border-r-2 border-gray-300 w-full"></div>
          </div>

          {/* COLUMN 3: GRAND FINAL
             Contains the single final match.
          */}
          <div className="flex items-center">
            {/* Dynamic Container Class:
               If there is a winner, we add 'ring-2 ring-yellow-400' (Gold Outline)
               and 'shadow-xl' to make it pop.
            */}
            <div className={`bg-white rounded-lg shadow-md p-6 w-full transition-all duration-500 ${tournament.final.winner ? 'shadow-xl ring-2 ring-yellow-400' : ''}`}>
              <div className="text-xs text-gray-500 uppercase mb-4 text-center">
                Grand Final
              </div>
              
              <div className="space-y-3">
                {/* Final Player 1 */}
                <div className={`p-3 border-2 rounded text-center transition-all ${getPlayerClass(tournament.final, 'player1')}`}>
                  {tournament.final.player1 || "TBD"}
                </div>
                
                <div className="text-center text-sm text-gray-400 font-semibold">VS</div>
                
                {/* Final Player 2 */}
                <div className={`p-3 border-2 rounded text-center transition-all ${getPlayerClass(tournament.final, 'player2')}`}>
                  {tournament.final.player2 || "TBD"}
                </div>
              </div>
              
              {/* SPECIAL CHAMPION SECTION 
                 Only displayed in the final match card.
              */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">Champion:</div>
                
                {/* Ternary Operator: (Condition) ? (True) : (False) */}
                {tournament.final.winner ? (
                  // --- CHAMPION STYLE ---
                  // bg-gradient-to-r: Creates a gold gradient
                  // animate-pulse: Adds a heartbeat animation
                  // transform scale-105: Makes it slightly larger than normal
                  <div className="p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-lg text-center text-yellow-800 font-extrabold shadow-lg transform scale-105 animate-pulse">
                    🏆 {getWinnerText(tournament.final)} 🏆
                  </div>
                ) : (
                  // --- PENDING STYLE ---
                  // Standard gray box
                  <div className="p-2 bg-gray-100 rounded text-center text-sm text-gray-400">
                    TBD
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}