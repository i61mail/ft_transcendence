import { trnmtStatus, TournamentData, Match, SanitizedTournamentData, SanitizedMatch } from '../types/tournaments.types';
import { GameMode } from '../types/pong.types';
import { PongGame, pongOnline } from './pong';
import { playerInfo } from '../types/playerInfo.types';
import { WebSocket } from 'ws';
import { FastifyInstance } from 'fastify';
import { Socket } from 'dgram';
import { Server } from 'http';

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

            console.log("action:", data.action);
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
            console.log("player", player.id, player.username, "does exist");
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
        console.log('winner:', winner, 'player1:', match.player1?.id, 'player2:', match.player2?.id);
        if (winner == 0)
            return ;
        if (winner == 1)
            match.winner = match.player1;
        else
            match.winner = match.player2;
        clearInterval(intervalId);
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
        }, 1000);
    }

    startSemiGame()
    {
        this.tData.status = trnmtStatus.playingSemi;
        this.broadcastTournamentData();
        
        this.startGame(this.tData.semi[0]);
        this.startGame(this.tData.semi[1]);

        const intervalId: NodeJS.Timeout = setInterval(() =>
        {
            console.log('semi finale:', this.tData.semi[0].winner != null, this.tData.semi[1].winner != null);
            if (this.tData.semi[0].winner != null
                && this.tData.semi[1].winner != null
            )
            {
                this.tData.status = trnmtStatus.startingFinal;

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
        this.startGame(this.tData.final);
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

    broadcastTournamentData()
    {
        // Create a sanitized version without socket properties to avoid circular references
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

        const data: string = JSON.stringify(sanitizedData);

        this.forEachPlayer((player: playerInfo) =>
        {
            player.socket.send(data);
        });
    }
}

function generateCode(): string
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
    {
        console.log("no socket is open");
        return (true);
    }
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

    playersInTournaments.set(host.id, code);
    if (Tournament.server == null)
        Tournament.server = server;
    tournaments.set(code, new Tournament(code));
    tournaments.get(code)!.host = host;
    joinTournament(host, code);
    
}

export function joinTournament(player: playerInfo, code: string) // maybe return true or false to show that is not possible to join
{
    if (findPlayer(player))
        return ;
    playersInTournaments.set(player.id, code);
    if (!tournaments.has(code))
    {
        player.socket.send("invalid code");
        console.log("tournament doesnt exist");
    }
    else if (!tournaments.get(code)?.addPlayer(player))
    {
        player.socket.send("tournament started");
        console.log("tournament already started");
    }
    else
        console.log("tournament joined successfully");
}