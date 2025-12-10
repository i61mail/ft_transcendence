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
	const [copied, setCopied] = useState(false);
	const manager = useglobalStore();
    const sentRef = useRef<boolean>(false);
	const router = useRouter();
	const params = useSearchParams();
	const code: string | null = params.get('code');
	const currId: number = manager.user?.id!;

    useEffect(() =>
    {
        if (manager.gameSocket && !sentRef.current)
        {
			console.log('params', params);
			const data: any = {id: currId, username: manager.user?.username , code: code};
            if (code)
				data.gameType = 'joinTournament';
			else
				data.gameType = "startTournament";

			const sendData = () => {
				if (manager.gameSocket?.readyState === WebSocket.OPEN) {
					manager.gameSocket.send(JSON.stringify(data));
					sentRef.current = true;
				} else if (manager.gameSocket?.readyState === WebSocket.CONNECTING) {
					// Wait for connection to open
					manager.gameSocket.addEventListener('open', () => {
						manager.gameSocket?.send(JSON.stringify(data));
						sentRef.current = true;
					}, { once: true });
				}
			};

			sendData();

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

	const handleCopyCode = async () => {
		try {
			await navigator.clipboard.writeText(tournament.code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#c8d5e8] via-[#bcc3d4] to-[#a8b0c5] relative py-8 px-4">
			{/* Animated Background Elements */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-blob top-0 -left-20"></div>
				<div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000 top-0 right-0"></div>
				<div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
				<div className="absolute w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-blob animation-delay-4000 bottom-20 right-20"></div>
			</div>

			<div className="max-w-6xl mx-auto relative z-10">
				{/* Header Card */}
				<div className="mb-8">
					<div className="backdrop-blur-xl bg-white/20 rounded-3xl p-6 shadow-2xl border-2 border-white/40 flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#a855f7] flex items-center justify-center shadow-lg">
								<span className="text-white font-bold text-xl">#</span>
							</div>
							<div>
								<p className="font-pixelify text-sm text-[#2d5a8a]/70 mb-1">Tournament Code</p>
								<div className="flex items-center gap-3">
									<p className="font-pixelify text-3xl font-bold text-[#2d5a8a] tracking-widest">
										{tournament.code}
									</p>
									<button
										onClick={handleCopyCode}
										className={`px-3 py-1.5 rounded-xl font-pixelify text-sm font-bold transition-all ${
											copied 
												? 'bg-green-400/30 text-green-700 border-2 border-green-400'
												: 'bg-white/30 text-[#2d5a8a] border-2 border-white/50 hover:bg-white/50'
										}`}
									>
										{copied ? 'Copied!' : 'Copy'}
									</button>
								</div>
							</div>
						</div>
						
						<div className="flex items-center gap-3">
							<div className={`px-4 py-2 rounded-2xl font-pixelify font-bold text-sm ${
								tournament.status === trnmtStatus.waiting 
									? 'bg-yellow-400/30 text-yellow-700 border-2 border-yellow-400/50' 
									: tournament.status === trnmtStatus.finished 
									? 'bg-green-400/30 text-green-700 border-2 border-green-400/50'
									: 'bg-blue-400/30 text-blue-700 border-2 border-blue-400/50'
							}`}>
								{statusString(tournament.status)}
							</div>
						</div>

						{tournament.host?.id === currId && (
							<button
								className="px-6 py-3 bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-pixelify font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
								onClick={handleDeleteTournament}
							>
								Delete Tournament
							</button>
						)}
					</div>
				</div>

				{/* Title */}
				<h1 className="font-pixelify text-5xl font-bold text-center text-[#2d5a8a] mb-10 drop-shadow-lg">
					Tournament Bracket
				</h1>

				{/* Tournament Bracket */}
				<div className="grid grid-cols-5 gap-6 items-center">
					
					{/* Semi-Finals Column */}
					<div className="col-span-2 space-y-8">
						{/* Semi-Final 1 */}
						<div className="backdrop-blur-xl bg-white/20 rounded-3xl p-6 shadow-2xl border-2 border-white/40 hover:bg-white/30 transition-all">
							<div className="flex items-center gap-2 mb-4">
								<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
									<span className="text-white font-bold text-sm">1</span>
								</div>
								<span className="font-pixelify text-sm text-[#2d5a8a]/70 uppercase tracking-wide">Semi-Final</span>
							</div>

							<div className="space-y-3">
								<div className={`p-4 rounded-2xl text-center transition-all font-pixelify font-bold ${
									tournament.semi?.[0]?.winner?.id === tournament.semi?.[0]?.player1?.id && tournament.semi?.[0]?.winner
										? 'bg-gradient-to-r from-green-400/30 to-emerald-400/30 border-2 border-green-400 text-green-700 shadow-lg'
										: tournament.semi?.[0]?.winner && tournament.semi?.[0]?.player1
										? 'bg-red-100/50 border-2 border-red-300 text-red-400 opacity-60'
										: 'bg-white/30 border-2 border-white/50 text-[#2d5a8a]'
								}`}>
									{tournament.semi?.[0]?.player1?.username || 'Waiting...'}
								</div>

								<div className="text-center font-pixelify text-lg text-[#2d5a8a]/50 font-bold">VS</div>

								<div className={`p-4 rounded-2xl text-center transition-all font-pixelify font-bold ${
									tournament.semi?.[0]?.winner?.id === tournament.semi?.[0]?.player2?.id && tournament.semi?.[0]?.winner
										? 'bg-gradient-to-r from-green-400/30 to-emerald-400/30 border-2 border-green-400 text-green-700 shadow-lg'
										: tournament.semi?.[0]?.winner && tournament.semi?.[0]?.player2
										? 'bg-red-100/50 border-2 border-red-300 text-red-400 opacity-60'
										: 'bg-white/30 border-2 border-white/50 text-[#2d5a8a]'
								}`}>
									{tournament.semi?.[0]?.player2?.username || 'Waiting...'}
								</div>
							</div>
						</div>

						{/* Semi-Final 2 */}
						<div className="backdrop-blur-xl bg-white/20 rounded-3xl p-6 shadow-2xl border-2 border-white/40 hover:bg-white/30 transition-all">
							<div className="flex items-center gap-2 mb-4">
								<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
									<span className="text-white font-bold text-sm">2</span>
								</div>
								<span className="font-pixelify text-sm text-[#2d5a8a]/70 uppercase tracking-wide">Semi-Final</span>
							</div>

							<div className="space-y-3">
								<div className={`p-4 rounded-2xl text-center transition-all font-pixelify font-bold ${
									tournament.semi?.[1]?.winner?.id === tournament.semi?.[1]?.player1?.id && tournament.semi?.[1]?.winner
										? 'bg-gradient-to-r from-green-400/30 to-emerald-400/30 border-2 border-green-400 text-green-700 shadow-lg'
										: tournament.semi?.[1]?.winner && tournament.semi?.[1]?.player1
										? 'bg-red-100/50 border-2 border-red-300 text-red-400 opacity-60'
										: 'bg-white/30 border-2 border-white/50 text-[#2d5a8a]'
								}`}>
									{tournament.semi?.[1]?.player1?.username || 'Waiting...'}
								</div>

								<div className="text-center font-pixelify text-lg text-[#2d5a8a]/50 font-bold">VS</div>

								<div className={`p-4 rounded-2xl text-center transition-all font-pixelify font-bold ${
									tournament.semi?.[1]?.winner?.id === tournament.semi?.[1]?.player2?.id && tournament.semi?.[1]?.winner
										? 'bg-gradient-to-r from-green-400/30 to-emerald-400/30 border-2 border-green-400 text-green-700 shadow-lg'
										: tournament.semi?.[1]?.winner && tournament.semi?.[1]?.player2
										? 'bg-red-100/50 border-2 border-red-300 text-red-400 opacity-60'
										: 'bg-white/30 border-2 border-white/50 text-[#2d5a8a]'
								}`}>
									{tournament.semi?.[1]?.player2?.username || 'Waiting...'}
								</div>
							</div>
						</div>
					</div>

					{/* Connector Lines */}
					<div className="col-span-1 flex flex-col items-center justify-center relative h-full min-h-[400px]">
						{/* Top bracket arm */}
						<div className="absolute top-[25%] left-0 w-1/2 h-0.5 bg-[#2d5a8a]/30"></div>
						<div className="absolute top-[25%] left-1/2 w-0.5 h-[25%] bg-[#2d5a8a]/30"></div>
						
						{/* Bottom bracket arm */}
						<div className="absolute bottom-[25%] left-0 w-1/2 h-0.5 bg-[#2d5a8a]/30"></div>
						<div className="absolute bottom-[25%] left-1/2 w-0.5 h-[25%] bg-[#2d5a8a]/30"></div>
						
						{/* Center horizontal line to final */}
						<div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-[#2d5a8a]/30 -translate-y-1/2"></div>
					</div>

					{/* Finals Column */}
					<div className="col-span-2">
						<div className={`backdrop-blur-xl bg-white/20 rounded-3xl p-8 shadow-2xl border-2 transition-all duration-500 ${
							tournament.final?.winner 
								? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)] bg-gradient-to-br from-yellow-50/30 to-amber-50/30' 
								: 'border-white/40 hover:bg-white/30'
						}`}>
							<div className="flex items-center justify-center gap-2 mb-6">
								<span className="font-pixelify text-lg text-[#2d5a8a] uppercase tracking-wide font-bold">Grand Final</span>
							</div>

							<div className="space-y-4">
								<div className={`p-4 rounded-2xl text-center transition-all font-pixelify font-bold text-lg ${
									tournament.final?.winner?.id === tournament.final?.player1?.id && tournament.final?.winner
										? 'bg-gradient-to-r from-green-400/30 to-emerald-400/30 border-2 border-green-400 text-green-700 shadow-lg'
										: tournament.final?.winner && tournament.final?.player1
										? 'bg-red-100/50 border-2 border-red-300 text-red-400 opacity-60'
										: 'bg-white/30 border-2 border-white/50 text-[#2d5a8a]'
								}`}>
									{tournament.final?.player1?.username || 'TBD'}
								</div>

								<div className="text-center font-pixelify text-xl text-[#2d5a8a]/50 font-bold">VS</div>

								<div className={`p-4 rounded-2xl text-center transition-all font-pixelify font-bold text-lg ${
									tournament.final?.winner?.id === tournament.final?.player2?.id && tournament.final?.winner
										? 'bg-gradient-to-r from-green-400/30 to-emerald-400/30 border-2 border-green-400 text-green-700 shadow-lg'
										: tournament.final?.winner && tournament.final?.player2
										? 'bg-red-100/50 border-2 border-red-300 text-red-400 opacity-60'
										: 'bg-white/30 border-2 border-white/50 text-[#2d5a8a]'
								}`}>
									{tournament.final?.player2?.username || 'TBD'}
								</div>
							</div>

							{/* Champion Display */}
							<div className="mt-6 pt-6 border-t-2 border-[#2d5a8a]/10">
								<div className="font-pixelify text-sm text-[#2d5a8a]/70 mb-3 text-center uppercase tracking-wide">Champion</div>
								{tournament.final?.winner ? (
									<div className="p-5 bg-gradient-to-r from-yellow-300/50 via-amber-300/50 to-yellow-300/50 border-2 border-yellow-400 rounded-2xl text-center shadow-lg animate-pulse">
										<span className="font-pixelify text-2xl font-extrabold text-yellow-700">
											{getWinnerText(tournament.final)}
										</span>
									</div>
								) : (
									<div className="p-4 bg-white/20 border-2 border-dashed border-[#2d5a8a]/30 rounded-2xl text-center">
										<span className="font-pixelify text-lg text-[#2d5a8a]/50">Awaiting Champion...</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Info Card */}
				<div className="mt-10 backdrop-blur-xl bg-white/20 rounded-3xl p-6 shadow-2xl border-2 border-white/40">
					<h3 className="font-pixelify text-xl font-bold text-[#2d5a8a] mb-4">
						Tournament Info
					</h3>
					<ul className="font-pixelify text-sm text-[#2d5a8a]/80 space-y-2">
						<li className="flex items-center gap-2">
							<span className="w-2 h-2 bg-blue-400 rounded-full"></span>
							Share the tournament code with friends to let them join
						</li>
						<li className="flex items-center gap-2">
							<span className="w-2 h-2 bg-purple-400 rounded-full"></span>
							Tournament starts automatically when 4 players have joined
						</li>
						<li className="flex items-center gap-2">
							<span className="w-2 h-2 bg-green-400 rounded-full"></span>
							Winners advance to the Grand Final
						</li>
					</ul>
				</div>
			</div>
		</div>
  );
}