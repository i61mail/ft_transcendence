import { playerInfo } from './playerInfo.types';

export enum trnmtStatus
{
    waiting,
    startingSemi,
    playingSemi,
    startingFinal,
    playingFinal,
    finished,
    close
}

export interface Match
{
    player1: playerInfo | null;
    player2: playerInfo | null;
    winner: playerInfo | null;
}

export interface TournamentData
{
    host: playerInfo | null;
    code: string;
    status: trnmtStatus;
    semi: Match[];
    final: Match;
}

export interface SanitizedPlayer
{
    id: playerInfo['id'];
    username: playerInfo['username'];
}

export interface SanitizedMatch
{
    player1: SanitizedPlayer | null;
    player2: SanitizedPlayer | null;
    winner: SanitizedPlayer | null;
}

export interface SanitizedTournamentData
{
    host: SanitizedPlayer | null;
    code: string;
    status: trnmtStatus;
    semi: SanitizedMatch[];
    final: SanitizedMatch;
}