'use client'

import useglobalStore from '@/store/globalStore';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

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


const initialTournament: TournamentData = {
  code: "------",
  isPlaying: 1,
  status: "Searching for Tournament ...",
  semiFinals: [
    { player1: "-", player2: "-", winner: null },
    { player1: "-", player2: "-", winner: null },
  ],
  final: { player1: "-", player2: "-", winner: null },
};

type Props = {
  initialCode: string | null;
};

export default function PongTournament()
{
	const [tournament, setTournament] = useState<TournamentData>(initialTournament);
	const manager = useglobalStore();
    const sentRef = useRef<boolean>(false);
	const router = useRouter();
	const params = useSearchParams();
	const code: string | null = params.get('code');

    useEffect(() =>
    {
        if (manager.gameSocket && !sentRef.current)
        {
            console.log("starting tournament...");
			let data: any;
            if (code)
				data = { gameType: 'joinTournament', data: {code: code, id: manager.user?.id} }
			else
				data = {gameType: "tournament", data: manager.user?.id};

            manager.gameSocket.send(JSON.stringify(data));
            sentRef.current = true;
            manager.gameSocket.onmessage = (msg) =>
            {
				
				// if (msg.data == "finished")
				// 	return ;
				const state: TournamentData = JSON.parse(msg.data.toString());
				const isPlaying: number = state.isPlaying;
				// if (state.code == undefined)
				// 	return ;
				if (isPlaying &&
					(state.status == "Playing Semi-Finals" || state.status == "Playing Final Match"))
				{

					router.push('/games/tournament/play');
				}
				else
					setTournament(state);
            }
        }
    }, [manager.gameSocket])

	const getPlayerClass = (match: Match, playerKey: 'player1' | 'player2'): string =>
	{
		if (!match.winner) return "bg-white border-gray-200 text-gray-800";

		if (match.winner === playerKey)
			return "bg-green-50 border-green-500 text-green-700 font-bold shadow-sm";

		return "bg-red-50 border-red-300 text-red-400 opacity-60";
	};

	const getWinnerText = (match: Match): string =>
	{
		if (!match.winner) return "TBD";
		return match[match.winner] || "Unknown";
	};

	return (
		<div className="bg-gray-50 min-h-screen py-8 px-4">
			<div className="max-w-6xl mx-auto">
				<div className="mb-8">
					<div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 mb-1">Tournament Code</p>
							<p className="text-2xl font-bold text-gray-800 font-mono">
								{tournament.code}
							</p>
						</div>
						<p className="text-2xl font-bold text-gray-800 font-mono">{tournament.status}</p>
						<button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition">
							Invite Players
						</button>
					</div>
				</div>

				<h1 className="text-3xl font-bold text-center text-gray-800 mb-12">
					Tournament Bracket
				</h1>

				<div className="grid grid-cols-3 gap-8 items-center">

					<div className="space-y-16">

						<div className="bg-white rounded-lg shadow-md p-6">
							<div className="text-xs text-gray-500 uppercase mb-4 text-center">
								Semi-Final 1
							</div>

							<div className="space-y-3">
								<div className={`p-3 border-2 rounded text-center transition-all ${tournament.semiFinals?.[0] ? getPlayerClass(tournament.semiFinals[0], 'player1') : 'bg-white border-gray-200 text-gray-800'}`}>
									{tournament.semiFinals?.[0]?.player1 || '-'}
								</div>

								<div className="text-center text-sm text-gray-400 font-semibold">VS</div>

								<div className={`p-3 border-2 rounded text-center transition-all ${tournament.semiFinals?.[0] ? getPlayerClass(tournament.semiFinals[0], 'player2') : 'bg-white border-gray-200 text-gray-800'}`}>
									{tournament.semiFinals?.[0]?.player2 || '-'}
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg shadow-md p-6">
							<div className="text-xs text-gray-500 uppercase mb-4 text-center">
								Semi-Final 2
							</div>

							<div className="space-y-3">
								<div className={`p-3 border-2 rounded text-center transition-all ${tournament.semiFinals?.[1] ? getPlayerClass(tournament.semiFinals[1], 'player1') : 'bg-white border-gray-200 text-gray-800'}`}>
									{tournament.semiFinals?.[1]?.player1 || '-'}
								</div>

								<div className="text-center text-sm text-gray-400 font-semibold">VS</div>

								<div className={`p-3 border-2 rounded text-center transition-all ${tournament.semiFinals?.[1] ? getPlayerClass(tournament.semiFinals[1], 'player2') : 'bg-white border-gray-200 text-gray-800'}`}>
									{tournament.semiFinals?.[1]?.player2 || '-'}
								</div>
							</div>
						</div>
					</div>

					<div className="flex justify-center items-center">
						<div className="h-full border-l-2 border-r-2 border-gray-300 w-full"></div>
					</div>

				<div className="flex items-center">
					<div className={`bg-white rounded-lg shadow-md p-6 w-full transition-all duration-500 ${tournament.final?.winner ? 'shadow-xl ring-2 ring-yellow-400' : ''}`}>
						<div className="text-xs text-gray-500 uppercase mb-4 text-center">
							Grand Final
						</div>
						<div className="space-y-3">
							<div className={`p-3 border-2 rounded text-center transition-all ${tournament.final ? getPlayerClass(tournament.final, 'player1') : 'bg-white border-gray-200 text-gray-800'}`}>
								{tournament.final?.player1 || "TBD"}
							</div>							<div className="text-center text-sm text-gray-400 font-semibold">VS</div>

							<div className={`p-3 border-2 rounded text-center transition-all ${tournament.final ? getPlayerClass(tournament.final, 'player2') : 'bg-white border-gray-200 text-gray-800'}`}>
								{tournament.final?.player2 || "TBD"}
							</div>
							</div>

						<div className="mt-4 pt-4 border-t border-gray-200">
						<div className="text-xs text-gray-500 mb-2">Champion:</div>

						{tournament.final?.winner ? (
								<div className="p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-lg text-center text-yellow-800 font-extrabold shadow-lg transform scale-105 animate-pulse">
									🏆 {getWinnerText(tournament.final)} 🏆
								</div>
								) : (
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