'use client'

import { PlayerIndex } from '@/lib/pong/interfaces';
import useglobalStore from '@/store/globalStore';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

interface playerInfo
{
    id: number;
    socket: WebSocket;
    username: string;
}

enum trnmtStatus
{
    waiting,
    startingSemi,
    playingSemi,
    startingFinal,
    playingFinal,
    finished,
	close
}

export interface Player
{
    id: playerInfo['id'];
    username: playerInfo['username'];
}

export interface Match
{
    player1: Player | null;
    player2: Player | null;
    winner: Player | null;
}

export interface TournamentData
{
    host: Player | null;
    code: string;
    status: trnmtStatus;
    semi: Match[];
    final: Match;
}

const initialTournament: TournamentData =
{
	host: null,
	code: "------",
  	status: trnmtStatus.waiting,
  	semi: [
		{ player1: null, player2: null, winner: null },
		{ player1: null, player2: null, winner: null },
  	],
  	final: { player1: null, player2: null, winner: null },
};


export default function PongTournament()
{
	const [tournament, setTournament] = useState<TournamentData>(initialTournament);
	const manager = useglobalStore();
    const sentRef = useRef<boolean>(false);
	const router = useRouter();
	const params = useSearchParams();
	const code: string | null = params.get('code');
	const currId: number = manager.user?.id!;

    useEffect(() =>
    {
		setTimeout(()=>manager.setTournamentNotification(false), 300);
        if (manager.gameSocket && !sentRef.current)
        {
			let data: any = {id: currId, username: manager.user?.username , code: code};
            if (code)
				data.gameType = 'joinTournament';
			else
				data.gameType = "startTournament";

			console.log("data:", data);
            manager.gameSocket.send(JSON.stringify(data));
            sentRef.current = true;
            manager.gameSocket.onmessage = (msg) =>
            {
				if (msg.data == "finished")
					return ;
				const state: any = JSON.parse(msg.data.toString());
				if (state.code == undefined)
					return ;
				console.log("joined tournament:", state.code);
				if (state.status == trnmtStatus.playingSemi
					|| (state.status == trnmtStatus.playingFinal
						&& (state.final.player1!.id == currId || state.final.player2!.id == currId))
					)
				{
					router.push('/games/tournament/play');
				}
				else if (state.status == trnmtStatus.close)
				{
					window.alert(
						"🏁 Tournament Closed\n\n" +
						"The tournament has been closed by the host. You will be redirected to the Games page.\n\n" +
						"Thanks for playing! 🎮"
					);
					router.push('/games');
				}
				else
					setTournament(state);
            }
        }
    }, [manager.gameSocket])

	const statusString = (status: trnmtStatus): string =>
	{
		switch (status) {
			case trnmtStatus.waiting:
				return "Waiting";
			case trnmtStatus.startingSemi:
				return "Starting Semi-Finals";
			case trnmtStatus.playingSemi:
				return "Semi-Finals - Playing";
			case trnmtStatus.startingFinal:
				return "Starting Final";
			case trnmtStatus.playingFinal:
				return "Final - Playing";
			case trnmtStatus.finished:
				return "Finished";
			default:
				return "Unknown";
		}
	}

	const getPlayerClass = (winner: Player | null, player: Player | null): string =>
	{
		if (!winner || !player) return "bg-white border-gray-200 text-gray-800";

		if (player.id != -1 && winner.id == player.id)
			return "bg-green-50 border-green-500 text-green-700 font-bold shadow-sm";

		return "bg-red-50 border-red-300 text-red-400 opacity-60";
	};

	const getWinnerText = (match: Match): string =>
	{
		if (!match.winner) return "TBD";
		return match.winner.username;
	};

	const handleDeleteTournament = () =>
	{
		manager.gameSocket?.send(JSON.stringify({id: currId, action: "delete"}));
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
						<p className="text-2xl font-bold text-gray-800 font-mono">{statusString(tournament.status)}</p>
						{(() =>
						{
							if (tournament.host?.id === currId)
							{
								return (
									<button
										className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition"
										onClick={handleDeleteTournament}
									>
										Delete the tournament
									</button>
								);
							}
							else
							{
								return (
									<div/>
								);
							}
						})()}
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
								<div className={`p-3 border-2 rounded text-center transition-all ${tournament.semi?.[0] ? getPlayerClass(tournament.semi[0].winner, tournament.semi[0].player1) : 'bg-white border-gray-200 text-gray-800'}`}>
									{tournament.semi?.[0]?.player1?.username || '-'}
								</div>

								<div className="text-center text-sm text-gray-400 font-semibold">VS</div>

								<div className={`p-3 border-2 rounded text-center transition-all ${tournament.semi?.[0] ? getPlayerClass(tournament.semi[0].winner, tournament.semi[0].player2) : 'bg-white border-gray-200 text-gray-800'}`}>
									{tournament.semi?.[0]?.player2?.username || '-'}
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg shadow-md p-6">
							<div className="text-xs text-gray-500 uppercase mb-4 text-center">
								Semi-Final 2
							</div>

							<div className="space-y-3">
								<div className={`p-3 border-2 rounded text-center transition-all ${tournament.semi?.[1] ? getPlayerClass(tournament.semi[1].winner, tournament.semi[1].player1) : 'bg-white border-gray-200 text-gray-800'}`}>
									{tournament.semi?.[1]?.player1?.username || '-'}
								</div>

								<div className="text-center text-sm text-gray-400 font-semibold">VS</div>

								<div className={`p-3 border-2 rounded text-center transition-all ${tournament.semi?.[1] ? getPlayerClass(tournament.semi[1].winner, tournament.semi[1].player2) : 'bg-white border-gray-200 text-gray-800'}`}>
									{tournament.semi?.[1]?.player2?.username || '-'}
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
							<div className={`p-3 border-2 rounded text-center transition-all ${tournament.final ? getPlayerClass(tournament.final.winner, tournament.final.player1) : 'bg-white border-gray-200 text-gray-800'}`}>
								{tournament.final?.player1?.username || "TBD"}
							</div>							<div className="text-center text-sm text-gray-400 font-semibold">VS</div>

							<div className={`p-3 border-2 rounded text-center transition-all ${tournament.final ? getPlayerClass(tournament.final.winner, tournament.final.player2) : 'bg-white border-gray-200 text-gray-800'}`}>
								{tournament.final?.player2?.username || "TBD"}
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