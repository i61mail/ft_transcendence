export enum trnmtStatus
{
    waiting,
    startingSemi,
    playingSemi,
    startingFinal,
    playingFinal,
    finished
}

interface Match
{
    player1: string;
    player2: string;
    winner: 'player1' | 'player2' | null;
}

export interface TournamentData
{
    code: string;
    isPlaying: number;
    status: string;
    semiFinals: Match[];
    final: Match;
}
