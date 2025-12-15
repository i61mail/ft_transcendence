import { trnmtStatus, TournamentData, Match, SanitizedTournamentData, SanitizedMatch } from '../types/tournaments.types';
import { GameMode } from '../types/pong.types';
import { PongGame, pongOnline } from './pong';
import { playerInfo } from '../types/playerInfo.types';
import { WebSocket } from 'ws';
import { FastifyInstance } from 'fastify';
import { Socket } from 'dgram';
import { Server } from 'http';
import { sendNotification } from '../controllers/socket.controller';

const tournaments: Map<string, Tournament> = new Map<string, Tournament>();

class Tournament
{
    static server: FastifyInstance | null;
    tData: TournamentData =
    {
        host: null,
        code: "",
        status: trnmtStatus.waiting,
        semi: [
        {
            player1: null,
            player2: null,
            winner: null
        },
        {
            player1: null,
            player2: null,
            winner: null
        }
        ],
        final: {
            player1: null,
            player2: null,
            winner: null
        }
    };

    constructor(code: string)
    {
        this.tData.code = code;
    }

    set host(player: playerInfo)
    {
        this.tData.host = player;
    }

    forEachPlayer(func: (player: playerInfo) => void)
    {
        if (this.tData.semi[0].player1)
            func(this.tData.semi[0].player1);
        if (this.tData.semi[0].player2)
            func(this.tData.semi[0].player2);
        if (this.tData.semi[1].player1)
            func(this.tData.semi[1].player1);
        if (this.tData.semi[1].player2)
            func(this.tData.semi[1].player2);
        if (this.tData.final.player1)
            func(this.tData.final.player1);
        if (this.tData.final.player2)
            func(this.tData.final.player2);
    }

    playersHas(pos: number) : boolean
    {
        switch (pos)
        {
            case 0:
                return this.tData.semi[0].player1 != null;
            case 1:
                return this.tData.semi[0].player2 != null;
            case 2:
                return this.tData.semi[1].player1 != null;
            case 3:
                return this.tData.semi[1].player2 != null;
        }
        return (false);
    }
    
    isPlayersFull() : boolean
    {
        for (let i = 0; i < 4; i++)
            if (!this.playersHas(i)) return (false);
        return (true);
    }

    set newPlayer(player: playerInfo)
    {
        let rand: number = Math.floor(Math.random() * 4);
    
        for (; this.playersHas(rand); rand = (rand + 1) % 4);
    
        switch (rand)
        {
            case 0:
                this.tData.semi[0].player1 = player;
                break;
            case 1:
                this.tData.semi[0].player2 = player;
                break;
            case 2:
                this.tData.semi[1].player1 = player;
                break;
            case 3:
                this.tData.semi[1].player2 = player;
                break;
        }
    }

    playerListener(player: playerInfo)
    {
        player.socket.onmessage = (msg) =>
        {
            const data = JSON.parse(msg.data.toString());

            if (data.action == 'delete' && player.id == this.tData.host!.id)
            {
                this.tData.status = trnmtStatus.close;
                this.broadcastTournamentData();
                this.closeTournament();
            }
            else if (data.gameType != undefined)
            {
                startTournament(player, Tournament.server!);
                this.broadcastTournamentData();
            }
            else
                this.broadcastTournamentData();
        };
    }

    addPlayer(player: playerInfo): boolean
    {
        let doesExist: boolean = false;
        this.forEachPlayer((currPlayer: playerInfo) =>
        {
            if (player.id == currPlayer.id)
            {
                doesExist = true;
                currPlayer.socket = player.socket;
                this.playerListener(currPlayer);
            }
        });
        if (doesExist)
        {
            this.broadcastTournamentData();
            return (true);
        }
        if (this.tData.status != trnmtStatus.waiting)
            return (false);
        
        this.newPlayer = player;
        this.playerListener(player);
        if (this.isPlayersFull())
        {
            this.tData.status = trnmtStatus.startingSemi;
            
            this.forEachPlayer((player: playerInfo)=>
            {
                sendNotification(Tournament.server!, player.id);
            });

            setTimeout(() => 
            {
                this.startSemiGame();
            }, 3000);
        }
        this.broadcastTournamentData();
        return (true);
    }

    interval(winner: number, match: Match, intervalId: NodeJS.Timeout)
    {
        // Check if either player disconnected (socket closed) - treat as forfeit
        const p1Disconnected = match.player1?.socket.readyState !== WebSocket.OPEN;
        const p2Disconnected = match.player2?.socket.readyState !== WebSocket.OPEN;
        
        // If one player disconnected, the other wins
        if (p1Disconnected && !p2Disconnected) {
            match.winner = match.player2;
            clearInterval(intervalId);
            this.safeSend(match.player2?.socket);
            return;
        }
        if (p2Disconnected && !p1Disconnected) {
            match.winner = match.player1;
            clearInterval(intervalId);
            this.safeSend(match.player1?.socket);
            return;
        }
        // If both disconnected, just pick player1 as winner to end the match
        if (p1Disconnected && p2Disconnected) {
            match.winner = match.player1;
            clearInterval(intervalId);
            return;
        }

        if (winner == 0)
            return ;
        if (winner == 1)
            match.winner = match.player1;
        else
            match.winner = match.player2;
        this.safeSend(match.player1?.socket);
        this.safeSend(match.player2?.socket);
        clearInterval(intervalId);
    }

    // Helper to safely send data to a socket
    safeSend(socket: WebSocket | undefined)
    {
        if (socket && socket.readyState === WebSocket.OPEN) {
            try {
                socket.send(this.socketData);
            } catch (err) {
                console.error("Error sending to socket:", err);
            }
        }
    }

    playGame(player: playerInfo)
    {
        let playerPos = 0;
        let counter = 0;
        this.forEachPlayer((currPlayer: playerInfo) =>
        {
            if (player.id == currPlayer.id)
            {
                currPlayer.socket = player.socket;
                playerPos = counter;
            }
            else
                counter++;
        });

        if (this.tData.status == trnmtStatus.playingSemi)
        {
            if 
            (
                playerPos <= 1
                && this.tData.semi[0].winner == null
                && this.tData.semi[0].player1?.socket.readyState == WebSocket.OPEN
                && this.tData.semi[0].player2?.socket.readyState == WebSocket.OPEN
            )
                this.startGame(this.tData.semi[0]);
            else if
            (
                (playerPos == 2 || playerPos == 3)
                && this.tData.semi[1].winner == null
                && this.tData.semi[1].player1?.socket.readyState == WebSocket.OPEN
                && this.tData.semi[1].player2?.socket.readyState == WebSocket.OPEN
            )
                this.startGame(this.tData.semi[1]);
        }
        else if
        (
            this.tData.status == trnmtStatus.playingFinal
            && this.tData.final.winner == null
            && this.tData.final.player1?.socket.readyState == WebSocket.OPEN
            && this.tData.final.player2?.socket.readyState == WebSocket.OPEN
        )
        {

            this.startGame(this.tData.final);
        }
    }

    startGame(match: Match)
    {
        const game: PongGame = pongOnline(
            match.player1!,
            match.player2!,
            Tournament.server!
        );
        const intervalId: NodeJS.Timeout = setInterval(()=>
        {
            this.interval(game.winner, match, intervalId);
        }, 1100);
    }

    startSemiGame()
    {
        this.tData.status = trnmtStatus.playingSemi;
        this.broadcastTournamentData();
        this.forEachPlayer((player: playerInfo)=>
        {
            player.socket.close();
        });

        const intervalId: NodeJS.Timeout = setInterval(() =>
        {
            if (this.tData.semi[0].winner != null
                && this.tData.semi[1].winner != null)
            {
                this.tData.status = trnmtStatus.startingFinal;
                this.forEachPlayer((player: playerInfo)=>
                {
                    sendNotification(Tournament.server!, player.id);
                });
                this.tData.final.player1 = this.tData.semi[0].winner;
                this.tData.final.player2 = this.tData.semi[1].winner;
                this.broadcastTournamentData();
                this.forEachPlayer((player: playerInfo) =>
                {
                    startTournament(player, Tournament.server!);
                });
                clearInterval(intervalId);
                setTimeout(() => {this.startFinaleGame()}, 6000);
            }
        }, 1000);
    }

    closeTournament()
    {
        tournaments.delete(this.tData.code);
        this.forEachPlayer((player: playerInfo) =>
        {
            playersInTournaments.delete(player.id);
        });
        
    }

    startFinaleGame()
    {
        this.tData.status = trnmtStatus.playingFinal;
        this.broadcastTournamentData();
        this.tData.final.player1?.socket.close();
        this.tData.final.player2?.socket.close();
    
        const intervalId: NodeJS.Timeout = setInterval(()=>
        {
            if (this.tData.final.winner != null)
            {
                this.tData.status = trnmtStatus.finished;
                this.forEachPlayer((player: playerInfo) =>
                {
                    startTournament(player, Tournament.server!);
                });
                this.broadcastTournamentData();
                clearInterval(intervalId);
                setTimeout(() => this.closeTournament(), 10000);
           }
        }, 1000);
    }

    get socketData(): string
    {
        const sanitizePlayer = (p?: playerInfo | null) =>
            p ? { id: p.id, username: p.username } : null;

        const sanitizeMatch = (m: Match): SanitizedMatch => ({
            player1: sanitizePlayer(m.player1),
            player2: sanitizePlayer(m.player2),
            winner: sanitizePlayer(m.winner),
        });

        const sanitizedData: SanitizedTournamentData = {
            host: sanitizePlayer(this.tData.host),
            code: this.tData.code,
            status: this.tData.status,
            semi: this.tData.semi.map(sanitizeMatch),
            final: sanitizeMatch(this.tData.final),
        };

        return (JSON.stringify(sanitizedData));
    }

    broadcastTournamentData()
    {
        this.forEachPlayer((player: playerInfo) =>
        {
            this.safeSend(player.socket);
        });
    }
}

export function generateCode(): string
{
    const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length: number = 6;
    let code: string = '';
    
    for (let i = 0; i < length; i++)
    {
        code += characters[Math.floor(Math.random() * characters.length)];
    }
    if (tournaments.has(code))
        return (generateCode())
    return (code);
}

const playersInTournaments: Map<number, string> = new Map<number, string>();

function findPlayer(player: playerInfo): boolean
{
    const code: string | null = playersInTournaments.get(player.id) ?? null;

    if (!player.socket)
        return (true);
    if (code && tournaments.has(code))
    {
        tournaments.get(code)?.addPlayer(player);
        return (true);
    }
    return (false);
}

export function startTournament(host: playerInfo, server: FastifyInstance)
{
    if (findPlayer(host))
        return ;
    const code: string = generateCode();

    if (Tournament.server == null)
        Tournament.server = server;
    tournaments.set(code, new Tournament(code));
    tournaments.get(code)!.host = host;
    joinTournament(host, code);
    
}

export function joinTournament(player: playerInfo, code: string)
{
    if (findPlayer(player))
        return ;
    playersInTournaments.set(player.id, code);
    const currTournament: Tournament | undefined = tournaments.get(code);
    if (currTournament == undefined)
    {
        player.socket.send(JSON.stringify({error: "invalid code"}));
    }
    else if (!currTournament.addPlayer(player))
    {
        player.socket.send(JSON.stringify({error: "tournament started"}));
    }
}

export function playTournament(player: playerInfo)
{
    const currCode: string | undefined = playersInTournaments.get(player.id);
    
    if (currCode == undefined)
    {
        player.socket.send(JSON.stringify({error: "player is not registered in any tournament"}));
        return ;
    }

    const currTournament: Tournament | undefined = tournaments.get(currCode);

    if (currTournament == undefined)
    {
        player.socket.send(JSON.stringify({error: "the tournament has beend deleted"}));
        return ;
    }
    currTournament.playGame(player);
}